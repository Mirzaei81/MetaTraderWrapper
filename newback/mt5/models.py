from django.db import models
from account.models import User
# Create your models here.

class MT5Account(models.Model):
    server = models.CharField(max_length=100)
    account = models.CharField(max_length=64)
    password = models.CharField(max_length=2000)
    leverage = models.IntegerField(default=1,null=False, blank=False)

    class Meta:
        verbose_name = 'Mt5 Account'

    def __str__(self) -> str:
        return f"account {self.account} on {self.server} server"

class Pairs(models.Model):
    name = models.CharField(max_length=64)
    ask = models.FloatField(null=True, blank=True)
    bid = models.FloatField(null=True, blank=True)
    high = models.FloatField(null=True, blank=True)
    low = models.FloatField(null=True, blank=True)
    digits = models.SmallIntegerField(null=True, blank=True)
    unit = models.FloatField(default=0.01,null=False, blank=False)
    min_unit = models.FloatField(null=True, blank=True)
    max_unit = models.FloatField(null=True, blank=True)
    step = models.FloatField(null=True, blank=True )
    min_balance = models.FloatField(default=1,null=False, blank=False)
    max_balance = models.FloatField(default=100000,null=False, blank=False)
    contract_size  = models.FloatField(default=1,null=False, blank=False)
    max_leverage = models.FloatField(null=True, blank=True)
    unit_tax = models.FloatField(null=True, blank=True)
    max_allowed_price = models.FloatField(null=True, blank=True)
    min_allowed_price = models.FloatField(null=True, blank=True)
    commission_buy = models.FloatField(null=False, blank=False, default=1)
    commission_sell = models.FloatField(null=False, blank=False, default=1)
    commission_buy_ratio = models.DecimalField(null=False, blank=False,max_digits=20, decimal_places=12) #FloatField(null=False, blank=False, default=1)
    commission_sell_ratio = models.DecimalField(null=False, blank=False,max_digits=20, decimal_places=12)
    swap_buy = models.FloatField(null=False, blank=False, default=0)
    swap_sell = models.FloatField(null=False, blank=False, default=0)
    swap_buy_ratio = models.DecimalField(null=False, blank=False,max_digits=20, decimal_places=12)
    swap_sell_ratio = models.DecimalField(null=False, blank=False,max_digits=20, decimal_places=12)
    margin_varianc = models.DecimalField(default=0,null=False, blank=False,max_digits=20, decimal_places=12)
    call_margin_ratio = models.DecimalField(default=1,null=False, blank=False,max_digits=20, decimal_places=12)
    allow_settlement = models.BooleanField(verbose_name='users can disable auto settlement?')
    users = models.ManyToManyField(User, 
                                   related_name="pairs",
                                   blank=True,
                                   verbose_name='users (that have this symbol in their watchlist)')
    last_update = models.TimeField(auto_now=True)
    class Meta: 
        ordering=['name']
        verbose_name = 'Pair'
        verbose_name_plural = 'Pairs'

    def __str__(self) -> str:
        return self.name

class PairName(models.Model):
    pair = models.ForeignKey(Pairs, related_name='names', on_delete=models.CASCADE)
    en = models.CharField(max_length=64,null=False, blank=False)
    fa = models.CharField(max_length=64,null=False, blank=False)
    kur = models.CharField(max_length=64,null=False, blank=False)
        
    class Meta: 
        verbose_name = 'Name'
        verbose_name_plural = 'Names'
    
    def __str__(self) -> str:
        return f'{self.id}'

class PairCommission(models.Model):
    pair = models.ForeignKey(Pairs, related_name='commissions', on_delete=models.CASCADE)
    commission = models.FloatField(null=True, default=0)
    commission_buy_ratio = models.FloatField(null=True, default=1)
    commission_sell_ratio = models.FloatField(null=True, default=1)
    
    class Meta: 
        verbose_name = 'Commission'
        verbose_name_plural = 'Commissions'
    
    def __str__(self) -> str:
        return f'{self.id}'
    
class PairSwap(models.Model):
    pair = models.ForeignKey(Pairs, related_name='swaps', on_delete=models.CASCADE)
    swap = models.FloatField(null=True, default=0)
    swap_buy = models.FloatField(null=True, default=1)
    swap_sell = models.FloatField(null=True, default=1)
    swap_buy_ratio = models.FloatField(null=True, default=1)
    swap_sell_ratio = models.FloatField(null=True, default=1)

    class Meta: 
        verbose_name = 'Swap'
        verbose_name_plural = 'Swaps'

    def __str__(self) -> str:
        return f'{self.id}'

class PairSettlement(models.Model):
    pair = models.ForeignKey(Pairs, related_name='settlement_days', on_delete=models.CASCADE)
    saturday = models.TimeField(null=True)
    sunday = models.TimeField(null=True)
    monday = models.TimeField()
    tuesday = models.TimeField()
    wednesday = models.TimeField()
    thursday = models.TimeField()
    friday = models.TimeField()

    class Meta: 
        verbose_name = 'Settlement'
        verbose_name_plural = 'Settlements (ساعت تسویه)'

    def __str__(self) -> str:
        return f'daily settlement time {self.id}'

class Trade(models.Model):
    user = models.ForeignKey(User,
                             related_name="trades",
                             on_delete=models.CASCADE)
    symbol = models.ForeignKey(Pairs, 
                               related_name="trades",
                               null=True,
                               on_delete=models.SET_NULL)
    entry = models.FloatField()
    current = models.FloatField(null=True)
    margin = models.FloatField(default=0,null=False,blank=False)
    exit = models.FloatField(null=True)
    ticket = models.PositiveBigIntegerField()
    type = models.CharField(max_length=32)
    unit = models.FloatField()
    leverage = models.FloatField()
    sl = models.FloatField(null=True)
    tp = models.FloatField(null=True)
    
    STATE_CHOICES = (
        ('open', 'Open'),
        ('close', 'Close'),
    )
    state = models.CharField(max_length=8, choices=STATE_CHOICES, default='open')
    
    profit = models.FloatField(null=True, default=0)
    commission = models.FloatField(null=True, default=0)
    swap = models.FloatField(null=True,default=0)
    time = models.DateTimeField()
    settlement = models.BooleanField(default=True)
    
    class Meta:
        ordering = ['-time']
        indexes = [
            models.Index(fields=['user'])
        ]
    # def __str__(self) -> str:
    #     return f'{self.user.username} traded {self.unit} units of {self.symbol.name}'
    
class Deal(models.Model):
    user = models.ForeignKey(User,
                             related_name="deals",
                             on_delete=models.CASCADE)
    symbol = models.ForeignKey(Pairs, 
                               related_name="deals",
                               null=True,
                               on_delete=models.SET_NULL)
    price = models.FloatField()
    ticket = models.PositiveBigIntegerField(null=True)
    margin = models.FloatField(default=0,null=False,blank=False)
    trade_id = models.PositiveBigIntegerField(null=True)
    type = models.CharField(max_length=32)
    DIR_CHOICES = (
        ('in', 'in'),
        ('out', 'out')
    )
    dir = models.CharField(max_length=8, choices=DIR_CHOICES)
    unit = models.FloatField()
    leverage = models.FloatField()
    profit = models.FloatField(null=True)
    time = models.DateTimeField()
    commission = models.FloatField()

    class Meta:
        ordering = ['-time']
        indexes = [
            models.Index(fields=['user'])
        ]
    def __str__(self) -> str:
        return f'{self.user.username} added a deal of {self.unit} units of {self.symbol.name}'
    
class Order(models.Model):
    user = models.ForeignKey(User,
                             related_name="orders",
                             on_delete=models.CASCADE)
    symbol = models.ForeignKey(Pairs, 
                               related_name="orders",
                               null=True,
                               on_delete=models.SET_NULL)
    price = models.FloatField()
    margin = models.FloatField(default=0,null=False,blank=False)
    ticket = models.PositiveBigIntegerField(null=True)
    trade_id = models.PositiveBigIntegerField(null=True)
    type = models.CharField(max_length=32)
    unit = models.FloatField()
    leverage = models.FloatField()
    time = models.DateTimeField()
    RESULT_CHOICES = [
        ('filled','filled'),
        ('requote','requote'),
        ('cancelled','cancelled')
    ]
    result = models.CharField(choices=RESULT_CHOICES, null=True)
    class Meta:
        ordering = ['-time']
        indexes = [
            models.Index(fields=['user'])
        ]

    # def __str__(self) -> str:
    #     return f'{self.user.username} created an order of {self.unit} units of {self.symbol.name}'

class FutureTrades(models.Model):
    user = models.ForeignKey(User,
                             related_name="future_trades",
                             on_delete=models.CASCADE)
    symbol = models.ForeignKey(Pairs, 
                               related_name="future_trades",
                               null=True,
                               on_delete=models.SET_NULL)
    entry = models.FloatField()
    type = models.CharField(max_length=32)
    unit = models.FloatField()
    leverage = models.FloatField()
    sl = models.FloatField()
    tp = models.FloatField()
    time = models.DateTimeField(auto_now=True)
    
    # def __str__(self) -> str:
    #     return f"pending {self.type} from {self.user.username} at {self.entry}"
    
    class Meta:
        verbose_name = "Pending Order"
        verbose_name_plural = "Pending Orders"

class Margin(models.Model):
    min_balance = models.FloatField(verbose_name="min balance before call margin")
    callmargin_level = models.FloatField(default=50, null=False, blank=False)
    free_margin_ratio = models.FloatField(default=1, null=True, blank=True)
    class Meta:
        verbose_name = "Margin"

class Off(models.Model):
    user  = models.ForeignKey(User,
                             related_name="off",
                             on_delete=models.CASCADE)
    commission_ratio = models.FloatField(default=1)