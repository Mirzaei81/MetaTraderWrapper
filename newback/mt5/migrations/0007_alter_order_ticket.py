# Generated by Django 4.2.16 on 2024-09-13 20:41

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('mt5', '0006_order_result'),
    ]

    operations = [
        migrations.AlterField(
            model_name='order',
            name='ticket',
            field=models.PositiveBigIntegerField(null=True),
        ),
    ]
