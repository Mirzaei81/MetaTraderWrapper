from django.contrib import admin
from .models import Statistic,WithdrawalRequest
from unfold.admin import ModelAdmin
# Register your models here.

@admin.register(Statistic)
class AdminUser(ModelAdmin):
    list_display = ['user', 'balance','equity','free_margin','total_trades','buys',
                    'sells','profit','wins','losses']
    list_filter = ('profit','balance','margin')


@admin.register(WithdrawalRequest)
class AdminUser(ModelAdmin):
    list_display = ['user', 'amount','status','request_at','updated_at','exchange_rate' ]
    list_filter =  ['user', 'status','request_at','updated_at','exchange_rate' ]





