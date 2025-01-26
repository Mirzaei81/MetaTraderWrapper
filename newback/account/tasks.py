import requests
import json
import os
from celery import shared_task
from dotenv import load_dotenv
load_dotenv()

@shared_task
def send_sms(phone_number:str, code:str ):

    url = "https://api2.ippanel.com/api/v1/sms/send/webservice/single"
    payload =json.dumps({
    # "code": "s5tqxch6d233za3",
    "sender": "+983000505",
    "recipient": [phone_number],    
    "message": f"به متاکپی خوش آمدید. کد تایید شما {code}"
    })
    headers = {
        'apikey': os.environ.get('SMS_API'),
        'Content-Type': 'application/json'
    }

    response = requests.request("POST", url, headers=headers, data=payload)
    print(response.text)
    
