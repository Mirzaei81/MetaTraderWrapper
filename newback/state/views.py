from django.conf import settings
import requests
import json
from rest_framework import viewsets, status
from rest_framework.response import Response
from account.models import User
from account.oauth import verify_token
from .models import WithdrawalRequest
from state.models import Statistic
from .serializers import RequestSerializer

def verify_token_from_request(request):
    try:
        token = request.data.pop('token')
    except KeyError:
        return None, Response({'message': 'invalid data'}, status=status.HTTP_403_FORBIDDEN)

    payload = verify_token(token)
    if not payload:
        return None, Response({'message': 'error verifying token'}, status=status.HTTP_403_FORBIDDEN)

    return payload, None



class withdrawalrquestViewSet(viewsets.ViewSet):

    def rquest(self,request):
        """
        close all in loss trades
        """
        serializer = RequestSerializer(data=request.data)
        try:
            serializer.is_valid(raise_exception=True)
        except:
            print(serializer.errors)
            return Response(serializer.errors, status=status.HTTP_409_CONFLICT)

        payload, error_response = verify_token_from_request(request)
        if error_response:
            return error_response

        user=User.objects.get(pk=payload['id'])
        user_statistic = Statistic.objects.get(user=user)
        if serializer.validated_data['amount'] < user_statistic.free_margin or serializer.validated_data['amount'] < user_statistic.min_withdraw:
            withdrawal = WithdrawalRequest(
                user=user,
                amount= serializer.validated_data['amount'],
                status='0',
            )
            withdrawal.save()
        else:
            return Response( error='NOT_ACCEPTABLE',status=status.HTTP_406_NOT_ACCEPTABLE)


        return Response( status=status.HTTP_200_OK)
