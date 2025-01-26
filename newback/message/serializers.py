from rest_framework import serializers
from .models import Message
from persiantools.jdatetime import JalaliDateTime
import pytz
from mt5.serializers import Trade2Serializer, PendingSerializer

class MessageSerializer(serializers.Serializer):
    token = serializers.CharField()

class MessageResultSerializer(serializers.ModelSerializer):
    time_jalali = serializers.CharField(source='*', read_only=True)
    user_name = serializers.CharField(source='*', read_only=True)
    trade = Trade2Serializer(read_only=True) 
    order = PendingSerializer(read_only=True)
    class Meta:
        model = Message
        fields = ['id', 'code', 'user_name', 'title', 'content', 'sender',
                  'increased_amount', 'balance','withdraw_amount', 
                  'withdraw_rial', 'time', 'time_jalali', 'is_read',
                  'trade', 'order']

    def get_user_name(self, obj):
        return obj.user.username
    
    def get_time_jalali(self, obj):
        tehran_tz = pytz.timezone("Asia/Tehran")
    
        # Make obj.time aware if it's not already
        if obj.time.tzinfo is None:
            aware_time = tehran_tz.localize(obj.time)
        else:
            aware_time = obj.time.astimezone(tehran_tz)
        return JalaliDateTime(aware_time).strftime("%Y/%m/%d %I:%M:%S")
    
    def to_representation(self, instance):
        representation = super().to_representation(instance)
        representation['time_jalali'] = self.get_time_jalali(instance)  # Compute time_jalili here
        representation['user_name'] = self.get_user_name(instance)  # Compute time_jalili here
        return representation

class MessageQuerySerializer(serializers.Serializer):
    token = serializers.CharField()
    id = serializers.CharField()