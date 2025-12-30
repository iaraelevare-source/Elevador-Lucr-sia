#!/bin/bash

# ==========================================
# SCRIPT DE VERIFICAÇÃO DE CORREÇÕES
# Elevare AI NeuroVendas - Auditoria v1.1.0
# ==========================================

echo "🔍 VERIFICANDO IMPLEMENTAÇÃO DAS CORREÇÕES..."
echo ""

ERRORS=0

# ==========================================
# 1. Verificar arquivos criados
# ==========================================
echo "📁 1. Verificando arquivos criados..."

check_file() {
  if [ -f "$1" ]; then
    echo "   ✅ $1"
  else
    echo "   ❌ $1 NÃO ENCONTRADO"
    ERRORS=$((ERRORS + 1))
  fi
}

check_file "server/_core/logger.ts"
check_file "server/_core/errors.ts"
check_file "shared/_core/utils.ts"
check_file "shared/types.ts"
check_file "CHANGELOG_AUDITORIA.md"
check_file "INSTRUCOES_IMPLEMENTACAO.md"
echo ""

# ==========================================
# 2. Verificar console.log removidos
# ==========================================
echo "🔍 2. Verificando console.log removidos do código de produção..."

CONSOLE_COUNT=$(grep -r "console\." server/ 2>/dev/null | grep -v "logger\." | grep -v "node_modules" | wc -l)

if [ "$CONSOLE_COUNT" -eq 0 ]; then
  echo "   ✅ Nenhum console.log encontrado (exceto logger)"
else
  echo "   ⚠️  Encontrados $CONSOLE_COUNT console.log ainda no código:"
  grep -r "console\." server/ 2>/dev/null | grep -v "logger\." | grep -v "node_modules"
fi
echo ""

# ==========================================
# 3. Verificar package.json
# ==========================================
echo "📦 3. Verificando dependências..."

if grep -q '"vite": "^5.4' package.json; then
  echo "   ✅ Vite downgrade para 5.x"
else
  echo "   ❌ Vite ainda em versão 7.x"
  ERRORS=$((ERRORS + 1))
fi

if grep -q '"cors"' package.json; then
  echo "   ✅ CORS instalado"
else
  echo "   ❌ CORS não instalado"
  ERRORS=$((ERRORS + 1))
fi

if grep -q '"express-rate-limit"' package.json; then
  echo "   ✅ express-rate-limit instalado"
else
  echo "   ❌ express-rate-limit não instalado"
  ERRORS=$((ERRORS + 1))
fi
echo ""

# ==========================================
# 4. Verificar imports no código
# ==========================================
echo "📥 4. Verificando imports..."

if grep -q "import { logger }" server/_core/index.ts; then
  echo "   ✅ Logger importado em index.ts"
else
  echo "   ❌ Logger não importado em index.ts"
  ERRORS=$((ERRORS + 1))
fi

if grep -q "import.*cors" server/_core/index.ts; then
  echo "   ✅ CORS importado"
else
  echo "   ❌ CORS não importado"
  ERRORS=$((ERRORS + 1))
fi

if grep -q "import.*rateLimit" server/_core/index.ts; then
  echo "   ✅ Rate limit importado"
else
  echo "   ❌ Rate limit não importado"
  ERRORS=$((ERRORS + 1))
fi
echo ""

# ==========================================
# 5. Verificar webhook do Stripe
# ==========================================
echo "🔐 5. Verificando webhook do Stripe..."

if grep -q "/api/stripe/webhook" server/_core/index.ts; then
  echo "   ✅ Endpoint webhook implementado"
else
  echo "   ❌ Endpoint webhook NÃO implementado"
  ERRORS=$((ERRORS + 1))
fi

if grep -q "handleCheckoutCompleted" server/_core/index.ts; then
  echo "   ✅ Handler handleCheckoutCompleted"
else
  echo "   ❌ Handler handleCheckoutCompleted ausente"
  ERRORS=$((ERRORS + 1))
fi

if grep -q "handlePaymentSucceeded" server/_core/index.ts; then
  echo "   ✅ Handler handlePaymentSucceeded"
else
  echo "   ❌ Handler handlePaymentSucceeded ausente"
  ERRORS=$((ERRORS + 1))
fi
echo ""

# ==========================================
# 6. Verificar validação de ENV
# ==========================================
echo "⚙️  6. Verificando validação de variáveis de ambiente..."

if grep -q "getRequiredEnv" server/_core/env.ts; then
  echo "   ✅ Função getRequiredEnv implementada"
else
  echo "   ❌ Função getRequiredEnv NÃO implementada"
  ERRORS=$((ERRORS + 1))
fi

if grep -q "JWT_SECRET deve ter no mínimo 32 caracteres" server/_core/env.ts; then
  echo "   ✅ Validação de JWT_SECRET"
else
  echo "   ❌ Validação de JWT_SECRET ausente"
  ERRORS=$((ERRORS + 1))
fi
echo ""

# ==========================================
# 7. Verificar índices no schema
# ==========================================
echo "🗄️  7. Verificando índices de banco..."

if grep -q "user_id_idx" drizzle/schema.ts; then
  echo "   ✅ Índices definidos no schema"
else
  echo "   ❌ Índices NÃO definidos no schema"
  ERRORS=$((ERRORS + 1))
fi

if grep -q "index(\"user_id_idx\")" drizzle/schema.ts; then
  echo "   ✅ Sintaxe de índice correta"
else
  echo "   ⚠️  Verifique sintaxe dos índices"
fi
echo ""

# ==========================================
# 8. Verificar classes de erro
# ==========================================
echo "❗ 8. Verificando classes de erro..."

ERROR_CLASSES=("AppError" "AIServiceError" "RateLimitError" "AuthenticationError" "NotFoundError")
for class in "${ERROR_CLASSES[@]}"; do
  if grep -q "export class $class" server/_core/errors.ts; then
    echo "   ✅ $class"
  else
    echo "   ❌ $class ausente"
    ERRORS=$((ERRORS + 1))
  fi
done
echo ""

# ==========================================
# 9. Verificar tipos TypeScript
# ==========================================
echo "📘 9. Verificando tipos TypeScript..."

TYPES=("ContentGenerationItem" "EbookContent" "Subscription" "User")
for type in "${TYPES[@]}"; do
  if grep -q "interface $type" shared/types.ts; then
    echo "   ✅ $type"
  else
    echo "   ⚠️  $type não encontrado"
  fi
done
echo ""

# ==========================================
# 10. Resumo
# ==========================================
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 RESUMO DA VERIFICAÇÃO"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ $ERRORS -eq 0 ]; then
  echo ""
  echo "✅ TODAS AS VERIFICAÇÕES PASSARAM!"
  echo ""
  echo "Próximos passos:"
  echo "1. pnpm install"
  echo "2. Configurar .env"
  echo "3. pnpm db:push"
  echo "4. pnpm dev"
  echo ""
  exit 0
else
  echo ""
  echo "❌ ENCONTRADOS $ERRORS ERROS"
  echo ""
  echo "Revise os itens marcados com ❌ acima."
  echo "Consulte INSTRUCOES_IMPLEMENTACAO.md para mais detalhes."
  echo ""
  exit 1
fi
