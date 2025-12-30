#!/bin/bash

echo "⏳ Removendo pnpm-lock.yaml..."
rm -f pnpm-lock.yaml

echo "🧹 Limpando o cache do pnpm..."
pnm store prune

echo "📦 Excluindo node_modules..."
rm -rf node_modules

echo "🔄 Instalando dependências novamente..."
pnm install

echo "⬆️ Atualizando openai e zod (se necessário)..."
pnm add openai zod

echo "🔐 Adicionando as alterações ao git..."
git add pnpm-lock.yaml

echo "✍️ Realizando commit..."
git commit -m "fix: regenerar pnpm-lock.yaml e atualizar dependências openai e zod"

echo "⏫ Realizando push..."
git push

echo "✅ Processo concluído! Agora, rode 'pnpm run build' para garantir que tudo está funcionando."
