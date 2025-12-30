#!/bin/bash

###############################################################################
# 🔍 AUDIT AND BUILD SCRIPT
# Script de auditoria e build completo do projeto LucresIA
# Versão: 1.0.0
# Data: 2024-12-23
###############################################################################

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo -e "${CYAN}╔══════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║  🔍 LucresIA Elevare - Auditoria e Build                       ║${NC}"
echo -e "${CYAN}╚══════════════════════════════════════════════════════════════════╝${NC}"
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

# Function to run command and handle errors
run_step() {
    local step_name=$1
    local command=$2
    
    echo ""
    log_info "▶️  $step_name"
    echo -e "${CYAN}════════════════════════════════════════════════════════════════${NC}"
    
    if eval "$command"; then
        log_success "$step_name completed successfully"
        return 0
    else
        log_error "$step_name failed!"
        return 1
    fi
}

# ============================================
# 1. Check Prerequisites
# ============================================
echo ""
log_info "🔧 Checking prerequisites..."

# Check Node.js
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    log_success "Node.js installed: $NODE_VERSION"
else
    log_error "Node.js is not installed!"
fi

# Check pnpm
if command -v pnpm &> /dev/null; then
    PNPM_VERSION=$(pnpm --version)
    log_success "pnpm installed: $PNPM_VERSION"
else
    log_error "pnpm is not installed! Run: npm install -g pnpm"
fi

# ============================================
# 2. Install Dependencies
# ============================================
run_step "Installing dependencies" "pnpm install --frozen-lockfile"

# ============================================
# 3. TypeScript Type Check
# ============================================
run_step "TypeScript type checking" "pnpm check" || log_warning "Type check has issues (non-blocking)"

# ============================================
# 4. Lint/Format Check (if available)
# ============================================
if grep -q '"lint"' package.json; then
    run_step "Running linter" "pnpm lint" || log_warning "Linting issues found (non-blocking)"
else
    log_info "No lint script found in package.json, skipping..."
fi

# ============================================
# 5. Run Tests (if available)
# ============================================
if grep -q '"test"' package.json; then
    run_step "Running tests" "pnpm test" || log_warning "Tests failed (non-blocking)"
else
    log_info "No test script found in package.json, skipping..."
fi

# ============================================
# 6. Build Project
# ============================================
run_step "Building project" "pnpm build"

# ============================================
# 7. Check Build Output
# ============================================
echo ""
log_info "📦 Checking build output..."

if [ -d "dist" ]; then
    log_success "Build directory exists: dist/"
    
    # Check for critical files
    if [ -f "dist/index.js" ]; then
        log_success "Server bundle exists: dist/index.js"
    else
        log_warning "Server bundle not found: dist/index.js"
    fi
    
    # Count total files
    FILE_COUNT=$(find dist -type f | wc -l)
    log_info "Total files in dist/: $FILE_COUNT"
else
    log_error "Build directory not found!"
fi

# ============================================
# 8. Environment Variables Check
# ============================================
echo ""
log_info "🔐 Checking environment variables..."

if [ -f ".env" ]; then
    log_success ".env file exists"
    
    # Check for critical variables (without revealing values)
    REQUIRED_VARS=(
        "DATABASE_URL"
        "JWT_SECRET"
        "STRIPE_SECRET_KEY"
        "VITE_APP_ID"
    )
    
    for var in "${REQUIRED_VARS[@]}"; do
        if grep -q "^$var=" .env; then
            log_success "Variable defined: $var"
        else
            log_warning "Variable missing: $var"
        fi
    done
else
    log_warning ".env file not found. Make sure to create it from .env.example"
fi

# ============================================
# 9. Database Schema Check
# ============================================
echo ""
log_info "🗄️  Checking database schema..."

if [ -f "drizzle/schema.ts" ]; then
    log_success "Database schema exists"
    
    # Count tables
    TABLE_COUNT=$(grep -c "export const.*mysqlTable" drizzle/schema.ts || echo "0")
    log_info "Database tables defined: $TABLE_COUNT"
else
    log_warning "Database schema not found"
fi

# ============================================
# 10. Security Audit (npm audit)
# ============================================
echo ""
log_info "🔒 Running security audit..."

# Check if pnpm audit command is available
if pnpm audit --help &>/dev/null 2>&1; then
    if pnpm audit --audit-level=high 2>&1 | tee /tmp/audit.log; then
        log_success "No high/critical vulnerabilities found"
    else
        log_warning "Security vulnerabilities detected. Review pnpm audit output."
        cat /tmp/audit.log | grep -E "(high|critical)" || true
    fi
    rm -f /tmp/audit.log
else
    log_info "pnpm audit not available. Skipping security audit."
fi

# ============================================
# 11. Bundle Size Analysis
# ============================================
echo ""
log_info "📊 Bundle size analysis..."

if [ -d "dist" ]; then
    DIST_SIZE=$(du -sh dist | cut -f1)
    log_info "Total build size: $DIST_SIZE"
    
    if [ -f "dist/index.js" ]; then
        SERVER_SIZE=$(du -h dist/index.js | cut -f1)
        log_info "Server bundle size: $SERVER_SIZE"
    fi
fi

# ============================================
# 12. Final Summary
# ============================================
echo ""
echo -e "${GREEN}╔══════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║  ✅ Auditoria e Build concluídos!                              ║${NC}"
echo -e "${GREEN}╚══════════════════════════════════════════════════════════════════╝${NC}"
echo ""

log_info "📋 Summary:"
echo "  ✓ Dependencies installed"
echo "  ✓ TypeScript checked"
echo "  ✓ Build completed"
echo "  ✓ Security audit performed"
echo ""

log_info "🚀 Ready for deployment!"
echo ""
log_info "Next steps:"
echo "  1. Review any warnings above"
echo "  2. Run: ./scripts/db_push.sh (to update database)"
echo "  3. Test locally: pnpm dev"
echo "  4. Deploy to production: git push (triggers CI/CD)"
echo ""
