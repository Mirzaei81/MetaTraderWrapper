
from django.contrib import admin
from .models import Trade

class PositiveNegativeFilter(admin.SimpleListFilter):
    title = 'Profit'  # Title of the filter
    parameter_name = 'profit_value'  # URL parameter for the filter

    def lookups(self, request, model_admin):
        return (
            ('positive','Positive'),
            ('negative','Negative'),
        )

    def queryset(self, request, queryset):
        if self.value() == 'positive':
            return queryset.filter(profit__gt=0)  
        if self.value() == 'negative':
            return queryset.filter(profit__lt=0)
        return queryset