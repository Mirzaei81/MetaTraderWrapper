import json
from channels.generic.websocket import AsyncWebsocketConsumer
from account.oauth import verify_token
from asgiref.sync import sync_to_async
import asyncio
from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer

class TradeConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        try:
            token = self.scope['query_string'].decode().split('=')[1]
        except Exception as e:
            await self.close()
            return

        payload = verify_token(token)
        if not payload:
            await self.close()
            return

        self.user_id = payload['id']
        self.room_group_name = f'chat_{payload["username"]}'+str(payload['id'])
        
        await self.channel_layer.group_add(self.room_group_name, self.channel_name)
        await self.accept()

        self.keep_sending = True
        asyncio.create_task(self.send_user_data_periodically())

    async def disconnect(self, close_code):
        if hasattr(self, 'room_group_name'):
            await self.channel_layer.group_discard(self.room_group_name, self.channel_name)
        
        self.keep_sending = False

    async def send_user_data_periodically(self):
        from .models import Trade, FutureTrades, Pairs, User
        from state.models import Statistic
        from .serializers import PairsSerializer, PendingSerializer, Trade2Serializer, StatSerializer
        from mt5.tasks import Mt5Task
        from message.models import Message
        from message.serializers import MessageResultSerializer
        from zarinpal.models import Transaction
        from zarinpal.serializers import TransactionSerializer

        mt5 = Mt5Task()
        while self.keep_sending:
            try:
                user = await sync_to_async(User.objects.get)(pk=self.user_id)
                trades = await sync_to_async(list)(Trade.objects.filter(user=user, state='open'))
                pending = await sync_to_async(list)(FutureTrades.objects.filter(user=user))
                pairs = await sync_to_async(list)(Pairs.objects.only('ask', 'bid').all())
                stat = await sync_to_async(Statistic.objects.get)(user=user)

                symbol_serializer_data = await sync_to_async(lambda: PairsSerializer(pairs, many=True).data)()
                trade_serializer_data = await sync_to_async(lambda: Trade2Serializer(trades, many=True).data)()
                pending_serializer_data = await sync_to_async(lambda: PendingSerializer(pending, many=True).data)()
                stat_serializer_data = await sync_to_async(lambda: StatSerializer(stat).data)()
                
                response_data = {
                    'pairs': symbol_serializer_data,
                    'trades': trade_serializer_data,
                    'pending': pending_serializer_data,
                    'statistic': stat_serializer_data,
                }

                await self.send(text_data=json.dumps(response_data))
                await asyncio.sleep(1)

            except Exception as e:
                print(e)
                await asyncio.sleep(1)

    async def receive_group_message(self, event):
        message = event['message']
        await self.send(text_data=json.dumps(message))

def send_custom_message_to_user(username, id, data):
    channel_layer = get_channel_layer()
    room_group_name = f'chat_{username}'+str(id)
    async_to_sync(channel_layer.group_send)(
        room_group_name,
        {
            'type': 'receive_group_message',
            'message': data,
        }
    )

