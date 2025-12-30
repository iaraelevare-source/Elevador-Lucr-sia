#!/bin/bash

###############################################################################
# 🗄️  DATABASE PUSH SCRIPT
# Script para atualizar schema do banco de dados usando Drizzle ORM
# Versão: 1.0.0
# Data: 2024-12-23
###############################################################################

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
NC='\033[0m' # No Color

echo -e "${MAGENTA}╔══════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${MAGENTA}║  🗄️  LucresIA Elevare - Database Migration                     ║${NC}"
echo -e "${MAGENTA}╚══════════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Function to log messages
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
    exit 1
}

# ============================================
# 1. Check Prerequisites
# ============================================
echo ""
log_info "🔧 Checking prerequisites..."

# Check pnpm
if ! command -v pnpm &> /dev/null; then
    log_error "pnpm is not installed! Run: npm install -g pnpm"
fi

log_success "pnpm is installed"

# Check for .env file
if [ ! -f ".env" ]; then
    log_error ".env file not found! Create it from .env.example"
fi

log_success ".env file exists"

# Check for DATABASE_URL
if ! grep -q "^DATABASE_URL=" .env; then
    log_error "DATABASE_URL not found in .env file!"
fi

log_success "DATABASE_URL is configured"

# Check for drizzle schema
if [ ! -f "drizzle/schema.ts" ]; then
    log_error "Database schema not found at drizzle/schema.ts"
fi

log_success "Database schema exists"

# ============================================
# 2. Backup Warning
# ============================================
echo ""
log_warning "⚠️  IMPORTANT: This script will modify your database!"
log_info "Make sure you have a backup before proceeding."
echo ""

# Prompt for confirmation (skip in CI/CD)
if [ -t 0 ]; then
    read -p "Do you want to continue? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        log_info "Operation cancelled by user."
        exit 0
    fi
fi

# ============================================
# 3. Generate Drizzle Migrations
# ============================================
echo ""
log_info "📝 Generating Drizzle migrations..."

if pnpm drizzle-kit generate; then
    log_success "Migrations generated successfully"
else
    log_error "Failed to generate migrations"
fi

# Check if migrations were created
if [ -d "drizzle" ]; then
    MIGRATION_COUNT=$(find drizzle -name "*.sql" 2>/dev/null | wc -l)
    log_info "Migration files found: $MIGRATION_COUNT"
fi

# ============================================
# 4. Apply Migrations to Database
# ============================================
echo ""
log_info "🚀 Applying migrations to database..."

if pnpm drizzle-kit migrate; then
    log_success "Migrations applied successfully"
else
    log_error "Failed to apply migrations"
fi

# ============================================
# 5. Verify Database Connection
# ============================================
echo ""
log_info "🔍 Verifying database connection..."

# Create a simple test script using CommonJS
cat > /tmp/db_test.cjs << 'EOF'
const { createPool } = require('mysql2/promise');

async function testConnection() {
  try {
    // Load DATABASE_URL from environment
    const databaseUrl = process.env.DATABASE_URL;
    
    if (!databaseUrl) {
      console.log('✗ DATABASE_URL not set');
      process.exit(1);
    }
    
    const pool = createPool(databaseUrl);
    await pool.query('SELECT 1');
    await pool.end();
    
    console.log('✓ Database connection successful');
    process.exit(0);
  } catch (error) {
    console.error('✗ Database connection failed:', error.message);
    process.exit(1);
  }
}

testConnection();
EOF

# Run the test with environment variables
if node /tmp/db_test.cjs 2>/dev/null; then
    log_success "Database connection verified"
else
    log_warning "Could not verify database connection (this might be OK if DB is not running locally)"
fi

# Clean up
rm -f /tmp/db_test.cjs

# ============================================
# 6. Display Schema Information
# ============================================
echo ""
log_info "📊 Database schema information:"

# Count tables defined in schema
if [ -f "drizzle/schema.ts" ]; then
    TABLE_COUNT=$(grep -c "export const.*mysqlTable" drizzle/schema.ts || echo "0")
    log_info "  Tables defined: $TABLE_COUNT"
    
    # List table names
    echo ""
    log_info "  Table names:"
    grep "export const.*mysqlTable" drizzle/schema.ts | sed 's/export const \(.*\) = mysqlTable.*/    - \1/' || true
fi

# ============================================
# 7. Migration History
# ============================================
echo ""
log_info "📜 Migration history:"

if [ -d "drizzle/meta" ]; then
    SNAPSHOT_COUNT=$(find drizzle/meta -name "*_snapshot.json" 2>/dev/null | wc -l)
    log_info "  Total snapshots: $SNAPSHOT_COUNT"
    
    # Show latest migration
    LATEST_SNAPSHOT=$(ls -t drizzle/meta/*_snapshot.json 2>/dev/null | head -1)
    if [ -n "$LATEST_SNAPSHOT" ]; then
        log_info "  Latest snapshot: $(basename $LATEST_SNAPSHOT)"
    fi
fi

# ============================================
# 8. Final Summary
# ============================================
echo ""
echo -e "${GREEN}╔══════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║  ✅ Database migration completed successfully!                  ║${NC}"
echo -e "${GREEN}╚══════════════════════════════════════════════════════════════════╝${NC}"
echo ""

log_info "📋 Summary:"
echo "  ✓ Migrations generated"
echo "  ✓ Migrations applied to database"
echo "  ✓ Database schema updated"
echo ""

log_info "🎯 Next steps:"
echo "  1. Test the application: pnpm dev"
echo "  2. Verify all features work correctly"
echo "  3. Check database tables in your MySQL client"
echo ""

log_warning "💡 Tip: If you're deploying to production, make sure DATABASE_URL"
log_warning "   in your production environment points to the production database."
echo ""
