from rest_framework import serializers
from .models import WithdrawalRequest
import pytz

class RequestSerializer(serializers.Serializer):
    token = serializers.CharField()
    amount = serializers.FloatField()
