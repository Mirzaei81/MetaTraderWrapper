# Github.com/Rasooll
from django.urls import path
from . import views

urlpatterns = [
    path('rquest', views.withdrawalrquestViewSet.as_view({
        'post': 'rquest'
    })),

]
