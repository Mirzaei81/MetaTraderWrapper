from django.test import TestCase
from account.serializers import LoginSerializer, SignupSerializer, UserSerializer
from account.oauth import create_token
from django.utils import timezone
from account.models import User

# Create your tests here.
class SampleUser:
    def create_single_user(self, username='john', phone='+989900900090', password="johnDow") -> str:
        
        serializer = SignupSerializer(data={
            'username':username,
            'phone':phone,
            'password':password
        })
        if not serializer.is_valid():
            return 
        user = serializer.save()
        user.last_login = timezone.now()
        user.save(update_fields=['last_login'])
        user_serializer = UserSerializer(user)
        self.user = user
        self.token = create_token(user_serializer.data)
        return self.user
    
    def get_user(self):
        return self.user
    def get_token(self):
        return self.token