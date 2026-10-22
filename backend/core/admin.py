from django.contrib import admin
from .models import Client, Project, Task


class ProjectInline(admin.TabularInline):
    model = Project
    extra = 0
    show_change_link = True


class TaskInline(admin.TabularInline):
    model = Task
    extra = 0
    show_change_link = True


@admin.register(Client)
class ClientAdmin(admin.ModelAdmin):
    list_display = ('name', 'company_name', 'email', 'status', 'created_at')
    list_filter = ('status', 'created_at')
    search_fields = ('name', 'company_name', 'email')
    inlines = [ProjectInline]


@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
    list_display = ('title', 'client', 'budget', 'status', 'deadline', 'created_at')
    list_filter = ('status', 'deadline', 'created_at')
    search_fields = ('title', 'description', 'client__name', 'client__company_name')
    inlines = [TaskInline]


@admin.register(Task)
class TaskAdmin(admin.ModelAdmin):
    list_display = ('title', 'project', 'priority', 'is_completed', 'due_date')
    list_filter = ('priority', 'is_completed', 'due_date')
    search_fields = ('title', 'project__title')
