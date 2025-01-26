from django.db import models
from django.contrib.auth.models import AbstractUser
from django.core.validators import RegexValidator
from .manager import SimpleUserManager

# Create your models here.
class User(AbstractUser):
    username = models.CharField(max_length=256, blank=False, null=False, unique=True)
    real_name = models.CharField(max_length=256, blank=False)
    phone_number = models.CharField(
        unique=True,
        max_length=20,
        validators=[
            RegexValidator(
                regex=r'^\+?1?\d{9,12}$',
                message="Phone number must be entered in the format: '+999999999'. Up to 12 digits allowed."
            )
        ]
    )
    is_active = models.BooleanField(default=False)
    code = models.CharField(max_length=6)
    bank_number = models.CharField(max_length=126)
    password = models.CharField(max_length=512)
    # is_superuser = models.BooleanField(default=False)
    # is_staff = models.BooleanField(default=False)
    created = models.DateTimeField(auto_now_add=True)
    updated = models.DateTimeField(auto_now=True)
    last_login = models.DateTimeField(null=True)
    referer = models.CharField(max_length=20, blank=True, null=True)
    # image = models.URLField(max_length=1000, null=True)
    
    simpleObjects = SimpleUserManager()

    REQUIRED_FIELDS = ['phone_number', 'password']

    class Meta:
        indexes = [
            models.Index(fields=['-created']),
            models.Index(fields=['username'])
        ]

        verbose_name = 'User'
        verbose_name_plural = 'Users'

    def __str__(self) -> str:
        return self.username
    
