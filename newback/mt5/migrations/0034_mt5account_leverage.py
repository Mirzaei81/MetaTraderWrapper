# Generated by Django 4.2.16 on 2024-10-05 09:41

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('mt5', '0033_alter_pairs_max_balance_alter_pairs_min_balance_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='mt5account',
            name='leverage',
            field=models.IntegerField(default=1),
        ),
    ]
