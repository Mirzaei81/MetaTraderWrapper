# Generated by Django 4.2.16 on 2024-10-10 09:02

from django.db import migrations


class Migration(migrations.Migration):
    dependencies = [
        ("state", "0025_alter_statistic_commission_off_ratio_and_more"),
    ]

    operations = [
        migrations.RemoveField(
            model_name="statistic",
            name="commission_number",
        ),
        migrations.RemoveField(
            model_name="statistic",
            name="commission_profit",
        ),
    ]
