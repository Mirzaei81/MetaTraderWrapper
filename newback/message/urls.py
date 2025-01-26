from django.urls import path
from . import views

app_name = 'message'

urlpatterns = [
    path('messages', views.MessageViewSet.as_view({
        'post':'messages'
    })),
    path('set_read', views.MessageViewSet.as_view({
        'post':'set_read'
    })),
    path('delete', views.MessageViewSet.as_view({
        'post':'delete_message'
    })),
]