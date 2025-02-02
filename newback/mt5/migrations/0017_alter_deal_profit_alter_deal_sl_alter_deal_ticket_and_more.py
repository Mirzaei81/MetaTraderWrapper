# Generated by Django 4.2.16 on 2024-09-16 10:04

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('mt5', '0016_alter_pairs_max_allowed_price_and_more'),
    ]

    operations = [
        migrations.AlterField(
            model_name='deal',
            name='profit',
            field=models.FloatField(null=True),
        ),
        migrations.AlterField(
            model_name='deal',
            name='sl',
            field=models.FloatField(null=True),
        ),
        migrations.AlterField(
            model_name='deal',
            name='ticket',
            field=models.PositiveBigIntegerField(null=True),
        ),
        migrations.AlterField(
            model_name='deal',
            name='tp',
            field=models.FloatField(null=True),
        ),
    ]
