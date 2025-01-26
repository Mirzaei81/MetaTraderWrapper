from rest_framework import viewsets, status
from rest_framework.response import Response
from .serializers import MessageSerializer, MessageResultSerializer,\
                         MessageQuerySerializer
from account.oauth import verify_token
from account.models import User
from .models import Message
from django.utils import timezone


# Create your views here.

class MessageViewSet(viewsets.ViewSet):
    def messages(self, request):
        """
        get messages of a user
        """
        serializer = MessageSerializer(data=request.data)
        try:
            serializer.is_valid(raise_exception=True)
        except:
            return Response(serializer.errors, status=status.HTTP_409_CONFLICT)

        token = serializer.validated_data['token']
        payload = verify_token(token)
        if not payload:
            return Response({'message': 'error verifying token'}, status=status.HTTP_403_FORBIDDEN)

        try:
            user = User.objects.get(pk=payload['id'])
        except:
            return Response({'message': 'user not found'}, status=status.HTTP_404_NOT_FOUND)
        
        messages = Message.objects.filter(user=user)

        message_serializer = MessageResultSerializer(messages, many=True)

        return Response(message_serializer.data, status=status.HTTP_200_OK)
    
    def set_read(self, request):
        """
        change message state to read
        """
        serializer = MessageQuerySerializer(data=request.data)
        try:
            serializer.is_valid(raise_exception=True)
        except:
            return Response(serializer.errors, status=status.HTTP_409_CONFLICT)

        token = serializer.validated_data['token']
        payload = verify_token(token)
        if not payload:
            return Response({'message': 'error verifying token'}, status=status.HTTP_403_FORBIDDEN)

        try:
            message = Message.objects.get(pk=serializer.validated_data['id'])
            message.is_read = True
            message.time_read = timezone.now()
            message.save(update_fields=['is_read', 'time_read'])
        except:
            return Response({'message': 'message not found'}, status=status.HTTP_404_NOT_FOUND)
        
        return  Response({'message':'success'}, status=status.HTTP_200_OK)
        
    def delete_message(self, request):
        """
        delete old messages by user request
        """
        serializer = MessageQuerySerializer(data=request.data)
        try:
            serializer.is_valid(raise_exception=True)
        except:
            print(serializer.errors)
            return Response(serializer.errors, status=status.HTTP_409_CONFLICT)

        token = serializer.validated_data['token']
        payload = verify_token(token)
        if not payload:
            return Response({'message': 'error verifying token'}, status=status.HTTP_403_FORBIDDEN)

        try:
            message = Message.objects.get(pk=serializer.validated_data['id'])
            message.delete()
        except:
            return Response({'message': 'message not found'}, status=status.HTTP_404_NOT_FOUND)
        
        return  Response({'message':'success'}, status=status.HTTP_200_OK)
        
