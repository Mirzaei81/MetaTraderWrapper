# Generated by Django 4.2.16 on 2024-09-17 16:04

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('mt5', '0020_trade_current'),
    ]

    operations = [
        migrations.AddField(
            model_name='mt5account',
            name='file_path',
            field=models.CharField(default=1, max_length=512),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='pairs',
            name='account',
            field=models.ForeignKey(default=1, on_delete=django.db.models.deletion.CASCADE, related_name='symbols', to='mt5.mt5account'),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='pairs',
            name='digits',
            field=models.SmallIntegerField(null=True),
        ),
        migrations.AlterField(
            model_name='pairs',
            name='ask',
            field=models.FloatField(null=True),
        ),
        migrations.AlterField(
            model_name='pairs',
            name='bid',
            field=models.FloatField(null=True),
        ),
        migrations.AlterField(
            model_name='pairs',
            name='high',
            field=models.FloatField(null=True),
        ),
        migrations.AlterField(
            model_name='pairs',
            name='low',
            field=models.FloatField(null=True),
        ),
    ]
