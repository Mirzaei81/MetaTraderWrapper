from rest_framework import serializers
from .models import Transaction
from persiantools.jdatetime import JalaliDateTime
import pytz

class TransactionSerializer(serializers.ModelSerializer):
    time_jalali = serializers.CharField(source='*', read_only=True)
    class Meta:
        model = Transaction
        fields = ["type", "transaction_id", "amount_rial", "amount_dollar", "transaction_id", "time", 'time_jalali']

    def get_time_jalali(self, obj):
        tehran_tz = pytz.timezone("Asia/Tehran")
        if obj.time.tzinfo is None:
            aware_time = tehran_tz.localize(obj.time)
        else:
            aware_time = obj.time.astimezone(tehran_tz)
        return JalaliDateTime(aware_time).strftime("%Y/%m/%d %I:%M:%S")

    def to_representation(self, instance):
        representation = super().to_representation(instance)
        representation['time_jalali'] = self.get_time_jalali(instance)
        return representation
