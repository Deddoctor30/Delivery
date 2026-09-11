#!/bin/sh
set -e

echo "→ Applying migrations..."
npx prisma migrate deploy

if [ "$SEED_ON_START" = "true" ]; then
  echo "→ Seeding database..."
  node dist/prisma/seed.js
fi

echo "→ Starting app..."
exec node dist/src/main.js
