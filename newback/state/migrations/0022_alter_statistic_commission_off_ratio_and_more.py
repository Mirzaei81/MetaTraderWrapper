# Generated by Django 4.2.16 on 2024-10-10 06:38

from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("state", "0021_statistic_commission_off_ratio"),
    ]

    operations = [
        migrations.AlterField(
            model_name="statistic",
            name="commission_off_ratio",
            field=models.DecimalField(decimal_places=7, default=1, max_digits=10),
        ),
        migrations.AlterField(
            model_name="statistic",
            name="commission_profit",
            field=models.DecimalField(decimal_places=7, default=1, max_digits=10),
        ),
    ]
