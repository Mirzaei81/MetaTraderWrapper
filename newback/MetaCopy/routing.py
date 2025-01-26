from django.urls import path, re_path

def get_websocket_urlpatterns():
    from mt5.consumers import TradeConsumer 
    return [
        re_path(r'ws/trade_list/?$', TradeConsumer.as_asgi()),
        # re_path(r'ws/price_list/?$', PriceConsumer.as_asgi()),
    ]

websocket_urlpatterns = get_websocket_urlpatterns()
