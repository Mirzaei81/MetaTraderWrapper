# Github.com/Rasooll
from django.urls import path
from . import views
from .api_views import *

urlpatterns = [
    path('payment/request/', request_payment, name='request_payment'),
    path('payment/verify/', verify_payment, name='verify_payment'),
    path('request/', views.send_request, name='request'),
    path('verify/', views.verify , name='verify'),
    path('transactions', views.transactionsViewSet.as_view({
        'post': 'transactions'
    })),

]
