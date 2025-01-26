# Generated by Django 4.2.16 on 2024-09-15 12:47

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('mt5', '0011_alter_pairsettlement_friday_and_more'),
    ]

    operations = [
        migrations.AlterModelOptions(
            name='paircommission',
            options={'verbose_name': 'Commission', 'verbose_name_plural': 'Commissions'},
        ),
        migrations.AlterModelOptions(
            name='pairsettlement',
            options={'verbose_name': 'Settlement', 'verbose_name_plural': 'Settlements (ساعت تسویه)'},
        ),
        migrations.AlterModelOptions(
            name='pairswap',
            options={'verbose_name': 'Swap', 'verbose_name_plural': 'Swaps'},
        ),
        migrations.RenameField(
            model_name='paircommission',
            old_name='commission_buy',
            new_name='commission',
        ),
        migrations.RenameField(
            model_name='pairs',
            old_name='leverage',
            new_name='max_leverage',
        ),
        migrations.RemoveField(
            model_name='paircommission',
            name='commission_future_buy',
        ),
        migrations.RemoveField(
            model_name='paircommission',
            name='commission_future_sell',
        ),
        migrations.RemoveField(
            model_name='paircommission',
            name='commission_sell',
        ),
        migrations.AddField(
            model_name='paircommission',
            name='commission_buy_ratio',
            field=models.FloatField(default=1, null=True),
        ),
        migrations.AddField(
            model_name='paircommission',
            name='commission_sell_ratio',
            field=models.FloatField(default=1, null=True),
        ),
        migrations.AlterField(
            model_name='pairs',
            name='allow_settlement',
            field=models.BooleanField(verbose_name='users can disable auto settlement?'),
        ),
        migrations.AlterField(
            model_name='pairs',
            name='users',
            field=models.ManyToManyField(related_name='pairs', to=settings.AUTH_USER_MODEL, verbose_name='users (that have this symbol in their watchlist)'),
        ),
        migrations.AlterField(
            model_name='pairsettlement',
            name='saturday',
            field=models.TimeField(null=True),
        ),
        migrations.AlterField(
            model_name='pairsettlement',
            name='sunday',
            field=models.TimeField(null=True),
        ),
        migrations.AlterField(
            model_name='pairswap',
            name='swap_buy',
            field=models.FloatField(null=True),
        ),
        migrations.AlterField(
            model_name='pairswap',
            name='swap_buy_ratio',
            field=models.FloatField(null=True),
        ),
        migrations.AlterField(
            model_name='pairswap',
            name='swap_sell',
            field=models.FloatField(null=True),
        ),
        migrations.AlterField(
            model_name='pairswap',
            name='swap_sell_ratio',
            field=models.FloatField(null=True),
        ),
        migrations.CreateModel(
            name='PairName',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('en', models.CharField(max_length=64)),
                ('fa', models.CharField(max_length=64)),
                ('kur', models.CharField(max_length=64)),
                ('pair', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='names', to='mt5.pairs')),
            ],
            options={
                'verbose_name': 'Name',
                'verbose_name_plural': 'Names',
            },
        ),
    ]
