import requests
from django.conf import settings
from rest_framework.response import Response
from rest_framework.decorators import api_view

@api_view(['POST'])
def request_payment(request):
    print(request.data)

    amount = request.data['amount'] 
    description = "خرید محصول"
    email = request.data.get('email', "user@example.com")  
    mobile = request.data.get('mobile', "09120000000")  

    data = {
        "MerchantID": 'd1f81c45-846d-40c1-b64c-f9ed32619e6a',
        "Amount": amount,
        "Description": description,
        "CallbackURL": settings.ZARINPAL_CALLBACK_URL,
        "metadata": {"email": email, "mobile": mobile},
    }

    response = requests.post(
        "https://www.zarinpal.com/pg/rest/WebGate/PaymentRequest.json",
        # "https://sandbox.zarinpal.com/pg/rest/WebGate/PaymentRequest.json",
        json=data,
    )

    response_data = response.json()
    print("Response status code:", response.status_code)
    print("Response content:", response.content) 
    print("Response:", response) 

    try:
        response_data = response.json()  
    except ValueError:
        return Response({"status": "failed", "message": "Invalid response from Zarinpal."}, status=500)
    if response_data["Status"] == 100:
        print("url:", settings.ZARINPAL_STARTPAY + response_data["Authority"])
        return Response({
            "status": "success",
            "url": settings.ZARINPAL_STARTPAY + response_data["Authority"]
        })
    # else:
    return Response({"status": "failed", "message": "Error occurred while creating payment request."}, status=400)


@api_view(['GET'])
def verify_payment(request):
    authority = request.GET.get('Authority')
    status = request.GET.get('Status')

    if status == "OK":
        data = {
            "merchant_id": settings.ZARINPAL_MERCHANT_ID,
            "authority": authority,
            "amount": 10000,  # مبلغ باید دقیقاً همان مقداری باشد که برای پرداخت فرستاده شده بود
        }

        response = requests.post(
            "https://www.zarinpal.com/pg/rest/WebGate/PaymentRequest.json",
            json=data,
        )

        response_data = response.json()

      
      
        if response_data["Status"] == 100:
            return Response({
                "status": "success",
                "ref_id": response_data["RefID"]
            })
        else:
            return Response({"status": "failed", "message": "Transaction failed!"}, status=400)
    else:
        return Response({"status": "failed", "message": "Transaction canceled by user!"}, status=400)
