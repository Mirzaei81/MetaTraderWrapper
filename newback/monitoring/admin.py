from django.contrib import admin
from unfold.admin import ModelAdmin
from .models import MonitorUserModel
# Register your models here.


@admin.register(MonitorUserModel)
class AdminUser(ModelAdmin):
    list_display = ['id', 'user_name', 'ip', 'agent', 'time']
    list_filter = ('time',)

    def user_name(self, obj):
          return obj.user.username
     
    user_name.short_description = 'Username'