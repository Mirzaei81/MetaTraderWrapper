# Generated by Django 4.2.16 on 2024-10-03 12:07

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('message', '0009_alter_message_code'),
    ]

    operations = [
        migrations.AlterField(
            model_name='message',
            name='code',
            field=models.CharField(choices=[('0', 'Welcome'), ('1', 'Open Trade'), ('2', 'Close Trade'), ('3', 'Modify Trade'), ('4', 'Open Order'), ('5', 'Close Order'), ('10', 'admin Message'), ('20', 'Balance increase'), ('21', 'Withdraw accept'), ('22', 'Withdraw completed'), ('23', 'Withdraw rejected'), ('99', 'Liquidate')], max_length=64, null=True),
        ),
        migrations.AlterField(
            model_name='message',
            name='content',
            field=models.TextField(blank=True, max_length=2048, null=True),
        ),
    ]
