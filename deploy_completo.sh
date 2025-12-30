#!/bin/bash

# 🚀 Script de Deploy Completo - Elevare AI NeuroVendas
# Executa todas as etapas necessárias para deploy no Railway

set -e  # Para em caso de erro

echo "🚀 =========================================="
echo "   DEPLOY COMPLETO - Elevare AI NeuroVendas"
echo "=========================================="
echo ""

# 1. Gerar secrets seguros
echo "🔐 1/5: Gerando secrets de segurança..."
JWT_SECRET=$(openssl rand -base64 48)
ENCRYPTION_KEY=$(openssl rand -base64 48)

echo "✅ Secrets gerados com sucesso!"
echo ""

# 2. Criar arquivo com as variáveis
echo "📝 2/5: Criando arquivo de configuração..."
cat > RAILWAY_VARS.txt << EOF
# ========================================
# VARIÁVEIS PARA CONFIGURAR NO RAILWAY
# ========================================
# Copie e cole estas variáveis em:
# Railway → Seu Projeto → Settings → Variables
# ========================================

JWT_SECRET=$JWT_SECRET

ENCRYPTION_KEY=$ENCRYPTION_KEY

NODE_ENV=production

PORT=3000

# DATABASE_URL será gerado automaticamente pelo MySQL plugin
# Não precisa adicionar manualmente

# ========================================
# INSTRUÇÕES:
# ========================================
# 1. Acesse: https://railway.app
# 2. Vá para seu projeto: Elevador-Lucr-sia
# 3. Clique em "Settings" → "Variables"
# 4. Adicione cada variável acima (uma por vez)
# 5. Clique em "Deploy" para aplicar
# ========================================
EOF

echo "✅ Arquivo RAILWAY_VARS.txt criado!"
echo ""

# 3. Fazer commit
echo "📦 3/5: Fazendo commit das mudanças..."
git add .
git commit -m "fix: MySQL pool + security fixes + deploy automation

- Correção do pool MySQL2 (resolve ERROR 1059)
- Remoção de JWT secret hardcoded
- Correção de CORS em produção
- Adiciona script de deploy completo
- Gera secrets seguros automaticamente
" || echo "⚠️  Nada para commitar (já está atualizado)"

echo "✅ Commit realizado!"
echo ""

# 4. Push para GitHub
echo "🌐 4/5: Enviando para GitHub..."
git push origin master

echo "✅ Push concluído!"
echo ""

# 5. Mostrar instruções finais
echo "📋 5/5: Configuração final..."
echo ""
echo "=========================================="
echo "✅ DEPLOY LOCAL COMPLETO!"
echo "=========================================="
echo ""
echo "📝 PRÓXIMOS PASSOS (20 minutos):"
echo ""
echo "1️⃣  Abra o arquivo RAILWAY_VARS.txt"
echo "    cat RAILWAY_VARS.txt"
echo ""
echo "2️⃣  Acesse o Railway:"
echo "    https://railway.app"
echo ""
echo "3️⃣  Vá para seu projeto:"
echo "    Elevador-Lucr-sia → Settings → Variables"
echo ""
echo "4️⃣  Adicione as variáveis do arquivo RAILWAY_VARS.txt"
echo ""
echo "5️⃣  Aguarde o deploy automático (5-10 min)"
echo ""
echo "6️⃣  Teste:"
echo "    curl https://seu-projeto.up.railway.app/api/health"
echo ""
echo "=========================================="
echo "🎉 SECRETS GERADOS:"
echo "=========================================="
echo ""
echo "JWT_SECRET (primeiros 20 chars):"
echo "${JWT_SECRET:0:20}..."
echo ""
echo "ENCRYPTION_KEY (primeiros 20 chars):"
echo "${ENCRYPTION_KEY:0:20}..."
echo ""
echo "⚠️  IMPORTANTE: Guarde estes valores!"
echo "    Eles estão salvos em: RAILWAY_VARS.txt"
echo ""
echo "=========================================="
echo "⏱️  TEMPO ESTIMADO ATÉ ESTAR NO AR:"
echo "    ~20-30 minutos"
echo "=========================================="
echo ""
echo "🆘 PROBLEMAS?"
echo "    Leia: CHECKLIST_HOJE.md"
echo ""
echo "✅ Deploy iniciado com sucesso!"
echo ""
