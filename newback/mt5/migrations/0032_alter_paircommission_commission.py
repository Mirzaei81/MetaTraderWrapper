# Generated by Django 4.2.16 on 2024-10-05 07:55

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('mt5', '0031_alter_paircommission_commission'),
    ]

    operations = [
        migrations.AlterField(
            model_name='paircommission',
            name='commission',
            field=models.FloatField(default=0, null=True),
        ),
    ]
