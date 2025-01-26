from celery import shared_task
from django.apps import apps
from mt5.signals import trade_closed
from state.models import Statistic
from django.utils import timezone
from django.db.models import Sum
from mt5.models import Deal, Order
from message.models import Message
from .models import *
from django.db.models import Sum

def updateBalance(user,trade ):
    stat=Statistic.objects.get(user=user)
    stat.balance += trade.profit + trade.swap - trade.commission
    stat.save(update_fields=['balance'])

def get_user_trade_margins(user,symbols):
    result = 0
    for symbol in symbols:
        buy_margin = Trade.objects.filter(user=user, symbol=symbol, type='buy', state='open').aggregate(total_buy_margin=Sum('margin'))['total_buy_margin'] or 0
        sell_margin = Trade.objects.filter(user=user, symbol=symbol, type='sell',state='open').aggregate(total_sell_margin=Sum('margin'))['total_sell_margin'] or 0
        largest_margin = max(buy_margin, sell_margin)
        result += largest_margin
    
    return result



def update_user_statistics(user, statistic):
    symbols = Pairs.objects.all()
    if len(symbols) > 0:
        trades = Trade.objects.filter(state='open', user=user)
        if len(trades) > 0:
            margin = get_user_trade_margins(user,symbols)
            if statistic is not None:
                this_balance = statistic.balance
                _total = trades.aggregate(
                    total_profit=Sum('profit'),
                    total_swap=Sum('swap'),
                    total_commission=Sum('commission')
                )
                total_profit = _total['total_profit'] or 0
                total_swap = _total['total_swap'] or 0
                total_commission = _total['total_swap'] or 0

                equity = this_balance + total_profit + total_swap - total_commission
                free_margin = equity - margin

                statistic.equity = equity
                statistic.free_margin = free_margin
                statistic.margin = margin
                statistic.margin_level = 0

                if margin > 0:
                    statistic.margin_level = (equity / margin) * 100

                statistic.save(update_fields=['equity', 'free_margin', 'margin', 'margin_level'])
        else:
            balance = statistic.balance
            statistic.equity = balance
            statistic.free_margin = balance
            statistic.margin = 0
            statistic.margin_level = 0
            statistic.save(update_fields=['equity', 'free_margin', 'margin', 'margin_level'])

    else:
        statistic.equity = statistic.balance
        statistic.free_margin = statistic.balance
        statistic.margin = 0
        statistic.margin_level = 0
        statistic.save(update_fields=['equity', 'free_margin', 'margin', 'margin_level'])

def update_trades(trade, mt5):
    ticket = trade.ticket
    symbol = trade.symbol
    info = mt5.position_info({'ticket':ticket})
    stat =Statistic.objects.get(user = trade.user)
    if not isinstance(info, str):
        info = info._asdict()
        total_swap=0
        if info['swap']>0:
            swap_ratio = float(symbol.swap_buy_ratio) if trade.type == 'buy' else float(symbol.swap_sell_ratio)
            swap_value = symbol.swap_buy if trade.type == 'buy' else symbol.swap_sell
            total_swap = (info['swap'] * swap_ratio + swap_value ) * float(stat.swap_off_ratio)
            trade.swap = total_swap 
        else:    
            trade.swap = 0
        trade.profit = info['profit']  
        trade.current = info['price_current']
        trade.save(update_fields=['current', 'profit', 'swap'])

@shared_task
def send_trade_price():
    # try:
        if not apps.ready:
            return
        
        from account.models import User
        from mt5.models import Trade, Margin
        from mt5.tasks import Mt5Task
        from state.models import Statistic
        mt5 = Mt5Task()
        
        trades = Trade.objects.filter(state='open')
        users = User.objects.all()
        statics = Statistic.objects.all()
        symbols = Pairs.objects.all()
        for user in users:
            this_static = statics.filter(user=user)
            if len(this_static) > 0 :
                this_static = statics.filter(user=user).first()
                update_user_statistics(user, this_static)

        for trade in trades:
            update_trades(trade, mt5)

        # check margin and balance
        for stat in statics:
            user = stat.user
            margin = Margin.objects.first()

            call_margin = stat.margin_level< margin.callmargin_level
            # if stat.equity is not None and margin.min_balance is not None and margin.free_margin_ratio is not None:
            #     call_margin = (stat.equity * margin.min_balance) - margin.free_margin_ratio < 0
            if call_margin:
                trades = Trade.objects.filter(state='open', user=user).order_by('profit')
                if len(trades) <=0:
                    call_margin = False
            while call_margin:
                trades = Trade.objects.filter(state='open', user=user).order_by('profit')
                for trade in trades:
                    try:
                        symbol = trade.symbol
                        result, deals, orders = mt5.close_single(symbol.name, trade.ticket)
                        if result:
                            trade.state = 'close'
                            trade.profit = deals[-1].profit
                            trade.exit = deals[-1].price
                            trade.save(update_fields=['state', 'profit', 'exit'])
                            updateBalance(user,trade)
                            for i, deal in enumerate(deals):
                                type = 'buy' if deal.type == 0 else 'sell'
                                Deal.objects.create(
                                    user=user,
                                    symbol=symbol,
                                    price=deal.price,
                                    ticket=deal.ticket,
                                    trade_id=deal.position_id,
                                    type=type,
                                    dir='in' if type == trade.type else 'out',
                                    unit=trade.unit,
                                    leverage=trade.leverage or '',
                                    time=timezone.now() if i == 0 else trade.time,
                                    profit=deal.profit,
                                    commission=deal.commission
                                )
                            Order.objects.create(
                                user=user,
                                symbol=symbol,
                                price=orders[-1].price_current,
                                type='close ' + trade.type,
                                ticket=orders[-1].ticket,
                                trade_id=orders[-1].position_id,
                                unit=trade.unit,
                                leverage=trade.leverage,
                                result='filled',
                                time=timezone.now()
                            )
                            trade_closed.send(sender=user.__class__, request=None, user=user, trade=trade)
                    except Exception as e:
                        print(e)
                    _ = Message.objects.create(
                        user=user,
                        code='99'
                    )
                    update_trades(trade, mt5)
                    update_user_statistics(user, stat)
# 
                # if stat.equity is not None and margin.min_balance is not None and margin.free_margin_ratio is not None:
                #     call_margin = (stat.equity * margin.min_balance) - margin.free_margin_ratio < 0
                # else:
                #     call_margin = False
                call_margin = stat.margin_level< margin.callmargin_level

                if not call_margin:
                    break
                    

    # except Exception as e:
    #      print(f"Error in send_trade_price task: ",str(e))

@shared_task
def send_symbol_price():
    try:
        if not apps.ready:
            return
        from account.models import User
        from mt5.models import Pairs
        from mt5.tasks import Mt5Task
        mt5 = Mt5Task()
        
        # get pairs
        pairs = Pairs.objects.all()
        for pair in pairs:
            info = mt5.get_symbol_info(pair.name)

            if info:
                pair.ask = round(info['ask'], pair.digits)
                pair.bid =round(info['bid'], pair.digits) 
                pair.high =round(info['askhigh'], pair.digits)  
                pair.low =round(info['bidlow'], pair.digits)  
                pair.save(update_fields=['ask','bid','high','low', 'last_update'])
                
    except Exception as e:
        print(f'Error in send_symbol_price task: ',str(e))


@shared_task
def update_future_trades():
    if apps.ready:
        from account.models import User
        from mt5.models import Trade, FutureTrades, Order
        from mt5.tasks import Mt5Task
        mt5 = Mt5Task()
        
        futures = FutureTrades.objects.all()
        for future in futures:
            user = future.user
            go4trade = False
            symbol = future.symbol
            symbol_inf = mt5.get_symbol_info(symbol.name)
            trade_price=0
            user_lot=future.unit
            if future.type =='buy':
                trade_price = symbol_inf['ask']
            else:
                trade_price = symbol_inf['bid']
            if future.type == "buy":
                if abs(symbol.ask - future.entry) < symbol.step * 5:
                    go4trade=True
            else:
                if abs(symbol.bid - future.entry) < symbol.step * 5:
                    go4trade=True

            stat = Statistic.objects.get(user=user)
            account=MT5Account.objects.first()
            # if stat.balance < future.unit*(symbol.max_balance/future.leverage) :
            data = {}
            data['price'] = 0
            data['unit'] =  round(future.unit * symbol.min_unit  ,2)
            data['symbol_name'] = symbol.name
            data['type'] = future.type
            data['leverage'] = future.leverage
            data['sl'] = future.sl
            data['tp'] = future.tp
            data['id'] = future.user.id
            user_lot = future.unit
            margin =   data['unit']  *(symbol.max_balance / data['leverage']) * symbol.contract_size
            if stat.free_margin < margin * data['unit'] + float(symbol.margin_varianc) :
                future.delete()
                _ = Message.objects.create(
                    user=user,
                    trade=trade,
                    countent='not enough balance',
                    code="6"
                )
                return
            if go4trade:
                result, deal = mt5.trade(data)
                future.delete()    
                if not deal:
                    return
                ticket = result.order
                # unit * [Price_sell *commissin_sell_ratio + commission_sell]*off  
                commission_ratio = float(symbol.commission_buy_ratio) if data['type']=='buy' else float(symbol.commission_sell_ratio)
                fixed_commission = symbol.commission_buy if data['type']=='buy' else symbol.commission_sell
                commission = user_lot *((commission_ratio * result.price) + fixed_commission  ) * float(stat.commission_off_ratio)
                # margin =  (data['unit']  *result.price * symbol.contract_size) /account.leverage 
                try:
                    ticket = result.order
                    if ticket == 0:
                        return
                    # update database for orders trades and statistic
                    Order.objects.create(
                        user=user,
                        symbol=symbol,
                        margin=margin,
                        price=result.price,
                        type='enter '+data['type'],
                        ticket=result.order,
                        trade_id=ticket,
                        unit=user_lot,
                        leverage=data['leverage'],
                        result='filled',
                        time=timezone.now()
                    )
                    trade = Trade.objects.create(
                        user=user,
                        symbol=symbol,
                        commission=commission,
                        margin=margin,
                        entry=result.price,
                        ticket=ticket,
                        type=data['type'],
                        unit=user_lot,
                        leverage=data['leverage'],
                        sl=data['sl'],
                        tp=data['tp'],
                        state='open',
                        time=timezone.now()
                    )                    
                    _ = Message.objects.create(
                        user=user,
                        trade=trade,
                        code="1"
                    )

                except Exception as e:
                    print(e)
                    return


@shared_task
def close_trade(trade_id): 
    if apps.ready:
        from account.models import User
        from mt5.models import Trade, Deal, Order
        from mt5.tasks import Mt5Task
        mt5 = Mt5Task()
        
        trade = Trade.objects.get(pk=trade_id)
        ticket = trade.ticket
        user = trade.user
        symbol = trade.symbol

        info = mt5.position_info({'ticket':ticket})
        if not isinstance(info, str):
            mt5.close_single(symbol.name, ticket)
        
        deals, success = mt5.get_deal(ticket)
        if success:
            trade.state = 'close'
            trade.profit = deals[-1].profit
            trade.exit = deals[-1].price
            trade.save(update_fields=['state', 'profit', 'exit'])
            updateBalance(user,trade)
            # check margin and balance
            trade_closed.send(sender=None, request=None, user=trade.user, trade=trade)

            # create deals
            for deal in deals:
                type = 'buy' if deal.type==0 else 'sell'
                Deal.objects.create(
                        user=user,
                        symbol=symbol,
                        price=deal.price,
                        ticket=deal.ticket,
                        trade_id = deal.position_id,
                        type=type,
                        dir = 'in' if type==trade.type else 'out',
                        unit=deal.volume,
                        leverage=trade.leverage or '',
                        time=timezone.now(),
                        profit=deal.profit,
                        commission = deal.commission
                    )
                
        orders, success = mt5.get_order(ticket)
        if success:
            Order.objects.create(
                user=user,
                symbol=symbol,
                price=orders[-1].price_current,
                type='admin action',
                ticket=orders[-1].ticket,
                trade_id=orders[-1].position_id,
                unit=orders[-1].volume_initial,
                leverage=trade.leverage,
                result='filled',
                time=timezone.now()
            )

