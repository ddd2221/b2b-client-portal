# AgencyFlow

A production-grade B2B client, project, and task management portal built with a decoupled architecture. Designed for custom software houses and digital agencies to monitor project delivery pipelines, budgets, and team velocity in real time.

---

## Architecture Overview

AgencyFlow separates concerns between a stateless Django REST Framework backend and a reactive Next.js 14 App Router frontend, orchestrated with Docker Compose and backed by PostgreSQL 16.

```
┌────────────────────────────────┐         ┌────────────────────────────────┐
│   Next.js 14 (App Router)      │         │     Django 5 REST Framework   │
│   TypeScript + Tailwind CSS    │ ◄─────► │     Python 3.12 + SimpleJWT    │
│   Port: 3000                   │   HTTP  │     Port: 8000                 │
└────────────────────────────────┘         └───────────────┬────────────────┘
                                                           │
                                                           │ SQL (ORM)
                                                           ▼
                                           ┌────────────────────────────────┐
                                           │     PostgreSQL 16 Engine       │
                                           │     Internal Port: 5432        │
                                           │     Host Port: 15432           │
                                           └────────────────────────────────┘
```

---

## Key Features

- **JWT Authentication (`SimpleJWT`):** Secure access/refresh token lifecycle with authorization headers and pre-configured quick-login demo accounts.
- **Executive Analytics Dashboard:** Single-trip PostgreSQL ORM aggregations (`/api/dashboard/stats/`) calculating live pipeline value, active budgets, deliverable completion percentages, and recent project milestones.
- **Relational Domain Modeling:** Strict database-level foreign key integrity connecting `Client` (1:N) `Project` (1:N) `Task`.
- **Query Optimization (Zero N+1):** Database queries leverage `select_related` and SQL annotations (`Count`, `Sum`, conditional `Q` filters) to eliminate N+1 latency.
- **Server-Side Filtering & Search:** Configured with `django-filter` and DRF `SearchFilter` across client companies, project status, priorities, and deadlines.
- **Interactive Task Deliverables:** Dedicated toggle endpoint (`/api/tasks/{id}/toggle/`) supporting optimistic client-side updates.
- **Interactive OpenAPI 3 / Swagger Documentation:** Live interactive API documentation powered by `drf-spectacular` at both `/api/schema/swagger-ui/` and `/api/docs/`.

---

## Tech Stack

| Layer | Technologies |
| :--- | :--- |
| **Backend** | Python 3.12, Django 5.x, Django REST Framework, SimpleJWT, django-filter, drf-spectacular |
| **Frontend** | Next.js 14 (App Router), TypeScript, Tailwind CSS, Lucide React Icons |
| **Database** | PostgreSQL 16 Alpine |
| **DevOps & Tooling** | Docker, Docker Compose, Alpine Linux base images, healthchecks |

---

## Database Schema & Query Optimization

The relational schema represents agency operations:

```
[ Client ]
   │
   └── (1:N) ──► [ Project ]
                     │
                     └── (1:N) ──► [ Task ]
```

### Avoiding N+1 Query Pitfalls

1. **Foreign Key Joins with `select_related`:**
   Fetching projects and tasks queries parent models via SQL `INNER JOIN` in a single query rather than issuing individual queries per row:
   ```python
   Project.objects.select_related('client').all()
   Task.objects.select_related('project').all()
   ```

2. **Aggregations in the Database Engine:**
   Linked model counts and metrics are calculated within PostgreSQL using ORM annotations, avoiding in-memory loops in Python:
   ```python
   Project.objects.select_related('client').annotate(
       tasks_count=Count('tasks', distinct=True),
       completed_tasks_count=Count(
           'tasks',
           filter=Q(tasks__is_completed=True),
           distinct=True
       )
   )
   ```

3. **High-Efficiency Dashboard KPIs:**
   Executive KPIs (active project count, total budget sum, task completion rate) are aggregated in PostgreSQL via `aggregate()` and `annotate()`, returning a compact payload in O(1) database trips.

---

## Quick Start (One-Command Setup)

### Prerequisites

- [Docker Desktop](https://www.docker.com/) (installed and running)
- Git

### 1. Clone & Run

```bash
git clone https://github.com/your-username/agencyflow.git
cd agencyflow
docker compose up --build
```

Docker Compose automatically handles the startup sequence:
1. Starts **PostgreSQL 16** and verifies readiness via Docker healthcheck.
2. Starts the **Django backend**, automatically runs database migrations (`migrate --noinput`), and seeds realistic demo data (`seed_data`).
3. Starts the **Next.js frontend** with hot-reloading on port 3000.

*Note: The project works out of the box with safe default fallback variables. An `.env.example` file is included if you wish to customize ports or credentials.*

---

## Demo Credentials & Endpoints

### Default Logins

| Role | Username | Password | Privileges |
| :--- | :--- | :--- | :--- |
| **Agency Administrator** | `admin` | `admin123` | Full Django Admin & API read/write permissions |
| **Team Member Demo** | `demo` | `demo123` | Workspace view and task interaction |

*(Convenient one-click login buttons are also built directly into the `/login` screen).*

### Local Service URLs

| Service | URL | Description |
| :--- | :--- | :--- |
| **Frontend Portal** | [http://localhost:3000](http://localhost:3000) | Next.js 14 web application |
| **Swagger UI** | [http://localhost:8000/api/schema/swagger-ui/](http://localhost:8000/api/schema/swagger-ui/) | Interactive OpenAPI 3 schema and sandbox |
| **Swagger UI (Alias)** | [http://localhost:8000/api/docs/](http://localhost:8000/api/docs/) | Alternative Swagger UI endpoint |
| **ReDoc Documentation** | [http://localhost:8000/api/redoc/](http://localhost:8000/api/redoc/) | ReDoc specification view |
| **Backend REST API** | [http://localhost:8000/api/](http://localhost:8000/api/) | Root API endpoint |
| **Django Admin** | [http://localhost:8000/admin/](http://localhost:8000/admin/) | Django administration panel |

---

## API Endpoints Reference

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/token/` | Obtain JWT access and refresh tokens |
| `POST` | `/api/token/refresh/` | Refresh expired JWT access token |
| `GET` | `/api/dashboard/stats/` | Aggregated executive agency metrics |
| `GET`, `POST` | `/api/clients/` | List and create clients |
| `GET`, `PUT`, `DELETE` | `/api/clients/{id}/` | Retrieve, update, or remove client |
| `GET`, `POST` | `/api/projects/` | List projects (with search & filters) and create project |
| `GET`, `PUT`, `DELETE` | `/api/projects/{id}/` | Retrieve project detail with embedded tasks |
| `GET`, `POST` | `/api/tasks/` | List and create tasks |
| `POST` | `/api/tasks/{id}/toggle/` | Toggle task completion status |
