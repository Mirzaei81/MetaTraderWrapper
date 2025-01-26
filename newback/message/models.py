from django.db import models
from account.models import User
from mt5.models import Trade, FutureTrades

# Create your models here.
class Message(models.Model):
    user = models.ForeignKey(User, related_name='messages', blank=True, on_delete=models.CASCADE)
    title = models.CharField(max_length=256, blank=True, null=True)
    content = models.TextField(max_length=2048,null=True, blank=True)
    sender = models.CharField(max_length=126, default='admin')
    is_read = models.BooleanField(default=False)
    trade = models.ForeignKey(Trade, blank=True, null=True, related_name='messages', on_delete=models.CASCADE)
    order = models.ForeignKey(FutureTrades, blank=True, null=True, related_name='messages', on_delete=models.CASCADE)
    CODE_CHOICES = [
        ('0', 'Welcome'),
        ('1', 'Open Trade'),
        ('2', 'Close Trade'),
        ('3', 'Modify Trade'),
        ('4', 'Open Order'),
        ('5', 'Close Order'),
        ('6', 'Close Delete'),
        ('10', 'admin Message'),
        ('20', 'Balance increase'),
        ('21', 'Withdraw accept'),
        ('22', 'Withdraw completed'),
        ('23', 'Withdraw rejected'),
        ('99', 'Liquidate'),
    ]
    code = models.CharField(max_length=64, null=True, choices=CODE_CHOICES)
    
    increased_amount = models.CharField(max_length=126, null=True, blank=True)
    balance = models.CharField(max_length=126, null=True, blank=True)
    withdraw_amount = models.CharField(max_length=126, null=True, blank=True)
    withdraw_rial = models.CharField(max_length=126, null=True, blank=True)
    
    time = models.DateTimeField(auto_now=True)
    time_read = models.DateTimeField(blank=True, null=True)

    class Meta:
        ordering=['-time']
    
    def __str__(self) -> str:
        return f'code {self.code} -> {self.title}'
    