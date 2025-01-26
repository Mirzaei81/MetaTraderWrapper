from .models import Statistic
from django.dispatch import receiver
from account.signals import user_created
from mt5.signals import trade_closed
from mt5.models import Pairs
# Create your views here.

@receiver(user_created)
def get_user_data(sender, user, request, **kwargs):
    """    
    create a statistics profile for user
    """
    try:
        stat = Statistic.objects.get(user=user)
    except:
        created = Statistic.objects.create(user=user)
        print(f"User {user.username} statictics was {'success' if created else 'fail'}")


@receiver(trade_closed)
def change_user_stat(sender, request, user, trade, **kwargs):
    """
    change user stat when a trade is closed
    """
    stat = Statistic.objects.get(user=user)
    profit = trade.profit
    type = trade.type

    stat.total_trades +=1
    stat.profit += profit
    stat.balance += profit
    stat.equity = stat.balance
    # stat.free_margin = stat.balance
    symbol = trade.symbol
    used_margin = trade.unit*symbol.min_balance
    # print(f"------------------ {used_margin} ----------------  {trade.unit}, {symbol.min_balance}")
    stat.free_margin += used_margin + profit
    # stat.equity += profit

    if profit>=0:
        stat.wins += 1
    else:
        stat.losses += 1

    if type == 'buy':
        stat.buys += 1
    else:
        stat.sells += 1

    stat.save(update_fields=['total_trades', 'profit', 'balance', 'equity', 'free_margin', 'wins', 'losses', 'buys', 'sells'])