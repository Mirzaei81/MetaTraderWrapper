# Generated by Django 4.2.16 on 2024-10-08 23:02

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('mt5', '0044_pairs_commission_buy_pairs_commission_sell'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='pairs',
            name='commission',
        ),
        migrations.RemoveField(
            model_name='pairs',
            name='swap',
        ),
    ]
