#!/bin/sh
set -e

echo "=== AgencyFlow Backend Starting ==="

# Wait for database if DB_HOST is set
if [ -n "$DB_HOST" ]; then
    echo "Waiting for PostgreSQL database at $DB_HOST:${DB_PORT:-5432}..."
    python << END
import socket
import time
import os

host = os.environ.get("DB_HOST", "db")
port = int(os.environ.get("DB_PORT", 5432))
timeout = 30
start_time = time.time()

while True:
    try:
        s = socket.create_connection((host, port), timeout=2)
        s.close()
        print("Database connection successfully established!")
        break
    except (socket.error, ConnectionRefusedError):
        time.sleep(1)
        if time.time() - start_time > timeout:
            print("ERROR: Timed out waiting for database.")
            exit(1)
END
fi

echo "Applying database migrations..."
# NOTE: we intentionally do NOT run `makemigrations` here.
# Migration files are part of the source code: developers generate them
# locally, review them, and commit them to git. Containers only APPLY them.
python manage.py migrate --noinput

echo "Seeding initial agency portfolio data..."
python manage.py seed_data

echo "Backend initialization complete. Starting server..."
exec "$@"
