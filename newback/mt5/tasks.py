import MetaTrader5 as mt5
from datetime import datetime
import os
from dotenv import load_dotenv
load_dotenv()
from typing import Dict
from django.apps import apps  # Import apps
from account.tasks import  send_sms 
from threading import Lock
class Singleton(type):
    _instances = {}
    _lock: Lock = Lock()

    def __call__(cls, *args, **kwargs):
        with cls._lock:
            if cls not in cls._instances:
                instance = super().__call__(*args, **kwargs)
                cls._instances[cls] = instance

        return cls._instances[cls]
    
class Mt5Task(metaclass=Singleton):
    inited = False
    loggedin = False
    def __init__(self) -> None:
        self.inited = mt5.initialize()
    
    def login(self):
        """
        login to account
        """
        if self.inited:
            try:
                MT5Account = apps.get_model('mt5', 'MT5Account') 
                mt5account = MT5Account.objects.first()
                account = mt5account.account
                password = mt5account.password
                server = mt5account.server
                authorized=mt5.login(
                    int(account), 
                    password=password,
                    server=server
                )
                if not authorized:
                    print("authorization failed, error code =",mt5.last_error())
                    return False
                self.loggedin = True
            except:
                self.loggedin = False

    def account_info(self) -> Dict:
        """
        get account info
        """
        if self.loggedin:
            account_info=mt5.account_info()
            if account_info!=None:
                account_info_dict = mt5.account_info()._asdict()
                return account_info_dict
        return {}
    
    def get_symbol_info(self, symbol:str) -> Dict:
        info = mt5.symbol_info(symbol)
        if info:
            return info._asdict()
        return {}

    def trade(self, data:Dict):
        info = self.get_symbol_info(data['symbol_name'])
        ask = info['ask']
        bid = info['bid']
        price = data['price'] if data['price']!=0 else ask if data['type']=="buy" else bid
        sl = data['sl'] if data['sl']!=0 else 0
        tp = data['tp'] if data['tp']!=0 else 0
        deviation = 20
        
        type = mt5.ORDER_TYPE_BUY if data['type']=="buy" else mt5.ORDER_TYPE_SELL

        request = {
            "action": mt5.TRADE_ACTION_DEAL,
            "symbol": data['symbol_name'],
            "volume": data['unit'],
            "type": type,
            "price": price,
            "deviation": deviation,
            "magic": data['id'],
            "comment": "Meta copy trade",
            "type_time": mt5.ORDER_TIME_GTC,
            # "type_filling": mt5.ORDER_FILLING_IOC,
            # "type_filling": mt5.ORDER_FILLING_RETURN,
            "type_filling": mt5.ORDER_FILLING_FOK,  
        }
        if sl != 0 :
            request['sl'] = sl
        if tp != 0 :
            request['tp'] = tp

        # send a trading request
        result = mt5.order_send(request)
        if result is None :
            return mt5.last_error()[1], False
        if result.deal ==0:
            return result.comment , False
        
        deal = mt5.history_deals_get(ticket=result.deal)[0]
        return result, deal

    def position_info(self, data:dict):
        ticket = data['ticket']
        result = mt5.positions_get(ticket=int(ticket))
        if not bool(result) :
            return "trade not found"
        return result[0]
    
    def get_deal(self, ticket:int):
        """
        get deal info for trade based on ticket
        """
        deals = mt5.history_deals_get(position=int(ticket))
        if deals is None:
            return mt5.last_error()[1], False
        return deals, True

    def get_order(self, ticket:int):
        """
        get order info for trade based on ticket
        """
        orders = mt5.history_orders_get(position=int(ticket))
        if orders is None:
            return mt5.last_error()[1], False
        return orders, True
    
    def modify(self, data:dict):
        try:
            position = mt5.positions_get(ticket=data['ticket'])[0]
        except:
            return 'position with ticket '+ data['ticket']+' doesn\'t exist'
        info = self.position_info( {'ticket':position.ticket})  
        request = {
            "action": mt5.TRADE_ACTION_SLTP,
            "position": position.ticket, 
            "sl":data['sl'],
            "tp": data['tp'],
            "symbol=": info.symbol,
        }
        
        result = mt5.order_send(request)
        return result

    def close_single(self, symbol:str, ticket:int):
        """
        close a position by ticket in market price
        """
        try: 
            result = mt5.Close(symbol=symbol,ticket=ticket)
            deal = mt5.history_deals_get(position=int(ticket))
            order = mt5.history_orders_get(position=int(ticket))
            if not result :
                return mt5.last_error()[1] , False, False
        except Exception as e:
            return e, False, False
        return result, deal, order
         
    def close_all(self, id:str)->dict:
        """
        close all positions of a user at market price
        """
        positions = mt5.positions_get(magic=id)
        errors = {}
        tickets = []
        deals = []
        orders = []
        for pos in positions:
            result = mt5.Close(symbol=pos.symbol, ticket=pos.ticket)
            deal = mt5.history_deals_get(position=int(pos.ticket))
            order = mt5.history_orders_get(position=int(pos.ticket))
            
            tickets.append(pos.ticket)
            deals.append(deal)
            orders.append(order)

            if not result:
                errors[pos.ticket] = result 

        return errors , {'tickets':tickets, 'deals':deals, 'orders':orders}

    def close_profit(self, id:str):
        """
        close all positions of a user that are in profit at market price
        """
        positions = mt5.positions_get(magic=id)
        errors = {}
        tickets = []
        deals = []
        orders = []
        for pos in positions:
            if pos.profit>0:
                result = mt5.Close(symbol=pos.symbol, ticket=pos.ticket)
                deal = mt5.history_deals_get(position=int(pos.ticket))
                order = mt5.history_orders_get(position=int(pos.ticket))
                
                tickets.append(pos.ticket)
                deals.append(deal)
                orders.append(order)
                
                if not result:
                   errors[pos.ticket] = result 

        return errors , {'tickets':tickets, 'deals':deals, 'orders':orders}
    
    def close_loss(self, id:str):
        """
        close all positions of a user that are in loss at market price
        """
        positions = mt5.positions_get(magic=id)
        errors = {}
        tickets = []
        deals = []
        orders = []
        for pos in positions:
            if pos.profit<0:
                result = mt5.Close(symbol=pos.symbol, ticket=pos.ticket)
                deal = mt5.history_deals_get(position=int(pos.ticket))
                order = mt5.history_orders_get(position=int(pos.ticket))
                
                tickets.append(pos.ticket)
                deals.append(deal)
                orders.append(order)
                if not result:
                   errors[pos.ticket] = result 

        return errors , {'tickets':tickets, 'deals':deals, 'orders':orders}

    def close_buys(self, id:str):
        """
        close all positions of a user that are in loss at market price
        """
        positions = mt5.positions_get(magic=id)
        errors = {}
        tickets = []
        deals = []
        orders = []
        for pos in positions:
            if pos.type == 1:
                result = mt5.Close(symbol=pos.symbol, ticket=pos.ticket)
                deal = mt5.history_deals_get(position=int(pos.ticket))
                order = mt5.history_orders_get(position=int(pos.ticket))
                
                tickets.append(pos.ticket)
                deals.append(deal)
                orders.append(order)
                if not result:
                   errors[pos.ticket] = result 

        return errors , {'tickets':tickets, 'deals':deals, 'orders':orders}
    
    def close_sells(self, id:str):
        """
        close all positions of a user that are in loss at market price
        """
        positions = mt5.positions_get(magic=id)
        errors = {}
        tickets = []
        deals = []
        orders = []
        for pos in positions:
            if pos.type == 0:
                result = mt5.Close(symbol=pos.symbol, ticket=pos.ticket)
                deal = mt5.history_deals_get(position=int(pos.ticket))
                order = mt5.history_orders_get(position=int(pos.ticket))
                
                tickets.append(pos.ticket)
                deals.append(deal)
                orders.append(order)
                if not result:
                   errors[pos.ticket] = result 

        return errors , {'tickets':tickets, 'deals':deals, 'orders':orders}