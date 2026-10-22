from rest_framework import serializers
from .models import Client, Project, Task


class TaskSerializer(serializers.ModelSerializer):
    """Serializer for Task CRUD operations."""
    project_title = serializers.CharField(source='project.title', read_only=True)

    class Meta:
        model = Task
        fields = [
            'id',
            'project',
            'project_title',
            'title',
            'priority',
            'is_completed',
            'due_date',
            'created_at',
        ]
        read_only_fields = ['id', 'created_at']


class ClientSerializer(serializers.ModelSerializer):
    """Serializer for Client management with project count calculation."""
    projects_count = serializers.SerializerMethodField()

    class Meta:
        model = Client
        fields = [
            'id',
            'name',
            'company_name',
            'email',
            'status',
            'projects_count',
            'created_at',
        ]
        read_only_fields = ['id', 'created_at']

    def get_projects_count(self, obj) -> int:
        # Uses pre-annotated value if available for N+1 performance, fallback to query
        if hasattr(obj, 'projects_count'):
            return obj.projects_count
        return obj.projects.count()


class ProjectSerializer(serializers.ModelSerializer):
    """
    Serializer for Project listings and creation.
    Exposes denormalized client details and task counters.
    """
    client_name = serializers.CharField(source='client.name', read_only=True)
    client_company = serializers.CharField(source='client.company_name', read_only=True)
    tasks_count = serializers.SerializerMethodField()
    completed_tasks_count = serializers.SerializerMethodField()

    class Meta:
        model = Project
        fields = [
            'id',
            'client',
            'client_name',
            'client_company',
            'title',
            'description',
            'budget',
            'status',
            'deadline',
            'tasks_count',
            'completed_tasks_count',
            'created_at',
        ]
        read_only_fields = ['id', 'created_at']

    def get_tasks_count(self, obj) -> int:
        if hasattr(obj, 'tasks_count'):
            return obj.tasks_count
        return obj.tasks.count()

    def get_completed_tasks_count(self, obj) -> int:
        if hasattr(obj, 'completed_tasks_count'):
            return obj.completed_tasks_count
        return obj.tasks.filter(is_completed=True).count()


class ProjectDetailSerializer(ProjectSerializer):
    """
    Detailed project serializer containing nested client info and full task list.
    """
    client_detail = ClientSerializer(source='client', read_only=True)
    tasks = TaskSerializer(many=True, read_only=True)

    class Meta(ProjectSerializer.Meta):
        fields = ProjectSerializer.Meta.fields + ['client_detail', 'tasks']


class DashboardStatsSerializer(serializers.Serializer):
    """Schema representation for drf-spectacular documentation."""
    total_clients = serializers.IntegerField()
    active_projects = serializers.IntegerField()
    total_active_budget = serializers.DecimalField(max_digits=14, decimal_places=2)
    total_projects = serializers.IntegerField()
    total_tasks = serializers.IntegerField()
    completed_tasks = serializers.IntegerField()
    task_completion_rate = serializers.FloatField()
    recent_projects = ProjectSerializer(many=True)
