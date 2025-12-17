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
python manage.py seed_admin 2>/dev/null || true\n\
\n\
# Seed tools\n\
python manage.py seed_tools 2>/dev/null || true\n\
\n\
# Start server\n\
exec python manage.py runserver 0.0.0.0:8000' > /entrypoint.sh \
    && chmod +x /entrypoint.sh

# Run the application
CMD ["/entrypoint.sh"]
