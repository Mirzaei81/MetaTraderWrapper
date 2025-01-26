from django.conf import settings
import requests
import json
from rest_framework import viewsets, status
from rest_framework.response import Response
from account.models import User
from account.oauth import verify_token
from .models import Transaction
from .serializers import TransactionSerializer
from django.conf import settings
from django.http import JsonResponse


if settings.SANDBOX:
    sandbox = 'sandbox'
else:
    sandbox = 'www'


ZP_API_REQUEST = f"https://{sandbox}.zarinpal.com/pg/rest/WebGate/PaymentRequest.json"
ZP_API_VERIFY = f"https://{sandbox}.zarinpal.com/pg/rest/WebGate/PaymentVerification.json"
ZP_API_STARTPAY = f"https://{sandbox}.zarinpal.com/pg/StartPay/"

amount = 1000  # Rial / Required
description = "توضیحات مربوط به تراکنش را در این قسمت وارد کنید"  # Required
phone = 'YOUR_PHONE_NUMBER'  # Optional
# Important: need to edit for realy server.
CallbackURL = 'http://127.0.0.1:8080/verify/'

MERCHANT = 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'
def send_request(request):
    data = {
        "MerchantID": MERCHANT,
        "Amount": amount,
        "Description": description,
        "Phone": phone,
        "CallbackURL": CallbackURL,
    }
    data = json.dumps(data)
    # set content length by data
    headers = {'content-type': 'application/json', 'content-length': str(len(data)) }
    try:
        response = requests.post(ZP_API_REQUEST, data=data,headers=headers, timeout=10)

        if response.status_code == 200:
            response = response.json()
            if response['Status'] == 100:
                return {'status': True, 'url': ZP_API_STARTPAY + str(response['Authority']), 'authority': response['Authority']}
            else:
                return {'status': False, 'code': str(response['Status'])}
        return response
    
    except requests.exceptions.Timeout:
        return {'status': False, 'code': 'timeout'}
    except requests.exceptions.ConnectionError:
        return {'status': False, 'code': 'connection error'}


def verify(authority):
    data = {
        "MerchantID": MERCHANT,
        "Amount": amount,
        "Authority": authority,
    }
    data = json.dumps(data)
    # set content length by data
    headers = {'content-type': 'application/json', 'content-length': str(len(data)) }
    response = requests.post(ZP_API_VERIFY, data=data,headers=headers)

    if response.status_code == 200:
        response = response.json()
        if response['Status'] == 100:
            return {'status': True, 'RefID': response['RefID']}
        else:
            return {'status': False, 'code': str(response['Status'])}
    return response

def verify_token_from_request(request):
    try:
        token = request.data.pop('token')
    except KeyError:
        return None, Response({'message': 'invalid data'}, status=status.HTTP_403_FORBIDDEN)

    payload = verify_token(token)
    if not payload:
        return None, Response({'message': 'error verifying token'}, status=status.HTTP_403_FORBIDDEN)

    return payload, None

class transactionsViewSet(viewsets.ViewSet):

    def transactions(self,request):
        """
        close all in loss trades
        """
        payload, error_response = verify_token_from_request(request)
        if error_response:
            return error_response

        user=User.objects.get(pk=payload['id'])
        transactions = Transaction.objects.filter(user=user)
        transactions_data = TransactionSerializer(transactions, many=True).data

        return Response(transactions_data, status=status.HTTP_200_OK)













