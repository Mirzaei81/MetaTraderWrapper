from .models import MonitorUserModel

from django.dispatch import receiver
from account.signals import user_monitor
from .helper_functions import get_client_ip
# Create your views here.

@receiver(user_monitor)
def get_user_data(sender, user, request, **kwargs):
    """    
    Perform additional actions on user's IP
    """

    ip = get_client_ip(request)
    agent = request.headers['User-Agent']

    created = MonitorUserModel.objects.create(user=user, ip=ip, agent=agent) #created is an instance of MonitorUserModel
    print(f"User {user} from IP: {ip}  was {'success' if created else 'fail'}")
