# Base image
FROM python:3.11-slim

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

# Set work directory
WORKDIR /app

# Install dependencies
COPY requirements.txt /app/
RUN pip install --no-cache-dir -r requirements.txt

# Copy the application code
COPY . /app/

# Expose the Daphne port
EXPOSE 8000

# Set the entrypoint for Daphne
CMD ["daphne", "-b", "0.0.0.0", "-p", "8000", "chat.asgi:application"]