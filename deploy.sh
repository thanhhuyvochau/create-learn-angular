#!/bin/bash

# Deploy script for create-learn-angular
# Usage: ./deploy.sh [dev|prod]
# Default: dev

set -e

PROFILE=${1:-dev}
IMAGE_NAME="create-learn-angular"
CONTAINER_NAME="create-learn-angular"
PORT=8889

# Map profile to Angular configuration
case $PROFILE in
  dev|development)
    CONFIGURATION="development"
    TAG="dev"
    echo "Building for DEVELOPMENT environment..."
    echo "API URL: http://103.12.76.205:8080"
    ;;
  prod|production)
    CONFIGURATION="production"
    TAG="prod"
    echo "Building for PRODUCTION environment..."
    echo "API URL: http://103.12.76.205:8080"
    ;;
  *)
    echo "Unknown profile: $PROFILE"
    echo "Usage: ./deploy.sh [dev|prod]"
    exit 1
    ;;
esac

echo ""
echo "=== Building Docker image ==="
docker build -t ${IMAGE_NAME}:${TAG} --build-arg CONFIGURATION=${CONFIGURATION} .

echo ""
echo "=== Stopping existing container (if any) ==="
docker stop ${CONTAINER_NAME} 2>/dev/null || true
docker rm ${CONTAINER_NAME} 2>/dev/null || true

echo ""
echo "=== Starting new container ==="
docker run -d \
  --name ${CONTAINER_NAME} \
  --restart unless-stopped \
  -p ${PORT}:80 \
  ${IMAGE_NAME}:${TAG}

echo ""
echo "=== Deployment complete ==="
echo "Application is running at: http://localhost:${PORT}"
echo "Health check: http://localhost:${PORT}/health"
