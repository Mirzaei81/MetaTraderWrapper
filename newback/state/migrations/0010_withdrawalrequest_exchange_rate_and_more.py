# Generated by Django 4.2.16 on 2024-10-03 07:38

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('state', '0009_withdrawalrequest'),
    ]

    operations = [
        migrations.AddField(
            model_name='withdrawalrequest',
            name='exchange_rate',
            field=models.FloatField(default=0),
        ),
        migrations.AddField(
            model_name='withdrawalrequest',
            name='reason_for_rejection',
            field=models.CharField(blank=True, default='', max_length=102, null=True),
        ),
        migrations.AlterField(
            model_name='withdrawalrequest',
            name='status',
            field=models.CharField(choices=[('0', 'In Progress'), ('1', 'Approved'), ('2', 'Rejected')], max_length=64),
        ),
    ]
