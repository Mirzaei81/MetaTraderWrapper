# Generated by Django 4.2.16 on 2024-10-03 09:58

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('state', '0014_statistic_max_withdraw_statistic_min_withdraw'),
    ]

    operations = [
        migrations.AlterField(
            model_name='statistic',
            name='min_withdraw',
            field=models.IntegerField(default=10000),
        ),
    ]
