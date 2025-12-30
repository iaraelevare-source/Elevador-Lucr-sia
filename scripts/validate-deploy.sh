#!/bin/bash
set -e

echo "🔍 Validando configuração de deploy..."

# 1. Verificar lockfile
if [ ! -f "pnpm-lock.yaml" ]; then
  echo "❌ pnpm-lock.yaml não encontrado"
  exit 1
fi

# 2. Verificar duplicatas
if grep -q "@types/pg-pool@2.0.6:" pnpm-lock.yaml | grep -c "@types/pg-pool@2.0.6:" | grep -q "2"; then
  echo "❌ Duplicatas encontradas no lockfile"
  exit 1
fi

# 3. Testar instalação
echo "📦 Testando instalação..."
pnpm install --frozen-lockfile

# 4. Testar build
echo "🏗️ Testando build..."
pnpm run build

# 5. Verificar conflitos
echo "🔎 Verificando conflitos de dependências..."
pnpm list --depth=0

echo "✅ Todas as validações passaram!"
