# 🏗️ ARQUITETURA DAS CORREÇÕES - FASE 1

## Fluxo Completo: Geração de Conteúdo com Sistema de Créditos

```
┌─────────────────────────────────────────────────────────────────────┐
│                       USUÁRIO ABRE GERADOR                          │
│                (EbookGenerator, AdsManager, etc)                   │
└────────────────────────────┬────────────────────────────────────────┘
                             │
                             ▼
        ┌────────────────────────────────────────┐
        │  CreditGuard Component (CLIENT)        │
        │  - Verifica subscription do usuário    │
        │  - Valida creditsRemaining             │
        │  - Bloqueia se zerado                  │
        └────────────┬───────────────────────────┘
                     │
        ┌────────────┴──────────────┐
        │                           │
     BLOQUEADO ← Créditos zerados?  │
   (Mostra Modal                    │
    UpgradeModal)              Créditos OK ▼
                      ┌──────────────────────────┐
                      │  Usuário clica em        │
                      │  "Gerar Conteúdo"       │
                      └───────────┬──────────────┘
                                  │
                                  ▼
            ┌─────────────────────────────────────┐
            │  SERVIDOR (backend/routers/*.ts)    │
            │                                     │
            │  1️⃣ checkCredits(userId, type)   │
            │     ↓ Valida saldo antes           │
            │     ✅ Se OK: continua             │
            │     ❌ Se falta: lança erro        │
            └───────────┬───────────────────────┘
                        │
                        ▼
            ┌─────────────────────────────────┐
            │ 2️⃣ Chamar IA (Gemini)           │
            │   ├─ generateContent            │
            │   ├─ generateEbook              │
            │   ├─ generateAd                 │
            │   └─ generatePrompt             │
            └───────────┬───────────────────────┘
                        │
                        ▼
            ┌─────────────────────────────────┐
            │ 3️⃣ Salvar no DB                 │
            │   contentGeneration table:      │
            │   ├─ id                         │
            │   ├─ content (JSON)             │
            │   └─ creditsUsed: 2             │
            └───────────┬───────────────────────┘
                        │
                        ▼
            ┌─────────────────────────────────┐
            │ 4️⃣ consumeCredits()             │
            │   ├─ Valida de novo             │
            │   ├─ Subtrai do saldo           │
            │   └─ Atualiza DB                │
            └───────────┬───────────────────────┘
                        │
                        ▼
            ┌─────────────────────────────────┐
            │ 5️⃣ Retornar resultado           │
            │   client.tsx recebe             │
            │   conteúdo + novo saldo         │
            └───────────┬───────────────────────┘
                        │
                        ▼
        ┌────────────────────────────────────────┐
        │  CLIENTE ATUALIZA UI                   │
        │  ├─ Exibe conteúdo gerado              │
        │  ├─ Atualiza CreditsDisplay com novo   │
        │  │   saldo                             │
        │  └─ Toast \"Gerado com sucesso!\"     │
        └────────────────────────────────────────┘
```

---

## Fluxo de Pagamento com Webhooks

```
┌─────────────────────────────────────────────────────────────────┐
│                    USUÁRIO NO PRICING PAGE                      │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
         ┌────────────────────────────────┐
         │ Clica \"Fazer Upgrade\"        │
         │ subscription.createCheckout()  │
         └────────┬───────────────────────┘
                  │
                  ▼
    ┌──────────────────────────────────────┐
    │  STRIPE CHECKOUT SESSION             │
    │  ├─ line_items: price_id             │
    │  ├─ customer: stripe_customer_id     │
    │  ├─ mode: \"subscription\"            │
    │  └─ success_url: redirect após pago  │
    └────────┬───────────────────────────────┘
             │
    ┌────────┴─────────────────────────┐
    │  Usuário completa pagamento      │
    └────────┬─────────────────────────┘
             │
             ▼
    ┌──────────────────────────────────────┐
    │  STRIPE WEBHOOK (POST)               │
    │  /api/stripe/webhook                 │
    │  ├─ Event: checkout.session.completed│
    │  └─ Signature verificado             │
    └────────┬───────────────────────────────┘
             │
             ▼
    ┌──────────────────────────────────────┐
    │  handleCheckoutCompleted()           │
    │  ├─ Get customer ID                  │
    │  ├─ Get plan from metadata           │
    │  ├─ Extract credits from PLANS       │
    │  └─ UPDATE subscription table        │
    │      ├─ status: 'active'             │
    │      ├─ plan: 'essencial'            │
    │      ├─ creditsRemaining: 5          │
    │      └─ renewalDate: +1 month        │
    └────────┬───────────────────────────────┘
             │
             ▼
    ┌──────────────────────────────────────┐
    │  CLIENTE REDIRECIONA                 │
    │  ├─ successUrl é chamada             │
    │  ├─ Dashboard carrega                │
    │  └─ useSubscription() refetch        │
    └────────┬───────────────────────────────┘
             │
             ▼
    ┌──────────────────────────────────────┐
    │  USUÁRIO VÊ NOVOS CRÉDITOS           │
    │  ├─ CreditsDisplay mostra 5          │
    │  ├─ Pode gerar novamente             │
    │  └─ Plano agora é \"essencial\"     │
    └──────────────────────────────────────┘
```

---

## Estrutura de Componentes de Proteção de Créditos

```
EbookGenerator.tsx (página)
│
├─ Imports:
│  ├─ CreditGuard (wrapper)
│  ├─ useCredits() (hook)
│  └─ CreditsDisplay (widget)
│
├─ Render:
│  │
│  ├─ <CreditGuard requiredCredits={20}>
│  │  ├─ Verifica subscription via TRPC
│  │  ├─ Se 0 créditos → mostra UpgradeModal
│  │  └─ Se OK → renderiza children
│  │
│  └─ <CreditsDisplay>
│     ├─ Mostra saldo com cor:
│     │  ├─ Verde: > 5 créditos
│     │  ├─ Amarelo: 2-5 créditos
│     │  └─ Vermelho: 0 créditos
│     └─ Botão \"Upgrade\" → /pricing
│
└─ Behavior:
   │
   ├─ handleGenerate():
   │  ├─ useCredits().hasCredits(20)?
   │  ├─ ✅ Sim → chamar TRPC mutation
   │  │  └─ Server valida + consome créditos
   │  └─ ❌ Não → mostrar erro
   │
   └─ handleDownloadPDF():
      └─ printEbookAsPDF(ebook)
         └─ Abre dialog de impressão/PDF


CreditGuard.tsx (componente protetor)
│
├─ Props:
│  ├─ children: React.ReactNode
│  ├─ requiredCredits?: number (default 1)
│  └─ message?: string
│
├─ Logic:
│  ├─ useQuery(subscription)
│  ├─ Check: plan === 'profissional'?
│  ├─ Check: creditsRemaining >= required?
│  └─ If false → show UpgradeModal
│
└─ Hook useCredits():
   └─ Return:
      ├─ subscription
      ├─ isLoading
      ├─ hasCredits(n)
      ├─ isUnlimited
      ├─ creditsRemaining
      └─ plan


UpgradeModal.tsx
│
├─ Props:
│  ├─ isOpen: boolean
│  ├─ onClose: () => void
│  ├─ currentPlan: string
│  ├─ creditsRemaining: number
│  └─ message?: string
│
├─ Content:
│  ├─ Alert icon
│  ├─ \"Créditos Esgotados\" title
│  ├─ Current plan info
│  ├─ Professional plan benefits
│  └─ \"Fazer Upgrade\" button
│
└─ Action:
   └─ Click → navigate(\"/pricing\")


CreditsDisplay.tsx
│
├─ Modes:
│  ├─ Compact: mini display (header)
│  └─ Full: widget com detalhes
│
├─ Shows:
│  ├─ Icon (Coins / Crown)
│  ├─ Current balance
│  ├─ Remaining %
│  └─ Progress bar
│
└─ Colors:
   ├─ Verde (>5): 🟢 Safe
   ├─ Amarelo (2-5): 🟡 Warning
   ├─ Vermelho (0): 🔴 Critical
   └─ Dourado (ilimitado): ⭐ Pro
```

---

## Server-Side Flow: Consumo de Créditos

```
content.ts (router)
│
├─ generateEbook.mutation():
│  │
│  ├─ 1️⃣ Input validation
│  │   └─ topic, targetAudience, tone, chapters
│  │
│  ├─ 2️⃣ await checkCredits(ctx.user.id, 'ebook')
│  │   ├─ TRPC throws se insuficiente
│  │   ├─ Get cost de CREDIT_COSTS['ebook'] = 20
│  │   ├─ Query subscription table
│  │   └─ Validate: remaining >= cost
│  │
│  ├─ 3️⃣ const response = await llm.create({ ... })
│  │   └─ Chama Gemini API
│  │
│  ├─ 4️⃣ const ebook = JSON.parse(response)
│  │   └─ Parse com error handling
│  │
│  ├─ 5️⃣ await db.insert(contentGeneration).values({
│  │       userId, type, title, content, creditsUsed
│  │   })
│  │   └─ Salva conteúdo no banco
│  │
│  ├─ 6️⃣ await consumeCredits(ctx.user.id, 'ebook')
│  │   ├─ Valida de novo (double-check)
│  │   ├─ Se não for profissional:
│  │   │  └─ UPDATE subscription SET creditsRemaining -= cost
│  │   └─ Log the transaction
│  │
│  └─ 7️⃣ return { id, ...ebook }
│


credits.ts (_core)
│
├─ CREDIT_COSTS:
│  ├─ post: 5
│  ├─ ebook: 20
│  ├─ ebook_audio: 30
│  ├─ ad: 10
│  ├─ reel_script: 10
│  ├─ bio_analysis: 5
│  └─ diagnostico: 0 (free for lead capture)
│
├─ checkCredits(userId, type):
│  ├─ Get cost from CREDIT_COSTS
│  ├─ Query subscription WHERE userId
│  ├─ If plan === 'profissional' → return OK
│  ├─ Else if remaining < cost → throw TRPCError
│  └─ Return { subscription, cost }
│
└─ consumeCredits(userId, type, description):
   ├─ Call checkCredits (rethrow if invalid)
   ├─ If profissional or unlimited → return (skip)
   ├─ Else UPDATE subscription
   │  └─ SET creditsRemaining = remaining - cost
   └─ Log transaction for audit
```

---

## Database Schema (Relevant Tables)

```sql
-- Users table
CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  email VARCHAR(255) UNIQUE,
  passwordHash VARCHAR(255),
  name VARCHAR(255),
  role ENUM('user', 'admin') DEFAULT 'user',
  createdAt TIMESTAMP DEFAULT NOW()
);

-- Subscription table (CRITICAL)
CREATE TABLE subscription (
  id INT PRIMARY KEY AUTO_INCREMENT,
  userId INT UNIQUE NOT NULL,
  plan ENUM('free', 'essencial', 'profissional') DEFAULT 'free',
  status ENUM('active', 'inactive', 'cancelled') DEFAULT 'active',
  creditsRemaining INT DEFAULT 0,           -- Current month remaining
  monthlyCreditsLimit INT DEFAULT 0,         -- Total per month
  renewalDate DATETIME,                      -- Next billing date
  stripeCustomerId VARCHAR(255),
  stripeSubscriptionId VARCHAR(255),
  createdAt TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (userId) REFERENCES users(id)
);

-- Content generation table
CREATE TABLE contentGeneration (
  id INT PRIMARY KEY AUTO_INCREMENT,
  userId INT NOT NULL,
  type ENUM('ebook', 'post', 'ad', 'prompt', 'bio_analysis'),
  title VARCHAR(255),
  content LONGTEXT,                          -- JSON content
  creditsUsed INT,                           -- Cost deducted
  metadata JSON,                             -- Additional data
  createdAt TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (userId) REFERENCES users(id)
);

-- Bio radar diagnosis table
CREATE TABLE bioRadarDiagnosis (
  id INT PRIMARY KEY AUTO_INCREMENT,
  userId INT,                                -- NULL if anonymous
  instagramHandle VARCHAR(255),
  bioAnalysis JSON,
  recommendations JSON,
  score INT,
  leadEmail VARCHAR(255),
  leadWhatsapp VARCHAR(255),
  createdAt TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (userId) REFERENCES users(id)
);
```

---

## Error Handling Flow

```
Try to Generate Content
│
├─ ERRO 1: checkCredits() falha
│  └─ throw TRPCError(FORBIDDEN)
│     └─ Client recebe erro
│        └─ Toast mostra: \"Créditos insuficientes. Você tem 0, mas precisa 20\"
│
├─ ERRO 2: IA retorna vazio
│  └─ throw AIServiceError()
│     └─ Client recebe erro
│        └─ Toast mostra: \"Não foi possível gerar conteúdo. Tente novamente\"
│
├─ ERRO 3: Database update falha
│  └─ throw DatabaseError()
│     └─ rollback implícito (transaction)
│        └─ Créditos NÃO são consumidos
│           └─ Cliente pode tentar novamente
│
└─ Sucesso:
   ├─ Conteúdo salvo
   ├─ Créditos consumidos
   └─ Cliente recebe resultado + novo saldo
```

---

## Rate Limiting Flow

```
BioRadar.analyze() (public, sem auth)
│
├─ clientIp = ctx.req.ip ou ctx.req.socket.remoteAddress
│
├─ if (!ctx.user && !checkFreeBioRadarLimit(clientIp))
│  └─ throw RateLimitError
│     └─ Client recebe erro
│        └─ Toast: \"5 análises/hora máximo\"
│
└─ Sucesso:
   ├─ Análise processada
   ├─ Se usuário autenticado:
   │  ├─ Consome 5 créditos (bio_analysis)
   │  └─ Sem limite de taxa
   └─ Se anônimo:
      ├─ Sem débito de créditos
      └─ Rate limit conta incrementa


rateLimiter.ts
│
├─ checkFreeBioRadarLimit(ip):
│  ├─ key = \"bioradar:free:${ip}\"
│  ├─ checkRateLimit(key, 5, 1h)
│  └─ return true/false
│
├─ checkDiagnosticoLimit(ip):
│  ├─ key = \"diagnostico:${ip}\"
│  ├─ checkRateLimit(key, 10, 1h)
│  └─ return true/false
│
└─ checkRateLimit(key, maxRequests, windowMs):
   ├─ Query in-memory Map
   ├─ If expired or new → reset counter
   ├─ If count >= max → return false
   ├─ Else → increment and return true
```

---

**Diagrama criado:** 26/12/2025
**Componentes:** 7 correções críticas
**Status:** ✅ Pronto para testes
