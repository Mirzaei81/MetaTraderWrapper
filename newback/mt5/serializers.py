from rest_framework import serializers
from persiantools.jdatetime import JalaliDateTime
import datetime, pytz
from state.models import Statistic
from .models import *
# from .models import Symbol

class TradeSerializer(serializers.Serializer):
    symbol = serializers.CharField()
    price = serializers.FloatField()
    type = serializers.CharField()
    unit = serializers.FloatField()
    leverage = serializers.FloatField()
    sl = serializers.FloatField()
    tp = serializers.FloatField()
    

class TicketSerializer(serializers.Serializer):
    ticket = serializers.IntegerField()

class ModifySerializer(serializers.Serializer):
    ticket = serializers.IntegerField()
    id = serializers.FloatField()
    sl = serializers.FloatField(required=False)    
    tp = serializers.FloatField(required=False)

class ModifyPendingSerializer(serializers.Serializer):
    entry     = serializers.CharField()
    sl       = serializers.FloatField()
    tp            = serializers.FloatField()    
    id     = serializers.FloatField()
    leverage     = serializers.FloatField()
    unit     = serializers.FloatField()

class PairCommissionSerializer(serializers.ModelSerializer):
    class Meta:
        model = PairCommission
        fields = ['commission', 'commission_sell_ratio', 'commission_buy_ratio']

class PairNameSerializer(serializers.ModelSerializer):
    class Meta:
        model = PairName
        fields = ['en', 'fa', 'kur']

class SymbolSerializer(serializers.ModelSerializer):
    commissions = PairCommissionSerializer(many=True, read_only=True)
    names = PairNameSerializer(many=True, read_only=True)
    class Meta:
        model = Pairs
        fields = ['id', 'names', 'ask', 'bid', 'high', 'low', 'max_unit', 'min_unit', 
        'max_leverage', 'max_allowed_price', 'min_allowed_price', 'unit_tax', 'commissions']

class AddSymbolSerializer(serializers.Serializer):
    id = serializers.IntegerField()


class PairsSerializer(serializers.ModelSerializer):
    names = serializers.SerializerMethodField()
    ask = serializers.SerializerMethodField()
    bid = serializers.SerializerMethodField()
    class Meta:
        model = Pairs
        fields = ['id', 'names', 'ask', 'bid', 'high', 'low', 'max_leverage', 'last_update'] 

    def get_names(self, obj):
        name = obj.names.first()
        return {
            'en': name.en,
            'fa': name.fa,
            'kur': name.kur
        }
    def get_ask(self, obj):
        return round(obj.ask, obj.digits)
    def get_bid(self, obj):
        return round(obj.bid, obj.digits)
    
class Trade2Serializer(serializers.ModelSerializer):
    symbol_name = serializers.SerializerMethodField()
    symbol_id = serializers.SerializerMethodField()
    time_jalali = serializers.SerializerMethodField()
    class Meta:
        model = Trade
        fields = ['id','symbol_name', 'symbol_id', 'ticket', 'entry', 'current',
                  'exit', 'profit', 'type', 'sl', 'tp', 'unit', 'leverage', 'time', 'time_jalali','swap','commission']

    def get_symbol_name(self, obj):
        name = obj.symbol.names.first()
        return {
                'en': name.en,
                'fa': name.fa,
                'kur': name.kur
            }
    def get_symbol_id(self, obj):
        return obj.symbol.id
    def get_time_jalali(self, obj):
        tehran_tz = pytz.timezone("Asia/Tehran")
    
        # Make obj.time aware if it's not already
        if obj.time.tzinfo is None:
            aware_time = tehran_tz.localize(obj.time)
        else:
            aware_time = obj.time.astimezone(tehran_tz)
        return JalaliDateTime(aware_time).strftime("%Y/%m/%d %I:%M:%S")

class Deal2Serializer(serializers.ModelSerializer):
    symbol_name = serializers.SerializerMethodField()
    time_jalali = serializers.SerializerMethodField()
    class Meta:
        model = Deal
        fields = ['symbol_name', 'ticket', 'trade_id', 'price', 'profit', 'unit', 'type', 'dir', 'time_jalali', 'time']

    def get_symbol_name(self, obj):
        name = obj.symbol.names.first()
        return {
                'en': name.en,
                'fa': name.fa,
                'kur': name.kur
            }
    def get_time_jalali(self, obj):
        tehran_tz = pytz.timezone("Asia/Tehran")
    
        # Make obj.time aware if it's not already
        if obj.time.tzinfo is None:
            aware_time = tehran_tz.localize(obj.time)
        else:
            aware_time = obj.time.astimezone(tehran_tz)
        return JalaliDateTime(aware_time).strftime("%Y/%m/%d %I:%M:%S")
    
class Order2Serializer(serializers.ModelSerializer):
    symbol_name = serializers.SerializerMethodField()
    time_jalali = serializers.SerializerMethodField()
    class Meta:
        model = Order
        fields = ['symbol_name', 'ticket', 'trade_id', 'price', 'unit', 'type', 'result', 'time_jalali', 'time']

    def get_symbol_name(self, obj):
        name = obj.symbol.names.first()
        return {
            'en': name.en,
            'fa': name.fa,
            'kur': name.kur
        }
    def get_time_jalali(self, obj):
        tehran_tz = pytz.timezone("Asia/Tehran")
    
        # Make obj.time aware if it's not already
        if obj.time.tzinfo is None:
            aware_time = tehran_tz.localize(obj.time)
        else:
            aware_time = obj.time.astimezone(tehran_tz)
        return JalaliDateTime(aware_time).strftime("%Y/%m/%d %I:%M:%S")
    
class PendingSerializer(serializers.ModelSerializer):
    symbol_name = serializers.SerializerMethodField()
    price = serializers.SerializerMethodField()
    time_jalali = serializers.SerializerMethodField()

    class Meta:
        model = FutureTrades
        fields = ['id', 'symbol_name', 'price', 'symbol','sl', 'tp', 'unit','leverage', 'type', 'time_jalali']
    
    def get_symbol_name(self, obj):
        name = obj.symbol.names.first()
        return {
            'en': name.en,
            'fa': name.fa,
            'kur': name.kur
        }
    
    def get_price(self, obj):
        return  obj.entry

    def get_time_jalali(self, obj):
        tehran_tz = pytz.timezone("Asia/Tehran")
    
        # Make obj.time aware if it's not already
        if obj.time.tzinfo is None:
            aware_time = tehran_tz.localize(obj.time)
        else:
            aware_time = obj.time.astimezone(tehran_tz)
        return JalaliDateTime(aware_time).strftime("%Y/%m/%d %I:%M:%S")
    
class StatSerializer(serializers.ModelSerializer):
    class Meta:
        model = Statistic
        fields = ['balance', 'equity', 'free_margin', 'margin_level', 'margin']