from django.utils import timezone
from rest_framework import viewsets, status
from rest_framework.response import Response

from account.models import User
from .models import Pairs
from .serializers import SymbolSerializer, AddSymbolSerializer
from .tasks import Mt5Task
from account.oauth import verify_token
# Create your views here. 
mt5 = Mt5Task()

class Mt5ViewSet(viewsets.ViewSet):    
    def get_symbols(self, request):
        """
        get symbol info
        """

        try:
            pairs = Pairs.objects.all()
            try:
                serializer = SymbolSerializer(pairs, many=True)
            except Exception as e:
                print(e)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Exception as e:
            print(e)
            return Response({"message":"error loading symbols"}, status=status.HTTP_409_CONFLICT)
    
    def add_symbol(self, request):
        """
        add a symbol to user watchlist
        """
        payload, error_response = verify_token_from_request(request)
        if error_response:
            return error_response
        
        serializer = AddSymbolSerializer(data=request.data)
        if serializer.is_valid(raise_exception=True):
            try:
                symbol = Pairs.objects.get(pk=serializer.validated_data['id'])
            except:
                return Response({'message':'failed', 'error':'symbol not found'}, status=status.HTTP_400_BAD_REQUEST)

            try:
                user = User.objects.get(pk=payload['id'])
            except:
                return Response({'message':'failed', 'error':'user not found'}, status=status.HTTP_400_BAD_REQUEST)
            
            # add user to symbol
            symbol.users.add(user)
            return Response({'message':'success'}, status=status.HTTP_200_OK)
        
        return Response({'message':'failed', 'error':'data is not valid'}, status=status.HTTP_400_BAD_REQUEST)

    def view_symbols(self, request):
        """
        send symbol data to front
        """
        payload, error_response = verify_token_from_request(request)
        if error_response:
            return error_response
        
        user = User.objects.get(pk=payload['id'])
        try:
            pairs = Pairs.objects.filter(user=user)
        except:
            return Response({'message':'failed','error':'no symbols found'}, status=status.HTTP_404_NOT_FOUND)
        
        serializer = SymbolSerializer(pairs, many=True)
        return Response({**{'message':'success'},**serializer.data}, status=status.HTTP_200_OK)

def verify_token_from_request(request):
    try:
        token = request.data.pop('token')
    except KeyError:
        return None, Response({'message': 'invalid data'}, status=status.HTTP_403_FORBIDDEN)

    payload = verify_token(token)
    if not payload:
        return None, Response({'message': 'error verifying token'}, status=status.HTTP_403_FORBIDDEN)

    return payload, None