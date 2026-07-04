#!/bin/bash
# Run after your web app is deployed. Usage:
#   ./scripts/build-ios.sh https://your-app.onrender.com

set -euo pipefail

URL="${1:?Usage: ./scripts/build-ios.sh https://your-live-url.com}"

export VITE_API_URL="$URL"
export VITE_APP_URL="$URL"

npm run build
npx cap sync ios
echo ""
echo "Done. Open Xcode with: npx cap open ios"
