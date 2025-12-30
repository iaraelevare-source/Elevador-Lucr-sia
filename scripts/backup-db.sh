#!/bin/bash
# Backup automático do MySQL Railway
# Este script faz backup do banco de dados MySQL hospedado no Railway
# e mantém os últimos 7 backups localmente

set -e  # Sair se qualquer comando falhar

# Configuração
DATE=$(date +%Y%m%d-%H%M%S)
BACKUP_DIR="$HOME/backups/elevare"
BACKUP_FILE="$BACKUP_DIR/backup-$DATE.sql.gz"
LOG_FILE="/var/log/elevare-backup.log"
BACKUP_RETENTION=${BACKUP_RETENTION:-7}  # Número de backups a manter

# Cores para output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Função de log
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

# Verificar se .env.production existe
if [ ! -f ".env.production" ]; then
    echo -e "${RED}❌ Erro: Arquivo .env.production não encontrado${NC}"
    echo "Execute este script no diretório raiz do projeto"
    exit 1
fi

# Criar diretório de backup se não existir
mkdir -p "$BACKUP_DIR"

log "${YELLOW}🔄 Iniciando backup do MySQL Railway...${NC}"

# Extrair DATABASE_URL do .env.production
DATABASE_URL=$(grep "^DATABASE_URL=" .env.production | cut -d '=' -f 2-)

# Verificar se DATABASE_URL existe
if [ -z "$DATABASE_URL" ]; then
    echo -e "${RED}❌ Erro: DATABASE_URL não encontrada no .env.production${NC}"
    exit 1
fi

# Parsear DATABASE_URL (formato: mysql://user:password@host:port/database)
# Remove o prefixo mysql://
DB_STRING="${DATABASE_URL#mysql://}"

# Extrai usuário e senha
DB_USER="${DB_STRING%%:*}"
DB_TEMP="${DB_STRING#*:}"
DB_PASSWORD="${DB_TEMP%%@*}"

# Extrai host, porta e database
DB_TEMP="${DB_STRING#*@}"
DB_HOST="${DB_TEMP%%:*}"
DB_TEMP="${DB_TEMP#*:}"
DB_PORT="${DB_TEMP%%/*}"
DB_NAME="${DB_TEMP#*/}"

# Validar que todas as variáveis foram extraídas
if [ -z "$DB_USER" ] || [ -z "$DB_PASSWORD" ] || [ -z "$DB_HOST" ] || [ -z "$DB_NAME" ]; then
    echo -e "${RED}❌ Erro: Não foi possível parsear DATABASE_URL${NC}"
    exit 1
fi

# Fazer backup
log "Conectando ao banco: $DB_HOST:$DB_PORT/$DB_NAME"
mysqldump -h "$DB_HOST" \
          -P "$DB_PORT" \
          -u "$DB_USER" \
          -p"$DB_PASSWORD" \
          "$DB_NAME" \
          --single-transaction \
          --quick \
          --lock-tables=false \
          --add-drop-table \
          --routines \
          --triggers \
          2>> "$LOG_FILE" | gzip > "$BACKUP_FILE"

# Verificar se backup foi criado com sucesso
if [ -f "$BACKUP_FILE" ]; then
    SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
    log "${GREEN}✅ Backup criado com sucesso: $BACKUP_FILE ($SIZE)${NC}"
else
    log "${RED}❌ Erro: Backup não foi criado${NC}"
    exit 1
fi

# Manter apenas os últimos N backups (configurável)
RETENTION_LIMIT=$((BACKUP_RETENTION + 1))
log "Limpando backups antigos (mantendo últimos ${BACKUP_RETENTION})..."
cd "$BACKUP_DIR"
ls -t backup-*.sql.gz 2>/dev/null | tail -n +${RETENTION_LIMIT} | xargs -r rm -f

# Listar backups disponíveis
log "Backups disponíveis:"
ls -lht "$BACKUP_DIR"/backup-*.sql.gz 2>/dev/null | head -${BACKUP_RETENTION} | tee -a "$LOG_FILE"

log "${GREEN}✅ Processo de backup concluído com sucesso${NC}"
