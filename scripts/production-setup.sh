#!/bin/bash

# Production Setup Script
# Sets up the production environment with database, admin user, and components

set -e  # Exit on error

DOMAIN="${DOMAIN:-https://tluedtke.de}"
SETUP_TOKEN="${ADMIN_SETUP_TOKEN:-***REMOVED***}"

echo "🚀 Starting production setup for: $DOMAIN"
echo "================================================"

# Step 1: Run database migrations
echo ""
echo "📊 Step 1: Running database migrations..."
echo "================================================"

if command -v npm >/dev/null 2>&1; then
    echo "Running migrations with npm..."
    npm run drizzle:migrate
else
    echo "Running migrations with npx drizzle-kit..."
    npx drizzle-kit migrate
fi

echo "✅ Database migrations completed"

# Step 2: Set up admin user
echo ""
echo "👤 Step 2: Setting up admin user..."
echo "================================================"

echo "Creating admin user via API..."

SETUP_RESPONSE=$(curl -s -X POST "$DOMAIN/api/setup-admin" \
  -H "Content-Type: application/json" \
  -H "X-Setup-Token: $SETUP_TOKEN" \
  -w "HTTP_STATUS:%{http_code}")

HTTP_STATUS=$(echo "$SETUP_RESPONSE" | grep -o "HTTP_STATUS:[0-9]*" | cut -d: -f2)
RESPONSE_BODY=$(echo "$SETUP_RESPONSE" | sed 's/HTTP_STATUS:[0-9]*//g')

echo "Response Status: $HTTP_STATUS"
echo "Response Body: $RESPONSE_BODY"

if [ "$HTTP_STATUS" = "200" ] || [ "$HTTP_STATUS" = "201" ]; then
    echo "✅ Admin user setup completed"
else
    echo "⚠️  Admin user setup had issues (status: $HTTP_STATUS)"
    echo "This might be normal if user already exists"
fi

# Step 3: Sync components
echo ""
echo "🧩 Step 3: Syncing components..."
echo "================================================"

if command -v npm >/dev/null 2>&1; then
    echo "Syncing components with npm..."
    npm run deploy:components
else
    echo "Syncing components with npx..."
    npx tsx scripts/deploy-components.ts
fi

echo "✅ Component sync completed"

# Step 4: Verify setup
echo ""
echo "🔍 Step 4: Verifying setup..."
echo "================================================"

echo "Testing component API..."
COMPONENTS_RESPONSE=$(curl -s "$DOMAIN/api/components" -w "HTTP_STATUS:%{http_code}")
COMPONENTS_HTTP_STATUS=$(echo "$COMPONENTS_RESPONSE" | grep -o "HTTP_STATUS:[0-9]*" | cut -d: -f2)

if [ "$COMPONENTS_HTTP_STATUS" = "200" ]; then
    COMPONENT_COUNT=$(echo "$COMPONENTS_RESPONSE" | sed 's/HTTP_STATUS:[0-9]*//g' | jq -r '.components | length' 2>/dev/null || echo "unknown")
    echo "✅ Component API working ($COMPONENT_COUNT components available)"
else
    echo "❌ Component API not responding correctly (status: $COMPONENTS_HTTP_STATUS)"
fi

# Final summary
echo ""
echo "🎉 Production Setup Complete!"
echo "================================================"
echo "Admin Login:"
echo "  URL: $DOMAIN/admin/login"
echo "  Email: admin@tgz.lol"
echo "  Password: ***REMOVED***"
echo ""
echo "Next steps:"
echo "  1. Login to admin interface"
echo "  2. Change admin password"
echo "  3. Create your first blog post"
echo "  4. Test component functionality"
echo ""
echo "Components available: $COMPONENT_COUNT"
echo "================================================"