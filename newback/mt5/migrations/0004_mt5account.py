# Generated by Django 5.0.6 on 2024-09-13 11:44

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('mt5', '0003_alter_pairs_options_pairs_max_price'),
    ]

    operations = [
        migrations.CreateModel(
            name='MT5Account',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('server', models.CharField(max_length=100)),
                ('account', models.CharField(max_length=64)),
                ('password', models.CharField(max_length=2000)),
            ],
        ),
    ]
