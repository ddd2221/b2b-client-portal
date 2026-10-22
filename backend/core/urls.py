from django.urls import include, path
from rest_framework.routers import DefaultRouter
from .views import ClientViewSet, ProjectViewSet, TaskViewSet, dashboard_stats

router = DefaultRouter()
router.register(r'clients', ClientViewSet, basename='client')
router.register(r'projects', ProjectViewSet, basename='project')
router.register(r'tasks', TaskViewSet, basename='task')

urlpatterns = [
    path('dashboard/stats/', dashboard_stats, name='dashboard-stats'),
    path('', include(router.urls)),
]
