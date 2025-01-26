from django.contrib import admin
from .models import *
from unfold.admin import ModelAdmin, TabularInline
from .admin_filters import PositiveNegativeFilter
from django.contrib import messages
from .celery_task import close_trade

# Register your models here.

class PairCommissionInline(TabularInline):
     model = PairCommission
     extra = 0
     fields = ['commission','commission_buy_ratio', 'commission_sell_ratio']

class PairSwapInline(TabularInline):
     model = PairSwap
     extra = 0
     fields = ['swap','swap_buy_ratio', 'swap_sell_ratio']

class PairSettlementInline(TabularInline):
     model = PairSettlement
     extra = 0

class PairNameInline(TabularInline):
     model = PairName
     extra = 0
@admin.register(Pairs)
class AdminPair(ModelAdmin):
     list_display = [ 'name','id', 'unit', 'min_unit', 'max_unit', 'step', 'max_leverage']
     search_fields = ['name']
     ordering = ['name']
     readonly_fields = ('max_leverage',)
     inlines = [  PairNameInline,  PairSettlementInline]

     def save_model(self, request, obj, form, change):
        if form.cleaned_data['min_balance'] != 0:  # Avoid division by zero
            obj.max_leverage = form.cleaned_data['max_balance'] / form.cleaned_data['min_balance']
        else:
            obj.max_leverage = 1  # or some default value if needed
        super().save_model(request, obj, form, change)

@admin.register(Trade)
class AdminTrade(ModelAdmin):
     list_display = ['user', 'symbol', 'entry', 'ticket', 'time', 'state']
     search_fields = ['symbol__name', 'user__username']
     list_filter=['state', PositiveNegativeFilter]
     ordering = ['-time']
     actions = ['close_all_open_trades']

     def close_all_open_trades(self, request, queryset):
          open_trades = queryset.filter(state='open')

          if not open_trades.exists():
               messages.warning(request, "No open trades selected.")
               return

          for trade in open_trades:
               close_trade.delay(trade.id)
          self.message_user(request, f"{open_trades.count()} trades closed.")

     close_all_open_trades.short_description = "Close selected open trades"

@admin.register(Deal)
class AdminDeal(ModelAdmin):
     list_display = ['user', 'symbol', 'price', 'time', 'type', 'dir']
     search_fields = ['symbol__name', 'user__username']
     ordering = ['-time']


@admin.register(Order)
class AdminOrder(ModelAdmin):
     list_display = ['user', 'symbol', 'price', 'time', 'type']
     search_fields = ['symbol__name', 'user__username']
     ordering = ['-time']


@admin.register(FutureTrades)
class AdminPending(ModelAdmin):
     list_display = ['user', 'symbol', 'entry', 'type', 'unit', 'sl', 'tp', 'leverage']
     search_fields = ['symbol__name', 'user__username']
     ordering = ['-id']


@admin.register(MT5Account)
class AdminMT5(ModelAdmin):
     list_display = ['account', 'password', 'server']


@admin.register(Margin)
class AdminMargin(ModelAdmin):
     list_display = ['min_balance']