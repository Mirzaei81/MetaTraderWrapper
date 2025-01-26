from django.dispatch import Signal, receiver
from account.models import User
from state.models import Statistic
import os
from dotenv import load_dotenv
load_dotenv()

trade_closed = Signal()
poursant = Signal()


@receiver(poursant)
def calculate_commission_poursant(sender, user, commission, **kwargs):
    """    
    create a statistics profile for user
    """

    referer = user.referer

    try:
        referee = User.objects.get(phone_number=referer)
    except Exception as e:
        return 
    try:
        stat = Statistic.objects.get(user=referee)
    except Exception as e:
        return

    stat.balance +=commission* int(os.environ.get('POURSANT'))/100
    stat.equity +=commission* int(os.environ.get('POURSANT'))/100
    stat.free_margin +=commission* int(os.environ.get('POURSANT'))/100
    stat.commission_profit +=commission* int(os.environ.get('POURSANT'))/100
    stat.commission_number +=1
    stat.save()
        
