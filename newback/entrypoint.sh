python /app/manage.py migrate

celery -A MetaCopy  worker -l INFO --pool=solo --without-mingle
celery -A MetaCopy beat -l INFO --scheduler django_celery_beat.schedulers:DatabaseScheduler

daphne -b 0.0.0.0 -p 8000 MetaCopy.asgi:application