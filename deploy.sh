#!/bin/bash

# Character Composer Deployment Script
# Deploys the full-stack app (frontend + backend) to Google Cloud Run

set -e  # Exit on any error

# Constants
PROJECT_ID="playground-292010"
REGION="europe-west1"
SERVICE_NAME="character-composer"
SOURCE_DIR="."

# Check if .env file exists in backend directory
ENV_FILE="./backend/.env"
if [ ! -f "$ENV_FILE" ]; then
    echo "❌ Error: $ENV_FILE not found!"
    echo "Please create the .env file with your API keys:"
    echo "OPENAI_API_KEY=your_openai_key"
    echo "HF_API_KEY=your_huggingface_key"
    echo "ELEVENLABS_API_KEY=your_elevenlabs_key"
    echo "TTS_MAX_TEXT_CHARS=1000"
    exit 1
fi

echo "🚀 Starting deployment of Character Composer..."
echo "Project: $PROJECT_ID"
echo "Region: $REGION"
echo "Service: $SERVICE_NAME"
echo ""

# Load environment variables from .env file
echo "📋 Loading environment variables from $ENV_FILE..."
set -a  # Export all variables
source "$ENV_FILE"
set +a

# Verify required API keys are set
if [ -z "$OPENAI_API_KEY" ]; then
    echo "❌ Error: OPENAI_API_KEY not found in .env file"
    exit 1
fi

if [ -z "$HF_API_KEY" ]; then
    echo "❌ Error: HF_API_KEY not found in .env file"
    exit 1
fi

if [ -z "$ELEVENLABS_API_KEY" ]; then
    echo "❌ Error: ELEVENLABS_API_KEY not found in .env file"
    exit 1
fi

# Set default values for optional vars
TTS_MAX_TEXT_CHARS=${TTS_MAX_TEXT_CHARS:-1000}
NODE_ENV=${NODE_ENV:-production}

echo "✅ Environment variables loaded successfully"
echo ""

# Authenticate and configure gcloud
echo "🔐 Configuring Google Cloud..."
gcloud config set project "$PROJECT_ID"
gcloud config set run/region "$REGION"

# Enable required services
# echo "⚙️ Enabling required Google Cloud services..."
# gcloud services enable run.googleapis.com \
#     cloudbuild.googleapis.com \
#     containerregistry.googleapis.com

# echo ""

# Build Docker image with Cloud Build (no local Docker needed)
echo "🏗️ Building Docker image with Cloud Build..."
IMAGE_NAME="gcr.io/$PROJECT_ID/$SERVICE_NAME:latest"
gcloud builds submit --tag "$IMAGE_NAME" .

# Deploy the image
echo "🚀 Deploying to Cloud Run..."
gcloud run deploy "$SERVICE_NAME" \
    --image "$IMAGE_NAME" \
    --region "$REGION" \
    --allow-unauthenticated \
    --set-env-vars "OPENAI_API_KEY=$OPENAI_API_KEY,HF_API_KEY=$HF_API_KEY,ELEVENLABS_API_KEY=$ELEVENLABS_API_KEY,TTS_MAX_TEXT_CHARS=$TTS_MAX_TEXT_CHARS,NODE_ENV=$NODE_ENV" \
    --cpu=1 \
    --memory=1Gi \
    --timeout=300 \
    --concurrency=100 \
    --min-instances=0 \
    --max-instances=10

echo ""

# Get and display the service URL
SERVICE_URL=$(gcloud run services describe "$SERVICE_NAME" \
    --region "$REGION" \
    --format="value(status.url)")

echo "🎉 Deployment completed successfully!"
echo "🌐 Your app is live at: $SERVICE_URL"
echo ""
echo "🧪 Test the API:"
echo "curl -s \"$SERVICE_URL/analyze-character\" \\"
echo "  -H 'Content-Type: application/json' \\"
echo "  -d '{\"text\":\"A brooding knight with a tragic past\"}' | jq"
echo ""
echo "🌍 Open the web app:"
echo "open \"$SERVICE_URL\""
