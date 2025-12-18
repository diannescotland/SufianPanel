# Backend Dockerfile - Django API
FROM python:3.12-slim

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Set work directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy project files
COPY . .

# Collect static files
RUN python manage.py collectstatic --noinput

# Expose port
EXPOSE 8000

# Create data directory for database
RUN mkdir -p /app/data

# Create entrypoint script
RUN echo '#!/bin/bash\n\
set -e\n\
\n\
# Use data volume for database\n\
export DATABASE_PATH=/app/data/db.sqlite3\n\
\n\
# Run migrations\n\
python manage.py migrate --run-syncdb\n\
\n\
# Seed admin user\n\
python manage.py seed_admin || echo "seed_admin skipped"\n\
\n\
# Seed AI tools\n\
echo "Seeding AI tools..."\n\
python manage.py seed_tools || echo "seed_tools failed"\n\
\n\
# Fix existing clients to be active\n\
python manage.py fix_active_clients || echo "fix_active_clients skipped"\n\
\n\
# Start production server with optimized Gunicorn settings\n\
# Workers: 4 (2x CPU cores recommended)\n\
# Threads: 4 per worker for I/O bound tasks\n\
# Worker class: gthread for better concurrency\n\
exec gunicorn config.wsgi:application \\\n\
  --bind 0.0.0.0:8000 \\\n\
  --workers 4 \\\n\
  --threads 4 \\\n\
  --worker-class gthread \\\n\
  --timeout 120 \\\n\
  --keep-alive 5 \\\n\
  --max-requests 1000 \\\n\
  --max-requests-jitter 50 \\\n\
  --access-logfile - \\\n\
  --error-logfile -' > /entrypoint.sh \
    && chmod +x /entrypoint.sh

# Run the application
CMD ["/entrypoint.sh"]
