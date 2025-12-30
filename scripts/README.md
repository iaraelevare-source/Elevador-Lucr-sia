# 🛠️ Scripts de Automação - LucresIA Elevare

Este diretório contém scripts de automação para manutenção, auditoria e deploy do projeto LucresIA Elevare.

## 📋 Índice

- [Visão Geral](#visão-geral)
- [Scripts Disponíveis](#scripts-disponíveis)
- [Uso](#uso)
- [Ordem Recomendada](#ordem-recomendada)
- [CI/CD Integration](#cicd-integration)

---

## 🎯 Visão Geral

Estes scripts foram desenvolvidos seguindo as melhores práticas de engenharia de software para garantir:

- ✅ **Consistência**: Padronização de processos
- ✅ **Segurança**: Verificações de vulnerabilidades
- ✅ **Robustez**: Validações e checks automáticos
- ✅ **Rastreabilidade**: Logs detalhados de cada operação
- ✅ **Produtividade**: Automação de tarefas repetitivas

---

## 📦 Scripts Disponíveis

### 1. 🧹 `clean_codebase.sh`

**Propósito**: Limpeza e padronização completa do código-base.

**O que faz**:
- Remove arquivos temporários e build artifacts (dist, cache, etc.)
- Remove arquivos legados e duplicados (-old, -copy, .backup, etc.)
- Verifica nomenclatura de arquivos (português vs inglês)
- Limpa logs antigos
- Verifica estrutura de diretórios
- Formata código com Prettier

**Uso**:
```bash
./scripts/clean_codebase.sh
```

**Quando usar**:
- Antes de iniciar desenvolvimento após merge
- Periodicamente para manter o projeto limpo
- Após resolver conflitos de merge
- Antes de fazer build de produção

**Saída esperada**:
```
🧹 LucresIA Elevare - Limpeza e Padronização de Código
[INFO] 🗑️  Removing temporary files and build artifacts...
[SUCCESS] Removed: Build output directory (dist)
[INFO] 🔍 Searching for legacy and duplicate files...
[INFO] 📋 Checking for Portuguese naming...
[INFO] 📝 Cleaning old log files...
[INFO] 📁 Verifying directory structure...
[INFO] 🎨 Formatting code with Prettier...
✅ Limpeza concluída com sucesso!
```

---

### 2. 🔍 `audit_and_build.sh`

**Propósito**: Auditoria completa e build do projeto.

**O que faz**:
1. Verifica pré-requisitos (Node.js, pnpm)
2. Instala dependências
3. Executa TypeScript type checking
4. Executa linter (se disponível)
5. Executa testes (se disponíveis)
6. Faz build do projeto
7. Verifica output do build
8. Checa variáveis de ambiente
9. Verifica schema do banco de dados
10. Executa security audit (pnpm audit)
11. Analisa tamanho do bundle

**Uso**:
```bash
./scripts/audit_and_build.sh
```

**Quando usar**:
- Antes de fazer commit de mudanças grandes
- Antes de fazer deploy para produção
- Em pipelines de CI/CD
- Para validar que tudo está funcionando

**Saída esperada**:
```
🔍 LucresIA Elevare - Auditoria e Build
[INFO] 🔧 Checking prerequisites...
[SUCCESS] Node.js installed: v20.x.x
[SUCCESS] pnpm installed: 10.x.x
[INFO] ▶️  Installing dependencies
[SUCCESS] Installing dependencies completed successfully
[INFO] ▶️  TypeScript type checking
[SUCCESS] TypeScript type checking completed successfully
[INFO] ▶️  Building project
[SUCCESS] Building project completed successfully
[INFO] 📦 Checking build output...
[SUCCESS] Build directory exists: dist/
[INFO] 🔐 Checking environment variables...
[INFO] 🗄️  Checking database schema...
[INFO] 🔒 Running security audit...
[INFO] 📊 Bundle size analysis...
✅ Auditoria e Build concluídos!
```

---

### 3. 🗄️ `db_push.sh`

**Propósito**: Atualizar schema do banco de dados usando Drizzle ORM.

**O que faz**:
1. Verifica pré-requisitos (pnpm, .env, DATABASE_URL)
2. Gera migrations do Drizzle
3. Aplica migrations ao banco de dados
4. Verifica conexão com o banco
5. Exibe informações do schema
6. Mostra histórico de migrations

**Uso**:
```bash
./scripts/db_push.sh
```

**Quando usar**:
- Após modificar o schema (drizzle/schema.ts)
- Ao fazer deploy de nova versão com mudanças no DB
- Para sincronizar banco local com schema
- Em setup inicial do projeto

**⚠️ IMPORTANTE**: Este script modifica o banco de dados! Sempre faça backup antes.

**Saída esperada**:
```
🗄️  LucresIA Elevare - Database Migration
[INFO] 🔧 Checking prerequisites...
[SUCCESS] pnpm is installed
[SUCCESS] .env file exists
[SUCCESS] DATABASE_URL is configured
[WARNING] ⚠️  IMPORTANT: This script will modify your database!
Do you want to continue? (y/N): y
[INFO] 📝 Generating Drizzle migrations...
[SUCCESS] Migrations generated successfully
[INFO] 🚀 Applying migrations to database...
[SUCCESS] Migrations applied successfully
[INFO] 🔍 Verifying database connection...
[SUCCESS] Database connection verified
[INFO] 📊 Database schema information:
[INFO]   Tables defined: 8
✅ Database migration completed successfully!
```

---

### 4. ⚙️ `setup-stripe.ts`

**Propósito**: Configuração inicial do Stripe para testes.

**O que faz**:
- Cria produtos no Stripe
- Configura preços recorrentes
- Retorna IDs necessários para .env

**Uso**:
```bash
pnpm tsx scripts/setup-stripe.ts
```

**Quando usar**:
- Setup inicial do projeto
- Ao configurar novo ambiente (staging, produção)
- Para recriar produtos do Stripe

---

## 🔄 Ordem Recomendada

### Setup Inicial (primeira vez)
```bash
# 1. Instalar dependências
pnpm install

# 2. Configurar variáveis de ambiente
cp .env.example .env
# Edite o .env com suas credenciais

# 3. Configurar Stripe (opcional, apenas se usar pagamentos)
pnpm tsx scripts/setup-stripe.ts

# 4. Atualizar banco de dados
chmod +x scripts/*.sh
./scripts/db_push.sh

# 5. Validar tudo
./scripts/audit_and_build.sh

# 6. Iniciar desenvolvimento
pnpm dev
```

### Workflow Diário de Desenvolvimento
```bash
# Manhã (início do dia)
git pull
./scripts/clean_codebase.sh
pnpm install

# Antes de commit
./scripts/audit_and_build.sh

# Se mudou schema do banco
./scripts/db_push.sh
```

### Antes de Deploy
```bash
# 1. Limpar projeto
./scripts/clean_codebase.sh

# 2. Auditoria completa
./scripts/audit_and_build.sh

# 3. Atualizar DB (se necessário)
./scripts/db_push.sh

# 4. Commit e push
git add .
git commit -m "feat: prepare for deployment"
git push
```

---

## 🤖 CI/CD Integration

Estes scripts estão integrados ao GitHub Actions (`.github/workflows/deploy.yml`):

```yaml
# Exemplo de uso no workflow
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup
        run: |
          chmod +x scripts/*.sh
          
      - name: Clean and Build
        run: |
          ./scripts/clean_codebase.sh
          ./scripts/audit_and_build.sh
          
      - name: Deploy
        if: success()
        run: |
          # Deploy logic here
```

**Benefícios**:
- Validação automática em cada push
- Prevenção de bugs em produção
- Garantia de código limpo e formatado
- Auditoria de segurança automatizada

---

## 🔒 Segurança

### Variáveis Sensíveis

Os scripts **NÃO** expõem variáveis sensíveis nos logs. Apenas verificam se existem.

### Permissões

Para tornar os scripts executáveis:
```bash
chmod +x scripts/*.sh
```

### Boas Práticas

1. **Nunca** commite arquivos `.env` com credenciais reais
2. Use `.env.example` como template
3. Configure secrets no GitHub/Railway para CI/CD
4. Sempre faça backup do banco antes de migrations

---

## 🐛 Troubleshooting

### Erro: "pnpm: command not found"
```bash
npm install -g pnpm@10.4.1
```

### Erro: "Permission denied"
```bash
chmod +x scripts/*.sh
```

### Erro: "Database connection failed"
- Verifique se o MySQL está rodando
- Confirme DATABASE_URL no .env
- Teste conexão manualmente

### Erro: "Build failed"
- Execute `pnpm clean` (ou delete dist/)
- Execute `pnpm install` novamente
- Verifique erros de TypeScript com `pnpm check`

---

## 📚 Documentação Adicional

- [README Principal](../README.md)
- [Deploy Guide](../DEPLOY.md)
- [Relatório Técnico](../RELATORIO_TECNICO.md)
- [Changelog de Auditoria](../CHANGELOG_AUDITORIA.md)

---

## 🤝 Contribuindo

Ao adicionar novos scripts:

1. Siga o padrão de nomenclatura: `nome_descritivo.sh`
2. Adicione comentários explicativos
3. Use as funções de log (log_info, log_success, etc.)
4. Documente no README
5. Teste em ambiente limpo

---

## 📝 Licença

MIT © LucresIA Elevare Team

---

**Elevare AI NeuroVendas** - Venda como ciência, não como esperança. 🚀
