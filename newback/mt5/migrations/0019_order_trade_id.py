# Generated by Django 4.2.16 on 2024-09-16 11:08

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('mt5', '0018_remove_deal_sl_remove_deal_tp'),
    ]

    operations = [
        migrations.AddField(
            model_name='order',
            name='trade_id',
            field=models.PositiveBigIntegerField(null=True),
        ),
    ]
