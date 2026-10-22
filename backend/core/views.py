from django.db.models import Count, Q, Sum
from rest_framework import status, viewsets
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticatedOrReadOnly
from rest_framework.response import Response
from drf_spectacular.utils import extend_schema

from .filters import ClientFilter, ProjectFilter, TaskFilter
from .models import Client, Project, ProjectStatus, Task
from .serializers import (
    ClientSerializer,
    DashboardStatsSerializer,
    ProjectDetailSerializer,
    ProjectSerializer,
    TaskSerializer,
)


class ClientViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing agency clients.
    Uses ORM annotation to prevent N+1 queries when counting linked projects.
    """
    queryset = Client.objects.annotate(
        projects_count=Count('projects')
    ).order_by('-created_at')
    serializer_class = ClientSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    filterset_class = ClientFilter
    search_fields = ['name', 'company_name', 'email']
    ordering_fields = ['name', 'company_name', 'created_at', 'projects_count']


class ProjectViewSet(viewsets.ModelViewSet):
    """
    ViewSet for project lifecycle management.
    Uses select_related('client') and conditional Count annotations.
    """
    queryset = Project.objects.select_related('client').annotate(
        tasks_count=Count('tasks', distinct=True),
        completed_tasks_count=Count(
            'tasks',
            filter=Q(tasks__is_completed=True),
            distinct=True
        )
    ).order_by('-created_at')
    permission_classes = [IsAuthenticatedOrReadOnly]
    filterset_class = ProjectFilter
    search_fields = ['title', 'description', 'client__name', 'client__company_name']
    ordering_fields = ['budget', 'deadline', 'created_at', 'title', 'status']

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return ProjectDetailSerializer
        return ProjectSerializer


class TaskViewSet(viewsets.ModelViewSet):
    """
    ViewSet for project tasks.
    Includes a custom toggle action for rapid completion updates.
    """
    queryset = Task.objects.select_related('project').order_by('is_completed', '-due_date')
    serializer_class = TaskSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    filterset_class = TaskFilter
    search_fields = ['title']
    ordering_fields = ['due_date', 'priority', 'created_at', 'is_completed']

    @action(detail=True, methods=['post'], url_path='toggle')
    def toggle_completion(self, request, pk=None):
        """Toggle is_completed boolean with one call."""
        task = self.get_object()
        task.is_completed = not task.is_completed
        task.save()
        serializer = self.get_serializer(task)
        return Response(serializer.data, status=status.HTTP_200_OK)


@extend_schema(
    summary="Dashboard Metrics and Statistics",
    description="Aggregated key performance indicators for the agency dashboard",
    responses={200: DashboardStatsSerializer}
)
@api_view(['GET'])
@permission_classes([AllowAny])
def dashboard_stats(request):
    """
    Calculates executive agency metrics using high-efficiency SQL aggregations:
    - Total clients
    - Active projects count & active projects total budget
    - Global task completion percentage
    - Recent 5 projects
    """
    total_clients = Client.objects.count()
    active_projects_qs = Project.objects.filter(status=ProjectStatus.IN_PROGRESS)
    active_projects_count = active_projects_qs.count()
    
    total_active_budget_result = active_projects_qs.aggregate(
        total_budget=Sum('budget')
    )['total_budget']
    total_active_budget = total_active_budget_result if total_active_budget_result is not None else 0

    total_projects = Project.objects.count()
    total_tasks = Task.objects.count()
    completed_tasks = Task.objects.filter(is_completed=True).count()
    
    task_completion_rate = (
        round((completed_tasks / total_tasks) * 100, 1)
        if total_tasks > 0 else 0.0
    )

    recent_projects_qs = Project.objects.select_related('client').order_by('-created_at')[:5]
    recent_projects_data = ProjectSerializer(recent_projects_qs, many=True).data

    data = {
        'total_clients': total_clients,
        'active_projects': active_projects_count,
        'total_active_budget': total_active_budget,
        'total_projects': total_projects,
        'total_tasks': total_tasks,
        'completed_tasks': completed_tasks,
        'task_completion_rate': task_completion_rate,
        'recent_projects': recent_projects_data,
    }

    return Response(data, status=status.HTTP_200_OK)
