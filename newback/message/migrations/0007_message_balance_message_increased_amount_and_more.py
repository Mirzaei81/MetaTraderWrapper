# Generated by Django 4.2.16 on 2024-09-20 11:40

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('message', '0006_rename_order_id_message_order_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='message',
            name='balance',
            field=models.CharField(blank=True, max_length=126, null=True),
        ),
        migrations.AddField(
            model_name='message',
            name='increased_amount',
            field=models.CharField(blank=True, max_length=126, null=True),
        ),
        migrations.AddField(
            model_name='message',
            name='withdraw_amount',
            field=models.CharField(blank=True, max_length=126, null=True),
        ),
        migrations.AddField(
            model_name='message',
            name='withdraw_rial',
            field=models.CharField(blank=True, max_length=126, null=True),
        ),
    ]
