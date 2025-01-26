import datetime
import jwt
import os
from dotenv import load_dotenv
from pathlib import Path
BASE_DIR = Path(__file__).resolve().parent.parent

# Load environment variables from the .env file in the account app
load_dotenv(os.path.join(BASE_DIR, 'account', '.env'))

ACCESS_TOKEN_EXPIRY_MINUTES = int(os.environ['ACCESS_TOKEN_EXPIRY_MINUTES'])
ALGORITHM = os.environ['ALGORITHM']
SECRET = os.environ['SECRET']

def create_token (payload:dict):
    copy = payload.copy()
    
    expire = datetime.datetime.now() + datetime.timedelta(minutes = ACCESS_TOKEN_EXPIRY_MINUTES)
    copy.update({"exp" : expire})
    
    encoded_jwt = jwt.encode(copy, SECRET, algorithm = ALGORITHM)
    return encoded_jwt 

def verify_token(token:str):

    try:
        payload = jwt.decode(token, SECRET, algorithms = [ALGORITHM])
        username: str = payload.get("username")
        expire = datetime.datetime.now() + datetime.timedelta(minutes = ACCESS_TOKEN_EXPIRY_MINUTES)
        payload['exp'] = expire

        if not username :
            return 
    except :
        return 

    return payload
