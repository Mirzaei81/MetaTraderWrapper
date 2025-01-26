from django.db import models
from account.models import User
# Create your models here.
class Transaction(models.Model):
    user = models.ForeignKey(User,
                             related_name="transactions",
                             null=False,
                             on_delete=models.DO_NOTHING)
    
    TYPE_CHOICES = (
        ('withdraw', 'Withdraw'),
        ('deposit', 'Deposit'),
    )
    type = models.CharField(max_length=20, choices=TYPE_CHOICES)
    amount_rial = models.CharField()
    amount_dollar = models.CharField()
    bank_number = models.CharField(max_length=126)
    transaction_id = models.CharField(max_length=512)
    
    time = models.DateTimeField()

    def __str__(self) -> str:
        return f'{self.user.username}\'s transactions'
    

class ZarinpalSetting(models.Model):
    merchant = models.CharField(max_length=1000)
    