#!/bin/bash

# Enable corepack and pnpm if not available
if ! command -v pnpm &> /dev/null; then
    echo "🔧 pnpm not found, enabling via corepack..."
    corepack enable pnpm
    corepack prepare pnpm@9.0.0 --activate
fi

# Start the application
echo "🚀 Starting application..."
exec node --max-old-space-size=512 dist/src/main
