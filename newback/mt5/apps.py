from django.apps import AppConfig
from .tasks import Mt5Task
from django.apps import apps
import importlib


class Mt5Config(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'mt5'

    def ready(self) -> None:
        import mt5.signals 
        
        mt5 = Mt5Task()
        mt5.login()
                
