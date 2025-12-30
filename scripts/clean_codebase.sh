#!/bin/bash

###############################################################################
# 🧹 CLEAN CODEBASE SCRIPT
# Script de limpeza e padronização automática do projeto LucresIA
# Versão: 1.0.0
# Data: 2024-12-23
###############################################################################

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}╔══════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  🧹 LucresIA Elevare - Limpeza e Padronização de Código        ║${NC}"
echo -e "${BLUE}╚══════════════════════════════════════════════════════════════════╝${NC}"
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
}

# Function to remove files/directories if they exist
safe_remove() {
    local target=$1
    local description=$2
    
    if [ -e "$target" ]; then
        rm -rf "$target"
        log_success "Removed: $description ($target)"
    else
        log_info "Not found (OK): $description ($target)"
    fi
    # Always return 0 to avoid exit on 'set -e'
    return 0
}

# ============================================
# 1. Remover arquivos temporários e builds
# ============================================
echo ""
log_info "🗑️  Removing temporary files and build artifacts..."

safe_remove "dist" "Build output directory"
safe_remove ".cache" "Cache directory"
safe_remove ".vite" "Vite cache"
safe_remove "node_modules/.vite" "Vite cache in node_modules"
safe_remove ".tsbuildinfo" "TypeScript build info"
safe_remove "node_modules/typescript/tsbuildinfo" "TS build info in node_modules"

# ============================================
# 2. Remover arquivos duplicados/legados
# ============================================
echo ""
log_info "🔍 Searching for legacy and duplicate files..."

# Pattern for old/backup files
LEGACY_PATTERNS=(
    "*-old.*"
    "*-OLD.*"
    "*_old.*"
    "*_OLD.*"
    "*.backup"
    "*.bak"
    "*copy.*"
    "*Copy.*"
    "*_copy.*"
    "*_Copy.*"
    "*-copy.*"
    "*-Copy.*"
    "*.orig"
)

# Search for legacy files (excluding node_modules and .git)
for pattern in "${LEGACY_PATTERNS[@]}"; do
    while IFS= read -r file; do
        if [ -f "$file" ]; then
            safe_remove "$file" "Legacy file"
        fi
    done < <(find . -name "$pattern" -not -path "*/node_modules/*" -not -path "*/.git/*" 2>/dev/null)
done

# ============================================
# 3. Verificar nomenclatura padrão
# ============================================
echo ""
log_info "📋 Checking for Portuguese naming (should be English)..."

# Look for Portuguese named files that should be English
PORTUGUESE_FILES=(
    "shared/tipos.ts"
    "shared/assinatura.ts"
    "server/routers/assinatura.ts"
    "server/routers/tipos.ts"
)

for file in "${PORTUGUESE_FILES[@]}"; do
    if [ -f "$file" ]; then
        log_warning "Found Portuguese named file: $file (should be renamed to English)"
    fi
done

# ============================================
# 4. Limpar logs antigos
# ============================================
echo ""
log_info "📝 Cleaning old log files..."

safe_remove "*.log" "Log files"
safe_remove "logs/" "Logs directory"

# ============================================
# 5. Verificar estrutura de diretórios
# ============================================
echo ""
log_info "📁 Verifying directory structure..."

REQUIRED_DIRS=(
    "client/src"
    "server"
    "shared"
    "drizzle"
    "scripts"
)

for dir in "${REQUIRED_DIRS[@]}"; do
    if [ -d "$dir" ]; then
        log_success "Directory exists: $dir"
    else
        log_error "Missing required directory: $dir"
        mkdir -p "$dir"
        log_info "Created directory: $dir"
    fi
done

# ============================================
# 6. Formatar código
# ============================================
echo ""
log_info "🎨 Formatting code with Prettier..."

if command -v pnpm &> /dev/null; then
    # Check if format script exists in package.json
    if grep -q '"format"' package.json 2>/dev/null; then
        pnpm format 2>&1 | grep -E "(Checking|files.*changed|success)" || true
        log_success "Code formatting completed"
    else
        log_info "No format script found in package.json. Skipping formatting."
    fi
else
    log_warning "pnpm not found. Skipping code formatting."
fi

# ============================================
# 7. Resumo
# ============================================
echo ""
echo -e "${GREEN}╔══════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║  ✅ Limpeza concluída com sucesso!                              ║${NC}"
echo -e "${GREEN}╚══════════════════════════════════════════════════════════════════╝${NC}"
echo ""
log_info "Next steps:"
echo "  1. Run: pnpm install (if needed)"
echo "  2. Run: ./scripts/audit_and_build.sh (to verify everything works)"
echo "  3. Run: ./scripts/db_push.sh (to update database)"
echo ""
