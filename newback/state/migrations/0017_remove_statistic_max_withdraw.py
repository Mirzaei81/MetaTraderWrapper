# Generated by Django 4.2.16 on 2024-10-03 11:44

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('state', '0016_alter_statistic_max_withdraw_and_more'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='statistic',
            name='max_withdraw',
        ),
    ]
