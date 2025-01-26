import os
from celery import Celery

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'MetaCopy.settings')

app = Celery('MetaCopy')
app.config_from_object('django.conf:settings', namespace='CELERY')

app.conf.beat_schedule = {
    'send_trade_update_1s':{
        'task': 'mt5.celery_task.send_trade_price',
        'schedule': 1.0
    },
    'send_price_update_1s':{
        'task': 'mt5.celery_task.send_symbol_price',
        'schedule': 1.0
    },
    'update_future_trades_2s':{
        'task': 'mt5.celery_task.update_future_trades',
        'schedule': 1.0
    },

}

app.autodiscover_tasks(['mt5.celery_task', 'account.tasks'])