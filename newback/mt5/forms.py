from django import forms
from django.contrib import admin
from .models import MT5Account

class MT5AccountAdminForm(forms.ModelForm):
    server = forms.CharField(label='Server name', max_length=100, required=True)
    account = forms.CharField(label='Account number', max_length=64, required=True)
    password = forms.CharField(label='Password', max_length=2000, required=True)

    class Meta:
        model = MT5Account
        fields = '__all__'

    def save(self, commit=True):
        instance = super().save(commit)
        # Handle saving your extra fields here if necessary
        return instance