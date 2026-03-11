#!/usr/bin/env sh
echo "Checking routes..."
curl -s http://localhost:5000/api/health || true
echo
curl -s http://localhost:5000/api/training || true
echo
*** End Patch