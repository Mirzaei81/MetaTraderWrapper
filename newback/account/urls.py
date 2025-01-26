from django.urls import path
from . import views

app_name = 'account'

urlpatterns = [
    path('get/<str:pk>', views.UserViewSet.as_view({
        'get':'get_user'
    })),
    path('signup', views.UserViewSet.as_view({
        'post':'signup'
    })),
    path('verify', views.UserViewSet.as_view({
        'post':'verify'
    })),
    path('login', views.UserViewSet.as_view({
        'post':'login'
    })),
    path('update', views.UserViewSet.as_view({
        'post':'update'
    })),
    path('delete', views.UserViewSet.as_view({
        'post':'delete'
    })),
    path('renew', views.UserViewSet.as_view({
        'post':'renew'
    })),
    # path('payment', views.Deposit.as_view(), name='payment'),
]