import time
from django.shortcuts import get_object_or_404
from rest_framework import viewsets, status, permissions
from rest_framework.response import Response
from .models import User
from .serializers import    LoginSerializer, SignupSerializer, \
                            DeleteSerializer, TokenSerializer, UserSerializer, \
                            UpdateSerializer, VerifySerializer, \
                            ActivateSerializer

from django.contrib.auth import authenticate
from django.utils import timezone
from .oauth import create_token, verify_token
from .signals import user_monitor, user_created
from .tasks import send_sms 
from message.models import Message

# Create your views here.
class UserViewSet(viewsets.ViewSet):
    permission_classes = [permissions.AllowAny]
    
    def signup(self, request):
        serializer = SignupSerializer(data=request.data)
        try:
            serializer.is_valid(raise_exception=True)
        except:
            return Response(serializer.errors, status=status.HTTP_409_CONFLICT)

        user = serializer.save()
        user = authenticate(request, username=serializer.validated_data['phone_number'], password=serializer.validated_data['password'])

        send_sms.delay(user.phone_number, user.code)
        return Response({'phone_number':user.phone_number}, status=status.HTTP_201_CREATED)

    def verify(self,request):
        serializer = VerifySerializer(data=request.data)
        try:
            serializer.is_valid(raise_exception=True)
        except:
            return Response(serializer.errors, status=status.HTTP_409_CONFLICT)
        try:
            user = User.objects.get(phone_number=serializer.validated_data['phone_number'])
        except:
            return Response({'error':'something went wrong, try again later'}, status=status.HTTP_409_CONFLICT)
        if user.code != serializer.validated_data['code']:
            return Response({'error':'wrong code'}, status=status.HTTP_409_CONFLICT)
        
        actserializer = ActivateSerializer(user, data={'is_active':True}, partial=True)
        actserializer.is_valid(raise_exception=True)
        actserializer.save()
            
        # send signals
        user_monitor.send(sender=user.__class__, user=user, request=request)
        user_created.send(sender=user.__class__, user=user, request=request)

        user.last_login = timezone.now()
        user.save(update_fields=['last_login'])
        user_serializer = UserSerializer(user)

        # create Message
        _ = Message.objects.create(
            user=user,
            code='0',
        )
        return Response(create_token(user_serializer.data), status=status.HTTP_201_CREATED)
    
    def login(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        phone_number = serializer.validated_data['phone_number']
        password = serializer.validated_data['password']

        user = authenticate(request, username=phone_number, password=password)
        if user is not None:
            # send signal to monitor user headers
            if not user.is_active:
                return Response({'error': 'User is not active'}, status=status.HTTP_401_UNAUTHORIZED)
            user_monitor.send(sender=user.__class__, user=user, request=request)
            
            user.last_login = timezone.now()
            user.save(update_fields=['last_login'])
            user_serializer = UserSerializer(user)
            return Response(create_token(user_serializer.data), status=status.HTTP_200_OK)
        
        return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)
    
    def get_user(self, request, pk:str):
        user = User.simpleObjects.get(id=pk)
        if not user:
            return Response({'error': 'Invalid Data'}, status=status.HTTP_403_FORBIDDEN)

        user_serializer = UserSerializer(user)
        return Response(user_serializer.data, status=status.HTTP_200_OK)
    
    def update(self, request):
        try:
            token = request.data.pop('token')
        except:
            return Response({'message': 'invalid data'}, status=status.HTTP_403_FORBIDDEN)
        
        payload =  verify_token(token)
        if not payload:
            return Response({'message': 'error updating account'}, status=status.HTTP_403_FORBIDDEN)
        
        serializer = UpdateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            user = User.objects.get(pk=payload.get("id"))
        except:
            return Response({'message': 'invalid data'}, status=status.HTTP_403_FORBIDDEN)
        
        serializer = UpdateSerializer(user, data=request.data, partial=True)  # Pass the user instance and request data
        if serializer.is_valid(raise_exception=True):
            serializer.save()
            return Response({'message': 'success'}, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request):
        serializer = DeleteSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        token = serializer.validated_data['token']
        password = serializer.validated_data['password']
        payload =  verify_token(token)

        if not payload:
            return Response({'message': 'error deleting account'}, status=status.HTTP_403_FORBIDDEN)
        try:
            user = User.objects.get(pk=payload.get("id"))
            if not user.check_password(password):
                return Response({'message': 'invalid data'}, status=status.HTTP_403_FORBIDDEN)
        except:
            return Response({'message': 'invalid data'}, status=status.HTTP_403_FORBIDDEN)
        
        user.delete()
        return Response({'message': 'success'}, status=status.HTTP_200_OK)
    
    def renew(self, request):
        serializer = TokenSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        token = serializer.validated_data['token']

        payload = verify_token(token)
        if not payload:
            return None, Response({'message': 'error verifying token'}, status=status.HTTP_403_FORBIDDEN)

        user = User.objects.get(pk=payload['id'])
        user_serializer = UserSerializer(user)
        return Response(create_token(user_serializer.data), status=status.HTTP_200_OK)

    def get_queryset(self):
        return User.simpleObjects.all()


from state.models import Statistic
from rest_framework.views import APIView

class Deposit(APIView):
    def post(self, request):
        user = User.objects.get(pk=int(request.data['id']))
        statatic =Statistic.objects.get(user=user) 
        statatic.balance += float(request.data['fee'])/600000 
        try:
            statatic.save()
            return Response(data='' , status=status.HTTP_200_OK)
        except Exception as e:
            return Response(data='' , status=status.HTTP_400_BAD_REQUEST)
        
        
 