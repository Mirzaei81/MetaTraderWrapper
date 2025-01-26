from django.db import models
from account.models import User
# Create your models here.

class MonitorUserModel(models.Model):
    user = models.ForeignKey(User, 
                             related_name='IPs',
                             null=True,
                             blank=True,
                             on_delete=models.CASCADE)
    ip = models.CharField(max_length=64)
    agent = models.CharField(max_length=512)
    time = models.DateTimeField(auto_now=True)

    def __str__(self) -> str:
        return f"{self.user.username} interacted with ip {self.ip}"