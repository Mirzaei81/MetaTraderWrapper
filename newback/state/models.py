from django.db import models
from account.models import User
from django.utils import timezone
from django.core.exceptions import ValidationError
from message.models import Message

class Statistic(models.Model):
    user = models.ForeignKey(User, related_name="statistics", null=False,unique=True, on_delete=models.CASCADE)
    balance = models.FloatField(default=0)
    equity = models.FloatField(default=0)
    margin = models.FloatField(default=0)
    margin_level = models.FloatField(default=0)
    free_margin = models.FloatField(default=0)
    total_trades = models.IntegerField(default=0)
    buys = models.IntegerField(default=0)
    sells = models.IntegerField(default=0)
    profit = models.FloatField(default=0)
    wins = models.IntegerField(default=0)
    losses = models.IntegerField(default=0)
    min_withdraw = models.IntegerField(default=10,blank=False,null=False)
    swap_off_ratio = models.FloatField(default=1,blank=False,null=False)
    commission_off_ratio = models.FloatField(default=1,blank=False,null=False)

    def __str__(self) -> str:
        return f"{self.user.username}'s statistics"



class WithdrawalRequest(models.Model):
    user = models.ForeignKey(User, blank=False,null=False, on_delete=models.CASCADE)
    amount = models.FloatField(default=0, null=False, blank=False)
    exchange_rate = models.FloatField(default=0)
    STATUS_CHOICES = [
        ('0', 'In Progress'),
        ('1', 'Approved'),
        ('2', 'Rejected'),
    ]
    status = models.CharField(max_length=64, null=False, choices=STATUS_CHOICES)
    comment = models.CharField(max_length=1024, default='', blank=True, null=True)
    request_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def clean(self):
        if self.user_id:
            user_statistic = Statistic.objects.filter(user=self.user)
            if len(user_statistic) ==1:
                user_statistic = Statistic.objects.get(user=self.user)
                if self.amount < user_statistic.min_withdraw :
                    raise ValidationError("The withdrawal amount is below the defined limit.")
            else:
                raise ValidationError("Statistic for this user does not exist.")

        if self.status == '1' and self.exchange_rate == 0:
            raise ValidationError("Exchange rate must be non-zero if the status is 'Approved'.")

        if self.status == '1' and (self.comment is None or self.comment.strip() == ''):
            raise ValidationError("Please fill comment.(Comment field)")

        if self.status == '2' and (self.comment is None or self.comment.strip() == ''):
            raise ValidationError("Please specify the reason for disapproval.(Comment field)")

        if self.pk is not None:
            old_instance = WithdrawalRequest.objects.get(pk=self.pk)
            if old_instance.amount != self.amount:
                raise ValidationError("The amount field cannot be changed.")

    def save(self, *args, **kwargs):
        is_creating = self.pk is None
        self.full_clean()

        if not is_creating:
            old_instance = WithdrawalRequest.objects.get(pk=self.pk)
        else:
            old_instance = None

        super(WithdrawalRequest, self).save(*args, **kwargs)

        if is_creating:
            user_statistic = Statistic.objects.get(user=self.user)
            if user_statistic.free_margin > self.amount:
                user_statistic.balance -= self.amount
                user_statistic.save()
                _ = Message.objects.create(
                    user=self.user,
                    withdraw_amount=self.amount,
                    code="21"
                )
            else:
                raise ValidationError("You have insufficient free margin.")

        if old_instance is not None:
            if old_instance.status != '2' and self.status == '2':
                user_statistic = Statistic.objects.get(user=self.user)
                user_statistic.balance += self.amount
                user_statistic.save()
                _ = Message.objects.create(
                user=self.user,
                code="23"
                      )
                _ = Message.objects.create(
                user=self.user,
                title='Withdraw rejected',
                content=self.comment,
                code="10"
                     )
                
            elif old_instance.status != '1' and self.status == '1':
                _ = Message.objects.create(
                    user=self.user,
                    withdraw_amount=self.amount,
                    withdraw_rial =self.exchange_rate*self.amount,
                    code="22"
                )

            elif old_instance.status == '2' and self.status != '2':
                user_statistic = Statistic.objects.get(user=self.user)
                if user_statistic.free_margin > self.amount:
                    user_statistic.balance -= self.amount
                    user_statistic.save()
                    _ = Message.objects.create(
                        user=self.user,
                        withdraw_amount=self.amount,
                        code="21"
                    )
                else:
                    raise ValidationError("You have insufficient free margin to change the status.")

            elif old_instance.status == '1' and self.status == '0':
                user_statistic = Statistic.objects.get(user=self.user)
                _ = Message.objects.create(
                    user=self.user,
                    withdraw_amount=self.amount,
                    code="21"
                    )





