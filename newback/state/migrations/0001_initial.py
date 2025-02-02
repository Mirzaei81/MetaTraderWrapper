# Generated by Django 5.0.6 on 2024-09-11 15:19

import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='Statistic',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('balance', models.FloatField(default=0)),
                ('total_trades', models.IntegerField(default=0)),
                ('buys', models.IntegerField(default=0)),
                ('sells', models.IntegerField(default=0)),
                ('profit', models.FloatField(default=0)),
                ('wins', models.IntegerField(default=0)),
                ('losses', models.IntegerField(default=0)),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='balance', to=settings.AUTH_USER_MODEL)),
            ],
        ),
    ]
