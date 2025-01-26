from . import views_trade as trade
from . import views_report as report
from . import views_symbols as symbol
from django.urls import path

urlpatterns = [
    path('account/<str:account>', trade.Mt5ViewSet.as_view({
        'get': 'account'
    })),
    path('symbol/<str:account>/<str:symbol>', trade.Mt5ViewSet.as_view({
        'get': 'symbol'
    })),
    path('trade', trade.Mt5ViewSet.as_view({
        'post': 'trade'
    })),
    path('position_info', trade.Mt5ViewSet.as_view({
        'post': 'position_info'
    })),
    path('modify', trade.Mt5ViewSet.as_view({
        'post': 'modify'
    })),
    path('modify_pending', trade.Mt5ViewSet.as_view({
        'post': 'modify_pending'
    })),
    path('close_single', trade.Mt5ViewSet.as_view({
        'post': 'close_single'
    })),
    path('close_all', trade.Mt5ViewSet.as_view({
        'post': 'close_all'
    })),
    path('close_profit', trade.Mt5ViewSet.as_view({
        'post': 'close_profit'
    })),
    path('close_loss', trade.Mt5ViewSet.as_view({
        'post': 'close_loss'
    })),
    path('close_buys', trade.Mt5ViewSet.as_view({
        'post': 'close_buys'
    })),
    path('close_sells', trade.Mt5ViewSet.as_view({
        'post': 'close_sells'
    })),
    path('close_order', trade.Mt5ViewSet.as_view({
        'post': 'close_future'
    })),
    path('all_user_data', trade.Mt5ViewSet.as_view({
        'post': 'all_user_data'
    })),
    path('user_trades', trade.Mt5ViewSet.as_view({
        'post': 'user_trades'
    })),
    path('user_deals', trade.Mt5ViewSet.as_view({
        'post': 'user_deals'
    })),
    path('user_orders', trade.Mt5ViewSet.as_view({
        'post': 'user_orders'
    })),


    path('symbols', symbol.Mt5ViewSet.as_view({
        'get': 'get_symbols'
    })),
    path('add_symbol', symbol.Mt5ViewSet.as_view({
        'post': 'add_symbol'
    })),
    path('view_symbols', symbol.Mt5ViewSet.as_view({
        'post': 'view_symbol'
    })),

    path('excel/trade', report.Mt5FileViewSet.as_view({
        'post': 'trades_excel'
    })),
    path('excel/deal', report.Mt5FileViewSet.as_view({
        'post': 'deals_excel'
    })),
    path('excel/order', report.Mt5FileViewSet.as_view({
        'post': 'orders_excel'
    })),
]