from datetime import date, timedelta
from decimal import Decimal
from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand
from core.models import Client, ClientStatus, Project, ProjectStatus, Task, TaskPriority

User = get_user_model()


class Command(BaseCommand):
    help = "Seed database with realistic initial agency clients, projects, tasks, and demo users."

    def add_arguments(self, parser):
        parser.add_argument(
            '--clear',
            action='store_true',
            help='Delete existing Clients, Projects, and Tasks before seeding'
        )

    def handle(self, *args, **options):
        if options['clear']:
            self.stdout.write(self.style.WARNING("Clearing existing core data..."))
            Task.objects.all().delete()
            Project.objects.all().delete()
            Client.objects.all().delete()
            self.stdout.write(self.style.SUCCESS("Existing data cleared."))

        # 1. Create or verify Superuser & Demo User
        admin_user, admin_created = User.objects.get_or_create(
            username='admin',
            defaults={
                'email': 'admin@agencyflow.dev',
                'is_staff': True,
                'is_superuser': True,
            }
        )
        if admin_created:
            admin_user.set_password('admin123')
            admin_user.save()
            self.stdout.write(self.style.SUCCESS("Created superuser: admin / admin123"))
        else:
            self.stdout.write("Superuser 'admin' already exists.")

        demo_user, demo_created = User.objects.get_or_create(
            username='demo',
            defaults={
                'email': 'demo@agencyflow.dev',
                'is_staff': False,
                'is_superuser': False,
            }
        )
        if demo_created:
            demo_user.set_password('demo123')
            demo_user.save()
            self.stdout.write(self.style.SUCCESS("Created demo user: demo / demo123"))
        else:
            self.stdout.write("Demo user 'demo' already exists.")

        # Avoid duplicate business data if already seeded
        if Client.objects.exists() and not options['clear']:
            self.stdout.write(self.style.NOTICE("Data already exists in database. Skipping seeding."))
            return

        # 2. Seed Clients
        self.stdout.write("Seeding clients...")
        clients_data = [
            {
                'name': 'Sarah Jenkins',
                'company_name': 'FinEdge Capital',
                'email': 's.jenkins@finedgecap.com',
                'status': ClientStatus.ACTIVE,
            },
            {
                'name': 'Dr. Marcus Vance',
                'company_name': 'Aura Health Technologies',
                'email': 'm.vance@aurahealth.io',
                'status': ClientStatus.ACTIVE,
            },
            {
                'name': 'Elena Rostova',
                'company_name': 'Nordic Retail Group',
                'email': 'elena.r@nordicretail.se',
                'status': ClientStatus.ACTIVE,
            },
            {
                'name': 'Taro Tanaka',
                'company_name': 'Zenith Logistics Global',
                'email': 't.tanaka@zenithlog.jp',
                'status': ClientStatus.LEAD,
            },
            {
                'name': 'David Miller',
                'company_name': 'Legacy Media Holdings',
                'email': 'david@legacymedia.net',
                'status': ClientStatus.ARCHIVED,
            },
        ]

        clients = {}
        for c in clients_data:
            client_obj, _ = Client.objects.get_or_create(
                email=c['email'],
                defaults=c
            )
            clients[c['company_name']] = client_obj

        # 3. Seed Projects
        self.stdout.write("Seeding projects...")
        today = date.today()

        projects_data = [
            {
                'client': clients['FinEdge Capital'],
                'title': 'Next-Gen Algorithmic Trading Terminal',
                'description': 'High-frequency market intelligence platform with real-time WebSockets and low-latency charting.',
                'budget': Decimal('78500.00'),
                'status': ProjectStatus.IN_PROGRESS,
                'deadline': today + timedelta(days=45),
            },
            {
                'client': clients['FinEdge Capital'],
                'title': 'Client Investor Portal & KYC Automation',
                'description': 'Automated identity verification, AML scoring, and automated compliance reporting workflows.',
                'budget': Decimal('32000.00'),
                'status': ProjectStatus.COMPLETED,
                'deadline': today - timedelta(days=15),
            },
            {
                'client': clients['Aura Health Technologies'],
                'title': 'AI Telehealth & Remote Diagnostics Mobile App',
                'description': 'HIPAA-compliant cross-platform mobile app featuring WebRTC encrypted video and AI symptom screening.',
                'budget': Decimal('95000.00'),
                'status': ProjectStatus.IN_PROGRESS,
                'deadline': today + timedelta(days=60),
            },
            {
                'client': clients['Aura Health Technologies'],
                'title': 'Clinic Scheduling & E-Prescription Gateway',
                'description': 'Centralized API gateway integrating EHR records, doctor calendar slots, and pharmacy dispatch.',
                'budget': Decimal('42000.00'),
                'status': ProjectStatus.REVIEW,
                'deadline': today + timedelta(days=10),
            },
            {
                'client': clients['Nordic Retail Group'],
                'title': 'Headless E-Commerce Microservices Migration',
                'description': 'Migration from legacy monolith to Next.js storefront with Stripe and Algolia integration.',
                'budget': Decimal('64000.00'),
                'status': ProjectStatus.IN_PROGRESS,
                'deadline': today + timedelta(days=30),
            },
            {
                'client': clients['Nordic Retail Group'],
                'title': 'Omnichannel Loyalty & Gift Card Engine',
                'description': 'Real-time rewards calculation microservice with POS barcode scanner synchronization.',
                'budget': Decimal('28500.00'),
                'status': ProjectStatus.PLANNING,
                'deadline': today + timedelta(days=90),
            },
            {
                'client': clients['Zenith Logistics Global'],
                'title': 'Autonomous Fleet Telematics & Route Optimizer',
                'description': 'IoT telemetry ingestion pipeline processing GPS, fuel consumption, and predictive maintenance alerts.',
                'budget': Decimal('52000.00'),
                'status': ProjectStatus.PLANNING,
                'deadline': today + timedelta(days=110),
            },
            {
                'client': clients['Legacy Media Holdings'],
                'title': 'Digital Archive Content Migration & OCR Indexing',
                'description': 'Cloud digitization and elastic full-text indexing of 30 years of editorial archives.',
                'budget': Decimal('19500.00'),
                'status': ProjectStatus.COMPLETED,
                'deadline': today - timedelta(days=90),
            },
        ]

        projects = []
        for p in projects_data:
            proj_obj, _ = Project.objects.get_or_create(
                title=p['title'],
                client=p['client'],
                defaults=p
            )
            projects.append(proj_obj)

        # 4. Seed Tasks
        self.stdout.write("Seeding project tasks...")
        tasks_map = {
            'Next-Gen Algorithmic Trading Terminal': [
                ('Implement Binance and Kraken WebSocket streaming connector', TaskPriority.HIGH, True, today - timedelta(days=5)),
                ('Design custom Order Book depth visualizer using Canvas/WebGL', TaskPriority.HIGH, False, today + timedelta(days=10)),
                ('Implement JWT auth with biometric verification & session revocation', TaskPriority.MEDIUM, True, today - timedelta(days=2)),
                ('Benchmark PostgreSQL partition tables for tick data latency', TaskPriority.MEDIUM, False, today + timedelta(days=18)),
            ],
            'AI Telehealth & Remote Diagnostics Mobile App': [
                ('Set up LiveKit WebRTC SFU server for multi-party consultation', TaskPriority.HIGH, True, today - timedelta(days=12)),
                ('Integrate OpenAI Whisper API for automated clinical transcription', TaskPriority.HIGH, False, today + timedelta(days=8)),
                ('Perform third-party penetration testing and HIPAA audit review', TaskPriority.HIGH, False, today + timedelta(days=25)),
                ('Implement push notifications for prescription dosage reminders', TaskPriority.LOW, True, today - timedelta(days=1)),
            ],
            'Headless E-Commerce Microservices Migration': [
                ('Setup Next.js App Router dynamic product pages with ISR', TaskPriority.HIGH, True, today - timedelta(days=14)),
                ('Integrate Stripe Checkout with Webhook idempotency handling', TaskPriority.HIGH, True, today - timedelta(days=7)),
                ('Configure Algolia InstantSearch with facet filtering', TaskPriority.MEDIUM, False, today + timedelta(days=5)),
                ('Automate Lighthouse CI audit for 95+ Core Web Vitals score', TaskPriority.LOW, False, today + timedelta(days=14)),
            ],
            'Clinic Scheduling & E-Prescription Gateway': [
                ('Build doctor calendar conflict resolution algorithm', TaskPriority.HIGH, True, today - timedelta(days=8)),
                ('Integrate SureScripts pharmacy network gateway API', TaskPriority.HIGH, False, today + timedelta(days=4)),
                ('End-to-end integration tests using pytest and factory_boy', TaskPriority.MEDIUM, False, today + timedelta(days=7)),
            ],
            'Omnichannel Loyalty & Gift Card Engine': [
                ('Draft architectural RFC for event-driven Kafka messaging', TaskPriority.HIGH, False, today + timedelta(days=15)),
                ('Define OpenAPI 3 specification in drf-spectacular', TaskPriority.MEDIUM, False, today + timedelta(days=20)),
            ],
            'Autonomous Fleet Telematics & Route Optimizer': [
                ('Conduct discovery workshop with Zenith fleet operations lead', TaskPriority.MEDIUM, True, today - timedelta(days=4)),
                ('Calculate Dijkstra path optimization with live traffic feeds', TaskPriority.HIGH, False, today + timedelta(days=35)),
            ],
        }

        created_tasks_count = 0
        for proj in projects:
            if proj.title in tasks_map:
                for title, priority, is_completed, due_date in tasks_map[proj.title]:
                    Task.objects.get_or_create(
                        project=proj,
                        title=title,
                        defaults={
                            'priority': priority,
                            'is_completed': is_completed,
                            'due_date': due_date,
                        }
                    )
                    created_tasks_count += 1

        self.stdout.write(
            self.style.SUCCESS(
                f"Successfully seeded database!\n"
                f"-> Clients: {Client.objects.count()}\n"
                f"-> Projects: {Project.objects.count()}\n"
                f"-> Tasks: {Task.objects.count()}\n"
                f"-> Default logins: admin / admin123  AND  demo / demo123"
            )
        )
