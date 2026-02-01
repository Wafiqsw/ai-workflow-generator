# Use official Python image
FROM python:3.12-slim

# Set working directory
WORKDIR /app

# Install dependencies and curl for health checks
COPY requirements.txt .
RUN apt-get update && apt-get install -y --no-install-recommends curl && \
    pip install --no-cache-dir -r requirements.txt && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

# Copy app code
COPY ./app ./app

# Expose port FastAPI will run on
EXPOSE 8000

# Command to run FastAPI with auto-reload for dev
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]
