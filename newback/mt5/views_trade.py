from datetime import datetime
from django.utils import timezone
from rest_framework import viewsets, status
from rest_framework.response import Response
from .models import Off, Pairs, Trade, Order, Deal, FutureTrades
from account.oauth import verify_token
from .serializers import *
from .tasks import Mt5Task
from account.models import User
from .signals import trade_closed, poursant
from state.models import Statistic
from message.models import Message
from message.serializers import MessageResultSerializer
import os
from .models import MT5Account
import MetaTrader5 as MT5
from .celery_task import send_trade_price
mt5 = Mt5Task()

def updateBalance(user,trade ):
    stat=Statistic.objects.get(user=user)
    stat.balance += trade.profit + trade.swap - trade.commission
    stat.save(update_fields=['balance'])

    

class Mt5ViewSet(viewsets.ViewSet):
    def account(self, request, account:str):
        """
        get account info
        """
        account_info = mt5.account_info(account)
        if account_info:
            return Response(account_info, status=status.HTTP_200_OK)
        return Response({'message':"error getting account info"}, status=status.HTTP_409_CONFLICT)
    
    def symbol(self, request, account:str, symbol:str):
        """
        get symbol info
        """
        info = mt5.get_symbol_info(symbol, account)
        try:
            return Response(info, status=status.HTTP_200_OK)
        except:
            return Response({"message":"error loading symbol info"}, status=status.HTTP_409_CONFLICT)
    
    def trade(self, request):
        """
        trade a symbol with the data received
        """
        print(request.data)
        payload, error_response = verify_token_from_request(request)
        if error_response:
            return error_response
       
        serializer = TradeSerializer(data=request.data)
        if serializer.is_valid(raise_exception=True):
            data = serializer.validated_data
            
            try:
                user = User.objects.get(pk=payload['id'])
                symbol = Pairs.objects.get(pk=data['symbol'])
                stat = Statistic.objects.get(user=user)
                # account=MT5Account.objects.first()
                # sys_margin = Margin.objects.all().first()
            except:
                return Response({"message":"traded failed", 'error':'user or symbol not found'}, status=status.HTTP_404_NOT_FOUND)
            
            if data['leverage'] >(symbol.max_balance/symbol.min_balance) :
                return Response({"message":"traded failed", 'error':'leverage must be less than '+str(symbol.max_balance/symbol.min_balance)}, status=status.HTTP_406_NOT_ACCEPTABLE)
                
            # if stat.free_margin * symbol.call_margin_ratio - data['unit']*((symbol.max_balance/data['leverage'])+ symbol.margin_varianc) >= 0 :
            #     return Response({'message':'trade failed', 'error':'not enough balance'}, status=status.HTTP_406_NOT_ACCEPTABLE)
            # [(margin + X)*unit] 
            margin =   data['unit']  *(symbol.max_balance / data['leverage']) * symbol.contract_size

            if stat.free_margin < margin * data['unit'] + float(symbol.margin_varianc) :
                return Response({'message':'trade failed', 'error':'not enough balance'}, status=status.HTTP_406_NOT_ACCEPTABLE)
            
            user_lot=data['unit']
            if data['price'] != 0 :
                future = FutureTrades.objects.create(
                    user=user,
                    symbol=symbol,
                    entry = data['price'],
                    type = data['type'],
                    unit = data['unit'],
                    leverage = data['leverage'],
                    sl = data['sl'],
                    tp = data['tp'],
                )
                order = Order.objects.create(
                    user=user,
                    symbol=symbol,
                    price=data['price'],
                    type='place pending order '+data['type'],
                    ticket=0,
                    trade_id=0,
                    unit=data['unit'],
                    leverage=data['leverage'],
                    result='filled',
                    time=timezone.now()
                )
                if future and order:
                    _ = Message.objects.create(
                        user=user,
                        order=future,
                        code="4"
                    )
                    
                    return Response({"message":"trade stored succes"}, status=status.HTTP_200_OK)
                else:
                    return Response({"message":"failed to store trade"}, status=status.HTTP_200_OK)
            data['id'] = payload['id']
            data['unit'] = round(data['unit'] * symbol.min_unit  ,2)
            data['symbol_name'] = symbol.name
            print(data)
            result, deal = mt5.trade(data)
            if not deal:
                error = 'price error' if result == 'no price' else result
                return Response({"message":"traded failed", 'error':error}, status=status.HTTP_403_FORBIDDEN)
            
            ticket = result.order
            if ticket == 0:
                return Response({"message":"traded failed", 'error':result['result'].comment}, status=status.HTTP_409_CONFLICT)

            commission_ratio = float(symbol.commission_buy_ratio) if data['type']=='buy' else float(symbol.commission_sell_ratio)
            fixed_commission = symbol.commission_buy if data['type']=='buy' else symbol.commission_sell
            commission =  user_lot *((commission_ratio * result.price) + fixed_commission  ) * float(stat.commission_off_ratio)
            # margin= unit*(max_balance/leverage)*contract_size
            # margin =  ((data['unit']  *result.price * symbol.contract_size) /account.leverage ) /data['leverage']
            order = Order.objects.create(
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
                margin=margin,
                entry=result.price,
                ticket=ticket,
                type=data['type'],
                unit=user_lot,
                leverage=data['leverage'],
                sl=data['sl'],
                tp=data['tp'],
                commission=commission,
                state='open',
                time=timezone.now()
            )

            # stat.balance = stat.balance - commission
            # stat.save()
            poursant.send(sender=user.__class__, user=user, commission=commission)
            
            _ = Message.objects.create(
                user=user,
                trade=trade,
                code="1"
            )

            if not all([trade, order]) :
                return Response({"message":"saving trade failed", "ticket":'trade is done but data is not saved, we will close the trade with no fee from you'}, status=status.HTTP_200_OK)
            return Response({"message":"succes", "ticket":ticket}, status=status.HTTP_200_OK)
            # try:
            # except Exception as e:
            #     print(e)
        return Response({"message":"traded failed", 'error':result.comment}, status=status.HTTP_409_CONFLICT)

    def position_info(self, request):
        """
        get the info all positions of the user
        """
        payload, error_response = verify_token_from_request(request)
        if error_response:
            return error_response
        
        serializer = TicketSerializer(data=request.data)
        if serializer.is_valid(raise_exception=True):
            try:
                result = mt5.position_info(serializer.validated_data)
                if not hasattr(result, 'profit'):
                    return Response({"message":"position not found"}, status=status.HTTP_200_OK)
                return Response({"message":"succes", "result":result._asdict()}, status=status.HTTP_200_OK)
            except Exception as e:
                print(e)        
        return Response({"message":"error getting position info"}, status=status.HTTP_200_OK)

    def modify(self, request):
        """
        modify tp - sl of a position with position ticket
        """
        payload, error_response = verify_token_from_request(request)
        if error_response:
            return error_response

        serializer = ModifySerializer(data=request.data)
        if serializer.is_valid(raise_exception=True):
            data = serializer.validated_data
            try:
                result  = mt5.modify(data)
                if result.retcode != MT5.TRADE_RETCODE_DONE:
                    return Response({'message': 'error ', 'error': result.comment }, status=status.HTTP_409_CONFLICT)
                user=User.objects.get(pk=payload['id'])
                if result.retcode == MT5.TRADE_RETCODE_DONE :
                    info = mt5.position_info( {'ticket':data['ticket']})
                    if not isinstance(info, str):
                        trade = Trade.objects.get(ticket=data['ticket'])
                        trade.tp=info.tp
                        trade.sl=info.sl
                        trade.save()
                    
                        # except:
                        #     return Response({'message':'saving data failed', 'error':'position modified but data not saved completely'})
                    _ = Message.objects.create(
                        user=user,
                        trade=trade,
                        code="3"
                    )

                    return Response({**{'message': 'sl/tp modified'},  }, status=status.HTTP_200_OK)
            except Exception as e:
                print("-----  ",e)
                return Response({'message': 'error while modifying position'}, status=status.HTTP_409_CONFLICT)
        return Response({'message': 'invalid data'}, status=status.HTTP_409_CONFLICT)
    
    def modify_pending(self, request):
        """
        modify tp - sl of a position with position ticket
        """
        payload, error_response = verify_token_from_request(request)
        if error_response:
            return error_response
        try:
            user = User.objects.get(pk=payload['id'])
        except:
            return Response({'message': 'user not found'}, status=status.HTTP_404_NOT_FOUND)
        serializer = ModifyPendingSerializer(data=request.data)
        if serializer.is_valid(raise_exception=True):
            data = serializer.validated_data
            order = FutureTrades.objects.get(pk=data['id']) 
            order.entry = data['entry']
            order.unit = data['unit']
            order.leverage = data['leverage']
            order.sl = data['sl']
            order.tp = data['tp']
            order.save()
            _ = Message.objects.create(
                user=user,
                code="3"
            )
            messages = Message.objects.select_related('user','trade','order').filter(user=user)
            from message.serializers import MessageResultSerializer
            message_serializer = MessageResultSerializer(messages, many=True)
            
            return Response({**{'message': 'order modified'} }, status=status.HTTP_200_OK)
        return Response({'message': 'invalid data'}, status=status.HTTP_409_CONFLICT)
    
    def close_single(self, request):
        """
        close single positions
        """
        try:
            payload, error_response = verify_token_from_request(request)
        except:
            return Response({'message': 'fucked'}, status=status.HTTP_403_FORBIDDEN)
        if error_response:
            return error_response
        
        try:
            ticket = request.data.pop('ticket')
            symbol = Pairs.objects.get(pk=request.data.pop('symbol'))
        except:
            return Response({'message': 'failed', 'error':'invalid data'}, status=status.HTTP_403_FORBIDDEN)
        
        try:
            result, deals, orders = mt5.close_single(symbol.name, ticket)
            if result != True:
                return Response({'message': f'error closing order {ticket}', 'error':result}, status=status.HTTP_409_CONFLICT)
            trade = Trade.objects.get(ticket=deals[0].position_id)
            trade.state = 'close'
            trade.profit = deals[-1].profit
            trade.exit = deals[-1].price
            trade.save(update_fields=['state', 'profit', 'exit'])

            user=User.objects.get(pk=payload['id'])
            updateBalance(user,trade )
            # add deals
            for i, deal in enumerate(deals):
                type = 'buy' if deal.type==0 else 'sell'
                deal_object = Deal.objects.create(
                    user=user,
                    symbol=symbol,
                    price=deal.price,
                    ticket=deal.ticket,
                    trade_id = deal.position_id,
                    type=type,
                    dir = 'in' if type==trade.type else 'out',
                    unit=trade.unit,
                    leverage=trade.leverage or '',
                    time=timezone.now() if i==0 else trade.time,
                    profit=deal.profit,
                    commission = deal.commission
                )
            # add order
            order = Order.objects.create(
                user=user,
                symbol=symbol,
                price=orders[-1].price_current,
                type='close '+trade.type,
                ticket=orders[-1].ticket,
                trade_id=orders[-1].position_id,
                unit=trade.unit,
                leverage=trade.leverage,
                result='filled',
                time=timezone.now()
            )
            trade_closed.send(sender=user.__class__, request=request, user=user, trade=trade)
            
            _ = Message.objects.create(
                    user=user,
                    trade=trade,
                    code="2"
                )

            return Response({'message': f'succes closing order {ticket}'}, status=status.HTTP_200_OK)
        except Exception as e:
            print(e)
            return Response({'message': f'error closing order {ticket}'}, status=status.HTTP_409_CONFLICT)
    
    def close_future(self, request):
        """
        close future trades before becoming a trade
        """
        payload, error_response = verify_token_from_request(request)
        if error_response:
            return error_response
        try:
            user = User.objects.get(pk=payload['id'])
            id =  request.data.pop('id')
            future = FutureTrades.objects.get(pk=id)
        except:
            return Response({"message":"action failed", 'error':'user or order not found'}, status=status.HTTP_404_NOT_FOUND)
        
        if future.user != user:
            return Response({"message":"action failed", 'error':'user not matching'}, status=status.HTTP_403_FORBIDDEN)

        _ = Message.objects.create(
            user=user,
            code="5"
        )
        
        symbol = future.symbol
        used_margin = future.unit*symbol.min_balance
        stat = Statistic.objects.get(user=user)
        stat.free_margin += used_margin 
        stat.save()

        order = Order.objects.create(
            user=user,
            symbol=symbol,
            price=future.entry,
            type='close pending order '+future.type,
            ticket=0,
            trade_id=0,
            unit=future.unit,
            leverage=future.leverage,
            result='filled',
            time=timezone.now()
        )
        future.delete()

        
        return Response({'message':'order removed'}, status=status.HTTP_200_OK)

    def close_all(self,request):
        """
        close all positions
        """
        payload, error_response = verify_token_from_request(request)
        if error_response:
            return error_response
        
        try:
            result, data = mt5.close_all(payload['id'])
            if result:
                return Response({'message': 'error closing all'}+result, status=status.HTTP_409_CONFLICT)
            
            user=User.objects.get(pk=payload['id'])
            # store orders and deals
            for ticket in data['tickets']:
                deals = [d for d in data['deals'] if d[-1].position_id == ticket]
                
                trade = Trade.objects.get(ticket=ticket)
                symbol = trade.symbol
                # update trade
                trade.profit = deals[0][-1].profit
                trade.exit = deals[0][-1].price
                trade.state = 'close'
                trade.save(update_fields=['state', 'profit', 'exit'])
                updateBalance(user,trade )
                for i,deal in enumerate(deals[0]):
                    if deal.position_id == ticket:
                        type = 'buy' if deal.type==0 else 'sell'
                        deal_object = Deal.objects.create(
                            user=user,
                            symbol=symbol,
                            price=deal.price,
                            ticket=deal.ticket,
                            trade_id = deal.position_id,
                            type=type,
                            dir = 'in' if type==trade.type else 'out',
                            unit=trade.unit,
                            leverage=trade.leverage or '',
                            time=timezone.now() if i==0 else trade.time,
                            profit=deal.profit,
                            commission = deal.commission
                        )
                
                orders = [o for o in data['orders'] if o[-1].position_id == ticket]
                order = Order.objects.create(
                    user=user,
                    symbol=symbol,
                    price=orders[0][-1].price_current,
                    type='close '+trade.type,
                    ticket=orders[0][-1].ticket,
                    trade_id=orders[0][-1].position_id,
                    unit=trade.unit,
                    leverage=trade.leverage,
                    result='filled',
                    time=timezone.now()
                )

                trade_closed.send(sender=user.__class__, request=request, user=user, trade=trade)
                        
                _ = Message.objects.create(
                    user=user,
                    trade=trade,
                    code="2"
                )
            return Response({'message': 'succes closing all'}, status=status.HTTP_200_OK)
        except Exception as e:
            print(e)
            return Response({'message': 'error closing all'}, status=status.HTTP_409_CONFLICT)
        
    def close_profit(self,request):
        """
        close all in profit trades
        """
        payload, error_response = verify_token_from_request(request)
        if error_response:
            return error_response
        
        try:
            result, data = mt5.close_profit(payload['id'])
            if result:
                return Response({'message': 'error closing all'}+result, status=status.HTTP_409_CONFLICT)
            
            user=User.objects.get(pk=payload['id'])
            # store orders and deals
            for ticket in data['tickets']:
                deals = [d for d in data['deals'] if d[-1].position_id == ticket]
                
                trade = Trade.objects.get(ticket=ticket)
                symbol = trade.symbol
                # update trade
                trade.state = 'close'
                trade.profit = deals[0][-1].profit
                trade.exit = deals[0][-1].price
                trade.save(update_fields=['state', 'profit', 'exit'])

                for i, deal in enumerate(deals[0]):
                    if deal.position_id == ticket:
                        type = 'buy' if deal.type==0 else 'sell'
                        deal_object = Deal.objects.create(
                            user=user,
                            symbol=symbol,
                            price=deal.price,
                            ticket=deal.ticket,
                            trade_id = deal.position_id,
                            type=type,
                            dir = 'in' if type==trade.type else 'out',
                            unit=trade.unit,
                            leverage=trade.leverage or '',
                            time=timezone.now() if i==0 else trade.time,
                            profit=deal.profit,
                            commission = deal.commission
                        )
                
                orders = [o for o in data['orders'] if o[-1].position_id == ticket]
                order = Order.objects.create(
                    user=user,
                    symbol=symbol,
                    price=orders[0][-1].price_current,
                    type='close '+trade.type,
                    ticket=orders[0][-1].ticket,
                    trade_id=orders[0][-1].position_id,
                    unit=trade.unit,
                    leverage=trade.leverage,
                    result='filled',
                    time=timezone.now()
                )

                trade_closed.send(sender=user.__class__, request=request, user=user, trade=trade)
                            
                _ = Message.objects.create(
                    user=user,
                    trade=trade,
                    code="2"
                )
            return Response({'message': 'succes closing profit'}, status=status.HTTP_200_OK)
        except Exception as e:
            print(e)
            return Response({'message': 'error closing profit'}, status=status.HTTP_409_CONFLICT)
 
    def close_loss(self,request):
        """
        close all in loss trades
        """
        payload, error_response = verify_token_from_request(request)
        if error_response:
            return error_response
        
        try:
            result, data = mt5.close_loss(payload['id'])
            if result:
                return Response({'message': 'error closing all'}+result, status=status.HTTP_409_CONFLICT)
            
            user=User.objects.get(pk=payload['id'])
            # store orders and deals
            for ticket in data['tickets']:
                deals = [d for d in data['deals'] if d[-1].position_id == ticket]
                
                trade = Trade.objects.get(ticket=ticket)
                symbol = trade.symbol
                # update trade
                trade.profit = deals[0][-1].profit
                trade.exit = deals[0][-1].price
                trade.state = 'close'
                trade.save(update_fields=['state', 'profit', 'exit'])
                updateBalance(user,trade )    
                for i, deal in enumerate(deals[0]):
                    if deal.position_id == ticket:
                        type = 'buy' if deal.type==0 else 'sell'
                        deal_object = Deal.objects.create(
                            user=user,
                            symbol=symbol,
                            price=deal.price,
                            ticket=deal.ticket,
                            trade_id = deal.position_id,
                            type=type,
                            dir = 'in' if type==trade.type else 'out',
                            unit=trade.unit,
                            leverage=trade.leverage or '',
                            time=timezone.now() if i==0 else trade.time,
                            profit=deal.profit,
                            commission = deal.commission
                        )
                
                orders = [o for o in data['orders'] if o[-1].position_id == ticket]
                order = Order.objects.create(
                    user=user,
                    symbol=symbol,
                    price=orders[0][-1].price_current,
                    type='close '+trade.type,
                    ticket=orders[0][-1].ticket,
                    trade_id=orders[0][-1].position_id,
                    unit=trade.unit,
                    leverage=trade.leverage,
                    result='filled',
                    time=timezone.now()
                )

                trade_closed.send(sender=user.__class__, request=request, user=user, trade=trade)
                            
                _ = Message.objects.create(
                    user=user,
                    trade=trade,
                    code="2"
                )
            return Response({'message': 'succes closing loss'}, status=status.HTTP_200_OK)
        except Exception as e:
            print(e)
            return Response({'message': 'error closing loss'}, status=status.HTTP_409_CONFLICT)

    def close_sells(self,request):
        """
        close all in loss trades
        """
        payload, error_response = verify_token_from_request(request)
        if error_response:
            return error_response
        
        try:
            result, data = mt5.close_buys(payload['id'])
            if result:
                return Response({'message': 'error closing all'}+result, status=status.HTTP_409_CONFLICT)
            
            user=User.objects.get(pk=payload['id'])
            # store orders and deals
            for ticket in data['tickets']:
                deals = [d for d in data['deals'] if d[-1].position_id == ticket]
                
                trade = Trade.objects.get(ticket=ticket)
                symbol = trade.symbol
                # update trade
                trade.profit = deals[0][-1].profit
                trade.exit = deals[0][-1].price
                trade.state = 'close'
                trade.save(update_fields=['state', 'profit', 'exit'])
                updateBalance(user,trade )
                for i, deal in enumerate(deals[0]):
                    if deal.position_id == ticket:
                        type = 'buy' if deal.type==0 else 'sell'
                        deal_object = Deal.objects.create(
                            user=user,
                            symbol=symbol,
                            price=deal.price,
                            ticket=deal.ticket,
                            trade_id = deal.position_id,
                            type=type,
                            dir = 'in' if type==trade.type else 'out',
                            unit=trade.unit,
                            leverage=trade.leverage or '',
                            time=timezone.now() if i==0 else trade.time,
                            profit=deal.profit,
                            commission = deal.commission
                        )
                
                orders = [o for o in data['orders'] if o[-1].position_id == ticket]
                order = Order.objects.create(
                    user=user,
                    symbol=symbol,
                    price=orders[0][-1].price_current,
                    type='close '+trade.type,
                    ticket=orders[0][-1].ticket,
                    trade_id=orders[0][-1].position_id,
                    unit=trade.unit,
                    leverage=trade.leverage,
                    result='filled',
                    time=timezone.now()
                )

                trade_closed.send(sender=user.__class__, request=request, user=user, trade=trade)
                            
                _ = Message.objects.create(
                    user=user,
                    trade=trade,
                    code="2"
                )
            return Response({'message': 'succes closing loss'}, status=status.HTTP_200_OK)
        except Exception as e:
            print(e)
            return Response({'message': 'error closing loss'}, status=status.HTTP_409_CONFLICT)

    def close_buys(self,request):
        """
        close all in loss trades
        """
        payload, error_response = verify_token_from_request(request)
        if error_response:
            return error_response
        
        try:
            result, data = mt5.close_sells(payload['id'])
            if result:
                return Response({'message': 'error closing all'}+result, status=status.HTTP_409_CONFLICT)
            
            user=User.objects.get(pk=payload['id'])
            # store orders and deals
            for ticket in data['tickets']:
                deals = [d for d in data['deals'] if d[-1].position_id == ticket]
                
                trade = Trade.objects.get(ticket=ticket)
                symbol = trade.symbol
                # update trade
                trade.profit = deals[0][-1].profit
                trade.exit = deals[0][-1].price
                trade.state = 'close'
                trade.save(update_fields=['state', 'profit', 'exit'])
                updateBalance(user,trade )
                for i, deal in enumerate(deals[0]):
                    if deal.position_id == ticket:
                        type = 'buy' if deal.type==0 else 'sell'
                        deal_object = Deal.objects.create(
                            user=user,
                            symbol=symbol,
                            price=deal.price,
                            ticket=deal.ticket,
                            trade_id = deal.position_id,
                            type=type,
                            dir = 'in' if type==trade.type else 'out',
                            unit=trade.unit,
                            leverage=trade.leverage or '',
                            time=timezone.now() if i==0 else trade.time,
                            profit=deal.profit,
                            commission = deal.commission
                        )
                
                orders = [o for o in data['orders'] if o[-1].position_id == ticket]
                order = Order.objects.create(
                    user=user,
                    symbol=symbol,
                    price=orders[0][-1].price_current,
                    type='close '+trade.type,
                    ticket=orders[0][-1].ticket,
                    trade_id=orders[0][-1].position_id,
                    unit=trade.unit,
                    leverage=trade.leverage,
                    result='filled',
                    time=timezone.now()
                )

                trade_closed.send(sender=user.__class__, request=request, user=user, trade=trade)
                            
                _ = Message.objects.create(
                    user=user,
                    trade=trade,
                    code="2"
                )
            return Response({'message': 'succes closing loss'}, status=status.HTTP_200_OK)
        except Exception as e:
            print(e)
            return Response({'message': 'error closing loss'}, status=status.HTTP_409_CONFLICT)

    def all_user_data(self,request):
        """
        get all the data of a user that is needed for front
        """
        payload, error_response = verify_token_from_request(request)
        if error_response:
            return error_response
        
        user = User.objects.get(pk=payload['id'])
        try:
            trades = Trade.objects.filter(user=user, state='open')
            pending = FutureTrades.objects.filter(user=user)
            pairs = Pairs.objects.only('ask','bid').all()
            stat = Statistic.objects.get(user=user)
        except:
            return Response({'message':'failed','error':'no data found for the user '}, status=status.HTTP_404_NOT_FOUND)
        
        symbol_serializer = PairsSerializer(pairs, many=True)
        trade_serializer = Trade2Serializer(trades, many=True)
        pending_serializer = PendingSerializer(pending, many=True)
        stat_serializer = StatSerializer(stat)
        response_data = {
            'pairs': symbol_serializer.data,
            'trades': trade_serializer.data,
            'pending': pending_serializer.data,
            'statistic': stat_serializer.data,
        }
        return Response(response_data, status=status.HTTP_200_OK)

    def user_trades(self,request):
        """
        get the data of all trades of a user
        """
        payload, error_response = verify_token_from_request(request)
        if error_response:
            return error_response
        
        user = User.objects.get(pk=payload['id'])
        try:
            trades = Trade.objects.filter(user=user, state='close')
            serializer = Trade2Serializer(trades, many=True)
        except:
            return Response({'message':'failed','error':'trades not found'}, status=status.HTTP_404_NOT_FOUND)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def user_deals(self,request):
        """
        get the data of all deals of a user
        """
        payload, error_response = verify_token_from_request(request)
        if error_response:
            return error_response
        
        user = User.objects.get(pk=payload['id'])
        try:
            deals = Deal.objects.filter(user=user)
        except:
            return Response({'message':'failed','error':'trades not found'}, status=status.HTTP_404_NOT_FOUND)
        serializer = Deal2Serializer(deals, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    def user_orders(self,request):
        """
        get the data of all order of a user
        """
        payload, error_response = verify_token_from_request(request)
        if error_response:
            return error_response
        
        user = User.objects.get(pk=payload['id'])
        try:
            orders = Order.objects.filter(user=user)
        except:
            return Response({'message':'failed','error':'trades not found'}, status=status.HTTP_404_NOT_FOUND)
        serializer = Order2Serializer(orders, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)



def verify_token_from_request(request):
    try:
        token = request.data.pop('token')
    except KeyError:
        return None, Response({'message': 'invalid data'}, status=status.HTTP_403_FORBIDDEN)

    payload = verify_token(token)
    if not payload:
        return None, Response({'message': 'error verifying token'}, status=status.HTTP_403_FORBIDDEN)

    return payload, None


