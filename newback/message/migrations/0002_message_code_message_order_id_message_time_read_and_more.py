# Generated by Django 4.2.16 on 2024-09-20 08:35

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('mt5', '0028_alter_trade_commission_alter_trade_profit_and_more'),
        ('message', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='message',
            name='code',
            field=models.CharField(choices=[('1', 'Open Trade'), ('2', 'Close Trade'), ('3', 'Modify Trade'), ('4', 'Open Order'), ('5', 'Close Order'), ('10', 'admin Message'), ('20', 'Balance increase'), ('21', 'Withdraw accept'), ('22', 'Withdraw completed'), ('30', 'History File Ready'), ('99', 'Liquidate')], max_length=64, null=True),
        ),
        migrations.AddField(
            model_name='message',
            name='order_id',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='messages', to='mt5.order'),
        ),
        migrations.AddField(
            model_name='message',
            name='time_read',
            field=models.DateTimeField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='message',
            name='trade_id',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='messages', to='mt5.trade'),
        ),
    ]
