from django.contrib import admin
from .models import User
from unfold.admin import ModelAdmin

# Register your models here.
@admin.register(User)
class AdminUser(ModelAdmin):
     list_display = [ 'username','real_name','id',  'phone_number', 'is_active', 'is_superuser']
     search_fields = ['phone_number']
     list_filter = ['is_active']