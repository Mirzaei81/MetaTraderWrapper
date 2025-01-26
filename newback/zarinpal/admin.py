from django.contrib import admin
from unfold.admin import ModelAdmin
from .models import Transaction
# Register your models here.

@admin.register(Transaction)
class AdminUser(ModelAdmin):
    list_display = ['user', 'type',
'amount_rial',
'amount_dollar',
'bank_number',
'time']
    list_filter = ('type','amount_dollar')