#!/bin/bash

# Ensure script fails on errors
set -e

echo "Starting Netlify deployment process..."

# Install dependencies if they haven't been already
if [ ! -d "node_modules" ]; then
  echo "Installing main project dependencies..."
  npm install
fi

# Install function dependencies
echo "Installing function dependencies..."
cd functions-src
npm install
cd ..

# Build functions
echo "Building serverless functions..."
npm run build

# Deploy to Netlify
echo "Deploying to Netlify..."
npx netlify deploy --prod

echo "Deployment complete!" 