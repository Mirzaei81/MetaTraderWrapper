# Generated by Django 5.0.6 on 2024-09-12 23:51

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('account', '0006_alter_user_managers_remove_user_role'),
    ]

    operations = [
        migrations.AddField(
            model_name='user',
            name='code',
            field=models.CharField(default=123456, max_length=6),
            preserve_default=False,
        ),
    ]
