# Generated by Django 4.2.16 on 2024-10-05 08:12

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('mt5', '0032_alter_paircommission_commission'),
    ]

    operations = [
        migrations.AlterField(
            model_name='pairs',
            name='max_balance',
            field=models.FloatField(default=100000),
        ),
        migrations.AlterField(
            model_name='pairs',
            name='min_balance',
            field=models.FloatField(default=1),
        ),
        migrations.AlterField(
            model_name='pairs',
            name='unit',
            field=models.FloatField(default=0.01),
        ),
    ]
