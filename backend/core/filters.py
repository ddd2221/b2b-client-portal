import django_filters
from .models import Client, Project, Task


class ClientFilter(django_filters.FilterSet):
    status = django_filters.CharFilter(lookup_expr='iexact')

    class Meta:
        model = Client
        fields = ['status']


class ProjectFilter(django_filters.FilterSet):
    min_budget = django_filters.NumberFilter(field_name='budget', lookup_expr='gte')
    max_budget = django_filters.NumberFilter(field_name='budget', lookup_expr='lte')
    status = django_filters.CharFilter(lookup_expr='iexact')
    client = django_filters.NumberFilter(field_name='client_id')

    class Meta:
        model = Project
        fields = ['status', 'client', 'min_budget', 'max_budget']


class TaskFilter(django_filters.FilterSet):
    project = django_filters.NumberFilter(field_name='project_id')
    priority = django_filters.CharFilter(lookup_expr='iexact')
    is_completed = django_filters.BooleanFilter(field_name='is_completed')

    class Meta:
        model = Task
        fields = ['project', 'priority', 'is_completed']
