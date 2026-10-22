from django.db import models


class ClientStatus(models.TextChoices):
    LEAD = 'lead', 'Lead'
    ACTIVE = 'active', 'Active'
    ARCHIVED = 'archived', 'Archived'


class ProjectStatus(models.TextChoices):
    PLANNING = 'planning', 'Planning'
    IN_PROGRESS = 'in_progress', 'In Progress'
    REVIEW = 'review', 'Review'
    COMPLETED = 'completed', 'Completed'


class TaskPriority(models.TextChoices):
    LOW = 'low', 'Low'
    MEDIUM = 'medium', 'Medium'
    HIGH = 'high', 'High'


class Client(models.Model):
    """
    Client model representing a business or individual client of the agency.
    """
    name = models.CharField(max_length=255, help_text="Full contact name")
    company_name = models.CharField(max_length=255, help_text="Company or organization name")
    email = models.EmailField(unique=True, help_text="Primary contact email")
    status = models.CharField(
        max_length=20,
        choices=ClientStatus.choices,
        default=ClientStatus.ACTIVE,
        help_text="Current relationship status with the agency"
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Client'
        verbose_name_plural = 'Clients'

    def __str__(self):
        return f"{self.name} ({self.company_name})"


class Project(models.Model):
    """
    Project model representing a client deliverable or contract.
    """
    client = models.ForeignKey(
        Client,
        on_delete=models.CASCADE,
        related_name='projects',
        help_text="The client this project belongs to"
    )
    title = models.CharField(max_length=255, help_text="Project title or scope name")
    description = models.TextField(blank=True, default='', help_text="Detailed project description")
    budget = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        help_text="Contractual budget in USD"
    )
    status = models.CharField(
        max_length=20,
        choices=ProjectStatus.choices,
        default=ProjectStatus.PLANNING,
        help_text="Current project milestone status"
    )
    deadline = models.DateField(help_text="Expected delivery date")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Project'
        verbose_name_plural = 'Projects'

    def __str__(self):
        return f"{self.title} - {self.client.company_name}"


class Task(models.Model):
    """
    Task model representing an actionable item inside a Project.
    """
    project = models.ForeignKey(
        Project,
        on_delete=models.CASCADE,
        related_name='tasks',
        help_text="The parent project for this task"
    )
    title = models.CharField(max_length=255, help_text="Task headline")
    priority = models.CharField(
        max_length=20,
        choices=TaskPriority.choices,
        default=TaskPriority.MEDIUM,
        help_text="Priority level"
    )
    is_completed = models.BooleanField(
        default=False,
        help_text="Completion flag"
    )
    due_date = models.DateField(
        null=True,
        blank=True,
        help_text="Optional deadline for this specific task"
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['is_completed', '-due_date', '-created_at']
        verbose_name = 'Task'
        verbose_name_plural = 'Tasks'

    def __str__(self):
        return f"[{'✓' if self.is_completed else ' '}] {self.title}"
