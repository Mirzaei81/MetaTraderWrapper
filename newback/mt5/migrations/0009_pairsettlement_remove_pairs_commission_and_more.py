# Generated by Django 4.2.16 on 2024-09-15 11:44

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('mt5', '0008_deal_trade_id'),
    ]

    operations = [
        migrations.CreateModel(
            name='PairSettlement',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('saturday', models.DateTimeField()),
                ('sunday', models.DateTimeField()),
                ('monday', models.DateTimeField()),
                ('tuesday', models.DateTimeField()),
                ('wednesday', models.DateTimeField()),
                ('thursday', models.DateTimeField()),
                ('friday', models.DateTimeField()),
            ],
        ),
        migrations.RemoveField(
            model_name='pairs',
            name='commission',
        ),
        migrations.RemoveField(
            model_name='pairs',
            name='commission_future',
        ),
        migrations.RemoveField(
            model_name='pairs',
            name='commission_poursant',
        ),
        migrations.RemoveField(
            model_name='pairs',
            name='daily_swap_buy',
        ),
        migrations.RemoveField(
            model_name='pairs',
            name='daily_swap_sell',
        ),
        migrations.AddField(
            model_name='pairs',
            name='allow_settlement',
            field=models.BooleanField(default=0),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='trade',
            name='settlement',
            field=models.BooleanField(default=True),
        ),
        migrations.CreateModel(
            name='PairSwap',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('swap_buy', models.FloatField()),
                ('swap_sell', models.FloatField()),
                ('swap_buy_ratio', models.FloatField()),
                ('swap_sell_ratio', models.FloatField()),
                ('pair', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='swaps', to='mt5.pairs')),
            ],
        ),
        migrations.CreateModel(
            name='PairCommission',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('commission_buy', models.FloatField()),
                ('commission_sell', models.FloatField()),
                ('commission_future_buy', models.FloatField()),
                ('commission_future_sell', models.FloatField()),
                ('pair', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='commissions', to='mt5.pairs')),
            ],
        ),
    ]
