# Generated by Django 4.2.16 on 2024-10-05 07:21

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('mt5', '0030_alter_pairs_options'),
    ]

    operations = [
        migrations.AlterField(
            model_name='paircommission',
            name='commission',
            field=models.FloatField(default=1, null=True),
        ),
    ]
