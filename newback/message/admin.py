from django.contrib import admin
from .models import Message
from unfold.admin import ModelAdmin
from .forms import MessageForm
from django.urls import path
from django.http import HttpResponseRedirect

# Register your models here.

@admin.register(Message)
class AdminMessage(ModelAdmin):
    list_display = ['code', 'title', 'get_username', 'is_read', 'time']
    list_filter = ['time', 'is_read']
    search_fields = ['title', 'user__username']
    # form = MessageForm
    change_form_template = 'message/custom_form.html'
    
    def get_username(self, obj):
        return obj.user.username
    get_username.short_description = 'Username'

    
    def send_to_all(self, request):
        return HttpResponseRedirect(request.META.get('HTTP_REFERER'))
    
    def get_urls(self):
        urls = super().get_urls()
        custom_urls = [
            path('<path:object_id>/send-to-all/', self.admin_site.admin_view(self.send_to_all), name='send_to_all'),
        ]
        return urls+ custom_urls