# 🚀 QUICK START - FASE 1

**⏱️ Tempo de setup:** 5-10 minutos

---

## 1️⃣ VERIFICAR IMPLEMENTAÇÕES

```bash
# Verificar que os arquivos foram criados
ls -la client/src/components/CreditGuard.tsx
ls -la client/src/components/UpgradeModal.tsx
ls -la client/src/components/CreditsDisplay.tsx
ls -la client/src/lib/pdfGenerator.ts
ls -la server/_core/rateLimiter.ts
ls -la scripts/create-admin.ts
```

---

## 2️⃣ SETUP LOCAL

```bash
# Instalar dependências (se não feito)
npm install

# Configurar arquivo .env.local
cp .env.example .env.local

# Editar .env.local com suas variáveis:
DATABASE_URL=mysql://user:pass@localhost:3306/database
JWT_SECRET=seu_secret_de_32_caracteres_aleatorios_aqui_12345
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_ESSENCIAL_PRICE_ID=price_...
STRIPE_PROFISSIONAL_PRICE_ID=price_...
```

---

## 3️⃣ EXECUTAR LOCALMENTE

```bash
# Terminal 1: Iniciar servidor dev
npm run dev

# Terminal 2: Em outra aba, rodar testes (opcional)
npm test

# Acessar http://localhost:5173
```

---

## 4️⃣ CRIAR ADMIN (OBRIGATÓRIO)

```bash
# Terminal 3: Criar usuário admin
npx tsx scripts/create-admin.ts

# Saída esperada:
# ✅ Admin criado com sucesso!
#    Email: admin@elevare.com
#    ID: 1
#
# ✅ Subscription criada!
#    Plan: profissional
#    Status: active
```

---

## 5️⃣ TESTAR BÁSICO

### Teste 1: Gerar Conteúdo (2 min)
```
1. Abrir http://localhost:5173
2. Login com admin@elevare.com
3. Ir para "Gerar E-book" ou similar
4. Gerar um conteúdo
5. ✅ Deve funcionar (admin tem créditos ilimitados)
6. Ver saldo no dashboard (deve mostrar "Ilimitado")
```

### Teste 2: Usuário Free (2 min)
```
1. Criar novo usuário
2. Tentar gerar conteúdo
3. ❌ Deve mostrar modal \"Créditos Insuficientes\"
4. Clicar \"Fazer Upgrade\" → vai para pricing
```

### Teste 3: Webhooks (2 min - opcional)
```bash
# Terminal 4: Listener do Stripe
stripe listen --forward-to http://localhost:3000/api/stripe/webhook

# Terminal 5: Trigger evento
stripe trigger checkout.session.completed

# Verificar se subscription foi atualizada no banco:
# SELECT * FROM subscription WHERE userId = <seu_id>;
```

---

## 6️⃣ TESTAR COMPONENTES ESPECÍFICOS

### Importar CreditGuard em qualquer página

```tsx
// client/src/pages/MeuGerador.tsx
import { CreditGuard, useCredits } from "@/components/CreditGuard";
import { CreditsDisplay } from "@/components/CreditsDisplay";

export default function MeuGerador() {
  const { creditsRemaining, hasCredits } = useCredits();

  return (
    <div>
      {/* Mostrar saldo */}
      <CreditsDisplay compact />

      {/* Proteger conteúdo */}
      <CreditGuard requiredCredits={20}>
        <div>
          <h2>Gerador de E-book</h2>
          <p>Créditos necessários: 20</p>
          {/* Seu formulário aqui */}
        </div>
      </CreditGuard>
    </div>
  );
}
```

### Usar Hook useCredits

```tsx
import { useCredits } from "@/components/CreditGuard";

export function MeuComponente() {
  const { 
    creditsRemaining,    // número
    plan,               // 'free' | 'essencial' | 'profissional'
    isUnlimited,        // boolean
    hasCredits,         // function
    refetch             // refresh subscription
  } = useCredits();

  if (!hasCredits(20)) {
    return <p>❌ Sem créditos (precisa 20, tem {creditsRemaining})</p>;
  }

  return <p>✅ Pode gerar (saldo: {creditsRemaining})</p>;
}
```

---

## 7️⃣ CHECKLIST PRÉ-DEPLOY

### Antes de fazer git push:
- [ ] `npm run check` - TypeScript sem erros
- [ ] `npm test` - Testes passando (opcional)
- [ ] Todos os 3 componentes importando sem erro
- [ ] CreditGuard renderizando em página de teste
- [ ] Webhook listener funcionando
- [ ] Admin criado com sucesso
- [ ] Documentação lida (SUMARIO_EXECUTIVO_FASE1.md)

### Antes de fazer deploy:
- [ ] `npm run build` - Build sem erros
- [ ] Variáveis de ambiente configuradas em Railway/host
- [ ] Database migrada
- [ ] Admin criado em produção
- [ ] SSL/HTTPS ativo
- [ ] Health check respondendo em `/api/health`

---

## 8️⃣ TROUBLESHOOTING RÁPIDO

### \"Module not found: CreditGuard\"
```bash
# Verificar arquivo existe
ls client/src/components/CreditGuard.tsx

# Se não existe, rodou create-admin em vez disso?
git status | grep CreditGuard

# Re-criar se necessário
# Copiar conteúdo de CORRECOES_FASE1_IMPLEMENTADAS.md
```

### \"Webhooks não estão recebendo eventos\"
```bash
# Verificar STRIPE_WEBHOOK_SECRET configurado
echo $STRIPE_WEBHOOK_SECRET

# Verificar listener rodando
stripe listen --forward-to http://localhost:3000/api/stripe/webhook

# Logs do server (deve mostrar webhook received)
# grep -i webhook <seu_log>
```

### \"Admin não criado\"
```bash
# Verificar se banco tá vazio
npm run db:push  # Rodar migrations

# Tentar de novo
npx tsx scripts/create-admin.ts
```

### \"Créditos não estão sendo debitados\"
```bash
# Verificar imports em content.ts
grep -n "consumeCredits" server/routers/content.ts

# Deve retornar linhas com imports e chamadas

# Verificar database
SELECT * FROM subscription WHERE userId = <user_id>;
# creditsRemaining deve diminuir após cada geração
```

---

## 9️⃣ PRÓXIMOS PASSOS

### Imediato (hoje):
1. ✅ Setup local completo
2. ✅ Admin criado
3. ✅ Testes básicos passando
4. ✅ Documentação lida

### Hoje ou amanhã:
1. [ ] Testes completos de Fase 1 (GUIA_TESTES_FASE1.md)
2. [ ] Bugs encontrados reportados
3. [ ] Aprovação para staging

### Esta semana:
1. [ ] Deploy em staging
2. [ ] Testes em staging
3. [ ] Setup produção
4. [ ] Aprovação para produção

---

## 📞 SUPORTE RÁPIDO

| Problema | Solução |
|----------|---------|
| TypeScript erro | `npm run check` |
| Build falha | `npm run build 2>&1 \| tail -50` |
| Banco vazio | `npm run db:push` |
| Admin não existe | `npx tsx scripts/create-admin.ts` |
| Webhook erro | `stripe listen --forward-to ...` |
| Créditos bug | Check `consumeCredits()` em content.ts |

---

## 📚 DOCUMENTAÇÃO COMPLETA

Depois do quick-start, ler em ordem:
1. `SUMARIO_EXECUTIVO_FASE1.md` - Overview
2. `CORRECOES_FASE1_IMPLEMENTADAS.md` - Detalhes técnicos
3. `ARQUITETURA_FASE1.md` - Fluxos de dados
4. `GUIA_TESTES_FASE1.md` - Como testar
5. `CHECKLIST_PRE_LANCAMENTO.md` - Pre-launch checklist

---

## ✅ PRONTO?

Se completou tudo acima, o sistema está **pronto para testes de Fase 1**.

**Próximo:** Rodar GUIA_TESTES_FASE1.md completo (30-60 min)

---

**Última atualização:** 26/12/2025
**Tempo estimado para setup:** 5-10 minutos
**Status:** ✅ Pronto
