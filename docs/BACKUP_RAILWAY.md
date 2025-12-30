# 🗄️ Configurar Backup Automático - Railway MySQL

**Tempo necessário:** 2 minutos  
**Prioridade:** 🔴 CRÍTICA  
**Risco se não feito:** Perda total de dados

---

## 📋 Pré-requisitos

- Acesso ao [Railway Dashboard](https://railway.app)
- Projeto: `Elevador.Lucr-sia`
- Serviço: MySQL Database

---

## 🚀 Passo a Passo

### 1️⃣ Acessar Railway Dashboard

1. Ir para: https://railway.app
2. Login com sua conta
3. Selecionar projeto: **Elevador.Lucr-sia**

### 2️⃣ Selecionar Serviço MySQL

1. No dashboard do projeto, clicar no serviço **MySQL**
2. Aparecerá a tela de configurações do banco

### 3️⃣ Ativar Backups Automáticos

**Opção A: Se Railway tem aba "Backups"**

1. Clicar na aba **"Backups"** no menu lateral
2. Clicar em **"Enable Backups"**
3. Configurar:
   - **Frequência:** Diário (Daily)
   - **Horário:** 03:00 AM UTC (00:00 AM BRT)
   - **Retenção:** 7 dias (mínimo)
4. Clicar em **"Save"** ou **"Enable"**

**Opção B: Se Railway não tem aba "Backups" (serviço gratuito)**

Railway Free Tier **NÃO suporta backups automáticos nativos**.

**Soluções alternativas:**

#### 🔹 Solução 1: Upgrade para Railway Pro ($5/mês)

- Vai para: Settings → Billing
- Upgrade para **Railway Pro**
- Ativa backups automáticos (passos acima)

#### 🔹 Solução 2: Backup Manual com GitHub Actions (Grátis)

Criar workflow `.github/workflows/backup-db.yml`:

```yaml
name: Database Backup

on:
  schedule:
    - cron: "0 3 * * *" # Diário às 3h AM UTC
  workflow_dispatch: # Manual trigger

jobs:
  backup:
    runs-on: ubuntu-latest
    steps:
      - name: Install MySQL Client
        run: |
          sudo apt-get update
          sudo apt-get install -y mysql-client

      - name: Set Backup Filename
        id: backup_name
        run: echo "filename=backup-$(date +%Y%m%d-%H%M%S)" >> $GITHUB_OUTPUT

      - name: Backup MySQL
        run: |
          mysqldump -h ${{ secrets.DB_HOST }} \
                    -P ${{ secrets.DB_PORT || 3306 }} \
                    -u ${{ secrets.DB_USER }} \
                    -p${{ secrets.DB_PASSWORD }} \
                    ${{ secrets.DB_NAME }} \
                    --single-transaction \
                    --quick \
                    --lock-tables=false \
                    > ${{ steps.backup_name.outputs.filename }}.sql

      - name: Compress Backup
        run: gzip ${{ steps.backup_name.outputs.filename }}.sql

      - name: Upload to GitHub Artifacts
        uses: actions/upload-artifact@v4
        with:
          name: mysql-backup-${{ github.run_id }}
          path: ${{ steps.backup_name.outputs.filename }}.sql.gz
          retention-days: 7
```

**Configurar secrets no GitHub:**

1. Ir para: Settings → Secrets and variables → Actions
2. Adicionar secrets extraídos do DATABASE_URL:

   Para Railway, o DATABASE_URL tem formato:
   `mysql://user:password@host:port/database`

   Extrair e adicionar cada parte:
   - `DB_HOST` - Hostname (ex: `shinkansen.proxy.rlwy.net`)
   - `DB_PORT` - Porta (ex: `19512`)
   - `DB_USER` - Usuário (geralmente `root`)
   - `DB_PASSWORD` - Password da conexão
   - `DB_NAME` - Nome do banco (geralmente `railway`)

#### 🔹 Solução 3: Script Local + Cron (Servidor próprio)

Criar `scripts/backup-db.sh`:

```bash
#!/bin/bash
# Backup automático do MySQL Railway
# Extrai credenciais do DATABASE_URL e faz backup seguro

DATE=$(date +%Y%m%d-%H%M%S)
BACKUP_DIR="$HOME/backups/elevare"
BACKUP_FILE="$BACKUP_DIR/backup-$DATE.sql.gz"

# Criar diretório se não existir
mkdir -p $BACKUP_DIR

# Extrair DATABASE_URL do .env.production
DATABASE_URL=$(grep "^DATABASE_URL=" .env.production | cut -d '=' -f 2-)

# Parsear DATABASE_URL (mysql://user:password@host:port/database)
DB_STRING="${DATABASE_URL#mysql://}"
DB_USER="${DB_STRING%%:*}"
DB_TEMP="${DB_STRING#*:}"
DB_PASSWORD="${DB_TEMP%%@*}"
DB_TEMP="${DB_STRING#*@}"
DB_HOST="${DB_TEMP%%:*}"
DB_TEMP="${DB_TEMP#*:}"
DB_PORT="${DB_TEMP%%/*}"
DB_NAME="${DB_TEMP#*/}"

# Fazer backup
mysqldump -h $DB_HOST \
          -P $DB_PORT \
          -u $DB_USER \
          -p$DB_PASSWORD \
          $DB_NAME \
          --single-transaction \
          | gzip > $BACKUP_FILE

# Manter apenas últimos 7 backups
ls -t $BACKUP_DIR/backup-*.sql.gz | tail -n +8 | xargs rm -f

echo "✅ Backup criado: $BACKUP_FILE"
```

**Nota de Segurança:** O script extrai apenas a DATABASE_URL necessária, sem expor outras variáveis de ambiente.

**Configurar cron:**

```bash
# Abrir crontab
crontab -e

# Adicionar linha (backup diário às 3h AM)
0 3 * * * /caminho/para/scripts/backup-db.sh >> /var/log/elevare-backup.log 2>&1
```

---

## ✅ Validação

### Testar backup manual

**Railway Pro:**

1. Na aba Backups, clicar em **"Create Backup Now"**
2. Aguardar conclusão (1-5 minutos)
3. Verificar se backup aparece na lista

**GitHub Actions:**

```bash
# Disparar workflow manualmente
# Ir para: Actions → Database Backup → Run workflow
```

**Script Local:**

```bash
# Testar manualmente
./scripts/backup-db.sh

# Verificar se arquivo foi criado
ls -lh ~/backups/elevare/
```

### Testar restauração (IMPORTANTE!)

**⚠️ CUIDADO: Testar em ambiente de desenvolvimento primeiro!**

```bash
# Baixar backup
gunzip backup-YYYYMMDD-HHMMSS.sql.gz

# Restaurar em banco de teste
mysql -h localhost -u root -p test_database < backup-YYYYMMDD-HHMMSS.sql

# Verificar dados
mysql -h localhost -u root -p test_database -e "SELECT COUNT(*) FROM users;"
```

---

## 📊 Monitoramento

### Railway Pro

- Backups ficam listados na aba "Backups"
- Railway envia email se backup falhar

### GitHub Actions

- Acessar: Actions → Database Backup
- Verificar se workflow roda diariamente
- Baixar artifacts se necessário

### Script Local

- Verificar log: `tail -f /var/log/elevare-backup.log`
- Monitorar espaço em disco: `df -h`

---

## 🔄 Cronograma de Retenção

| Solução        | Retenção Padrão     | Retenção Recomendada     |
| -------------- | ------------------- | ------------------------ |
| Railway Pro    | 7 dias              | 14 dias                  |
| GitHub Actions | 90 dias (artifacts) | 7 dias (espaço limitado) |
| Script Local   | Ilimitado           | 30 dias                  |

---

## 🚨 Plano de Recuperação de Desastre

### Cenário: Banco de dados corrompido

1. **Parar aplicação** (evitar escrita durante restore)
2. **Baixar backup mais recente**
3. **Criar novo banco de dados vazio**
4. **Restaurar backup**
5. **Validar dados críticos**:
   ```sql
   SELECT COUNT(*) FROM users;
   SELECT COUNT(*) FROM subscription WHERE status = 'active';
   SELECT COUNT(*) FROM contentGeneration;
   ```
6. **Apontar aplicação para novo banco**
7. **Testar funcionalidades críticas**
8. **Reativar aplicação**

**Tempo estimado de recuperação (RTO):** 15-30 minutos  
**Perda máxima de dados (RPO):** 24 horas (se backup diário)

---

## 📝 Checklist Pós-Configuração

- [ ] Backup automático ativado
- [ ] Teste de backup manual executado com sucesso
- [ ] Teste de restauração em ambiente dev realizado
- [ ] Monitoramento configurado (email/log)
- [ ] Documentação de DR revisada com time
- [ ] Calendário de verificação trimestral agendado

---

## 📞 Suporte

- **Railway Support:** https://railway.app/help
- **Documentação Oficial:** https://docs.railway.app/databases/backups
- **GitHub Actions Docs:** https://docs.github.com/actions

---

## 🔗 Recursos Adicionais

- [Railway Database Backups](https://docs.railway.app/databases/backups)
- [MySQL Backup Best Practices](https://dev.mysql.com/doc/refman/8.0/en/backup-and-recovery.html)
- [mysqldump Documentation](https://dev.mysql.com/doc/refman/8.0/en/mysqldump.html)

---

**Última atualização:** 27/12/2025  
**Responsável:** DevOps / Administrador de Sistema  
**Criticidade:** 🔴 MÁXIMA
