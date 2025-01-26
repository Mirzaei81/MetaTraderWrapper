import math
from rest_framework import serializers
from .models import User
from django.utils import timezone
from datetime import timedelta
import random


class UserSerializer(serializers.ModelSerializer):
    last_login_formatted = serializers.SerializerMethodField()
    created_at = serializers.SerializerMethodField()
    class Meta:
        model = User
        fields = ['id', 'username', 'phone_number','is_active' , 'bank_number', 'real_name' ,'created_at', 'last_login_formatted']

    def get_last_login_formatted(self, obj):
        if obj.last_login is None:
            return "Never logged in"

        # Calculate the time difference
        now = timezone.now()
        time_difference = now - obj.last_login

        # Format the time difference
        if time_difference < timedelta(minutes=1):
            return "Just now"
        elif time_difference < timedelta(hours=1):
            minutes = time_difference.seconds // 60
            return f"{minutes} minute{'s' if minutes != 1 else ''} ago"
        elif time_difference < timedelta(days=1):
            hours = time_difference.seconds // 3600
            return f"{hours} hour{'s' if hours != 1 else ''} ago"
        else:
            days = time_difference.days
            return f"{days} day{'s' if days != 1 else ''} ago"
    
    def get_created_at(self, obj):
        # Calculate the time difference
        now = timezone.now()
        time_difference = now - obj.created

        # Format the time difference
        if time_difference > timedelta(days=1):
            days = time_difference.days
            if days <30:
                return f"{days} day{'s' if days != 1 else ''} ago"
            elif 30 <= days <365 :
                months = math.floor(days/30)
                return f"over {'a' if months==1 else months} year{'s' if months != 1 else ''} ago"
            elif days >= 365:
                years = math.floor(days/365)
                return f"over {'a' if years==1 else years} year{'s' if years != 1 else ''} ago"
        else:
            return "today"

class SignupSerializer(serializers.ModelSerializer): # modelSerializer is ok for create and update
    class Meta:
        model = User
        fields = ['username', 'real_name', 'phone_number', 'password', 'bank_number', 'referer']

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            phone_number=validated_data['phone_number'],
            password=validated_data['password'],
            real_name=validated_data['real_name'],
            bank_number=validated_data['bank_number'],
            code = str(random.randint(1000, 9999)),
            referer = (validated_data['referer'] or '')
        )
        user.save()
        return user

class VerifySerializer(serializers.Serializer):
    phone_number = serializers.CharField()
    code = serializers.CharField()

class LoginSerializer(serializers.Serializer): #serializer will not check for uniqueness 
    phone_number = serializers.CharField()
    password = serializers.CharField()

class DeleteSerializer(serializers.Serializer):
    token = serializers.CharField()
    password = serializers.CharField()

class UpdateSerializer(serializers.ModelSerializer):
    username = serializers.CharField(required=False)
    bank_number = serializers.CharField(required=False)
    password = serializers.CharField(required=False)
    class Meta:
        model = User
        fields = ['username', 'bank_number', 'password']

class ActivateSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields=['is_active']

class TokenSerializer(serializers.Serializer):
    token = serializers.CharField()