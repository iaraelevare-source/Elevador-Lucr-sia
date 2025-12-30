#!/bin/bash

# 🚀 Script de Inicialização Rápida - Elevare AI NeuroVendas

echo "🚀 Iniciando Elevare AI NeuroVendas..."
echo ""

# Verificar se Node.js está instalado
if ! command -v node &> /dev/null; then
    echo "❌ Node.js não está instalado"
    exit 1
fi

echo "✅ Node.js: $(node --version)"
echo "✅ pnpm: $(pnpm --version)"
echo ""

# Instalar dependências se necessário
if [ ! -d "node_modules" ]; then
    echo "📦 Instalando dependências..."
    pnpm install
fi

# Build se necessário
if [ ! -d "dist" ]; then
    echo "🔨 Compilando projeto..."
    pnpm build
fi

# Iniciar servidor
echo ""
echo "🚀 Iniciando servidor na porta 5000..."
echo ""
echo "📍 Acesso local: http://localhost:5000"
echo "📍 Acesso público: https://5000-i1wbupuqzkzlextaemqe2-28ebd0a6.us1.manus.computer"
echo ""
echo "🛑 Pressione CTRL+C para parar"
echo ""

node dist/index.js
