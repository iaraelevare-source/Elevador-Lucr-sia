# 🚀 Elevare AI NeuroVendas

**Slogan:** "Venda como ciência, não como esperança."

**Descrição:** O pilar que une neurovendas, comportamento e engenharia de conversão.

Elevare Inteligência de Vendas é a camada lógica do faturamento: leitura de perfil, jornada emocional, gatilhos de decisão, ancoragem de preço, oferta irresistível e técnicas baseadas em neurociência aplicada ao consumo estético.

Não é manipulação — é comunicação profissional.

---

## 📋 Índice

- [Visão Geral](#visão-geral)
- [Funcionalidades](#funcionalidades)
- [Tecnologias](#tecnologias)
- [Instalação](#instalação)
- [Configuração](#configuração)
- [Uso](#uso)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [API Reference](#api-reference)
- [Deploy](#deploy)
- [Contribuição](#contribuição)

---

## 🎯 Visão Geral

Elevare AI NeuroVendas é uma plataforma SaaS completa para profissionais de estética que desejam melhorar suas vendas através de técnicas de neurovendas e inteligência artificial.

### Manifesto

- **Vender é traduzir valor, não baixar preço.**
- **É conduzir, não pressionar.**
- **É mostrar o caminho da transformação que a cliente já deseja.**

### Pitch

A cliente não compra o procedimento — compra a promessa.
Elevare Inteligência de Vendas ensina você a entregar exatamente essa promessa.

---

## ✨ Funcionalidades

### 1. Radar de Bio (Lead Magnet) ✅
- Análise de bio do Instagram com IA
- Diagnóstico personalizado com pontuação
- Recomendações práticas
- Captura de leads (email/WhatsApp)
- Integração com Gemini API

### 2. Sistema de Monetização (Stripe) ✅
- 3 planos: Grátis, PRO (R$ 29/mês), PRO+ (R$ 79/mês)
- Checkout seguro com Stripe
- Gerenciamento de assinaturas
- Sistema de créditos
- Portal do cliente

### 3. Gerador de E-books ✅
- Criação automática de e-books com IA
- Customização de tom e público-alvo
- Geração de capas com IA
- Export para PDF (em desenvolvimento)
- Biblioteca de e-books

### 4. Robô Produtor ✅
- **Gerador de Prompts:** Cria prompts otimizados para Midjourney/DALL-E/Stable Diffusion
- **Gerador de Anúncios:** Copy de anúncios para Instagram/Facebook/Google
- Baseado em técnicas de neurovendas
- Múltiplas variações

### 5. Dashboard Completo ✅
- Estatísticas em tempo real
- Gerenciamento de créditos
- Acesso rápido a todas as funcionalidades
- Interface moderna e responsiva

---

## 🛠 Tecnologias

### Frontend
- **React 19** - Framework UI
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **shadcn/ui** - Componentes
- **tRPC** - Type-safe API
- **Wouter** - Routing
- **React Query** - Data fetching

### Backend
- **Node.js** - Runtime
- **Express** - Web framework
- **tRPC** - API framework
- **Drizzle ORM** - Database ORM
- **MySQL** - Database
- **Stripe** - Pagamentos
- **OpenAI/Gemini** - IA

### DevOps
- **Vite** - Build tool
- **pnpm** - Package manager
- **ESBuild** - Bundler

---

## 📦 Instalação

### Pré-requisitos
- Node.js 22+
- pnpm 10+
- MySQL 8+

### Passos

1. **Clone o repositório**
```bash
git clone <repository-url>
cd elevare_ai_neurovendas
```

2. **Instale as dependências**
```bash
pnpm install
```

3. **Configure as variáveis de ambiente**
```bash
cp .env.example .env
# Edite o arquivo .env com suas credenciais
```

4. **Configure o banco de dados**
```bash
pnpm db:push
```

5. **Inicie o servidor de desenvolvimento**
```bash
pnpm dev
```

A aplicação estará disponível em `http://localhost:5000`

---

## ⚙️ Configuração

### Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto:

```env
# Database
DATABASE_URL=mysql://user:password@localhost:3306/elevare_db

# OAuth
OAUTH_SERVER_URL=https://oauth.manus.im
VITE_APP_ID=your_app_id
OWNER_OPEN_ID=your_owner_open_id

# JWT
JWT_SECRET=your_jwt_secret_key_here

# Stripe
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_PRO_PRICE_ID=price_your_pro_price_id
STRIPE_PRO_PLUS_PRICE_ID=price_your_pro_plus_price_id
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# Forge API
BUILT_IN_FORGE_API_URL=https://api.forge.manus.im
BUILT_IN_FORGE_API_KEY=your_forge_api_key
```

### Configuração do Stripe

1. Crie uma conta no [Stripe](https://stripe.com)
2. Crie produtos e preços no dashboard
3. Configure o webhook endpoint: `https://your-domain.com/api/stripe/webhook`
4. Copie as chaves e IDs para o `.env`

---

## 🚀 Uso

### Desenvolvimento

```bash
# Iniciar servidor de desenvolvimento
pnpm dev

# Build para produção
pnpm build

# Iniciar servidor de produção
pnpm start

# Verificar tipos
pnpm check

# Formatar código
pnpm format
```

### Estrutura de Planos

| Plano | Preço | Créditos | Recursos |
|-------|-------|----------|----------|
| **Grátis** | R$ 0 | 1/mês | Radar de Bio básico |
| **PRO** | R$ 67,00/mês | 10/mês | E-books, Prompts, Anúncios |
| **PRO+** | R$ 117,00/mês | Ilimitado | Todos os recursos + Suporte VIP |

---

## 📁 Estrutura do Projeto

```
elevare_ai_neurovendas/
├── client/                 # Frontend React
│   ├── src/
│   │   ├── pages/         # Páginas da aplicação
│   │   ├── components/    # Componentes reutilizáveis
│   │   ├── hooks/         # Custom hooks
│   │   └── lib/           # Utilitários
│   └── index.html
├── server/                # Backend Node.js
│   ├── _core/            # Core do servidor
│   ├── routers/          # Routers tRPC
│   │   ├── subscription.ts
│   │   ├── bioRadar.ts
│   │   └── content.ts
│   └── db.ts
├── drizzle/              # Schema e migrations
│   └── schema.ts
├── shared/               # Código compartilhado
└── package.json
```

---

## 🔌 API Reference

### Subscription Router

```typescript
// Obter planos disponíveis
trpc.subscription.getPlans.useQuery()

// Obter assinatura do usuário
trpc.subscription.getSubscription.useQuery()

// Criar checkout
trpc.subscription.createCheckout.useMutation({
  plan: "pro",
  successUrl: "/dashboard",
  cancelUrl: "/pricing"
})

// Cancelar assinatura
trpc.subscription.cancelSubscription.useMutation()
```

### BioRadar Router

```typescript
// Analisar bio
trpc.bioRadar.analyze.useMutation({
  instagramHandle: "usuario"
})

// Salvar lead
trpc.bioRadar.saveLead.useMutation({
  diagnosisId: 1,
  email: "email@example.com",
  whatsapp: "11999999999"
})
```

### Content Router

```typescript
// Gerar e-book
trpc.content.generateEbook.useMutation({
  topic: "Harmonização Facial",
  tone: "professional",
  chapters: 5
})

// Gerar prompt
trpc.content.generatePrompt.useMutation({
  description: "Clínica moderna",
  style: "professional",
  platform: "dalle"
})

// Gerar anúncio
trpc.content.generateAd.useMutation({
  product: "Botox",
  platform: "instagram",
  objective: "conversion"
})
```

---

## 🌐 Deploy

### Preparação

1. **Build do projeto**
```bash
pnpm build
```

2. **Configure variáveis de ambiente de produção**

3. **Configure o banco de dados**
```bash
pnpm db:push
```

### Plataformas Recomendadas

- **Frontend + Backend:** Vercel, Railway, Render
- **Database:** PlanetScale, Railway, AWS RDS
- **Storage:** AWS S3, Cloudflare R2

---

## 🎨 Customização

### Temas e Cores

As cores principais estão definidas em `client/src/index.css`:

- **Primary:** Amber/Orange (gradient)
- **Secondary:** Purple/Pink
- **Accent:** Blue/Cyan

### Branding

Atualize os seguintes arquivos:
- `client/public/favicon.ico`
- `client/index.html` (meta tags)
- Componentes com logo/marca

---

## 🐛 Troubleshooting

### Erro de conexão com banco de dados
- Verifique se o MySQL está rodando
- Confirme as credenciais no `.env`
- Execute `pnpm db:push` novamente

### Erro de autenticação OAuth
- Verifique `VITE_APP_ID` e `OAUTH_SERVER_URL`
- Confirme se o app está registrado no OAuth server

### Erro no Stripe
- Verifique as chaves no `.env`
- Confirme se os Price IDs estão corretos
- Teste com chaves de teste primeiro

---

## 📝 Roadmap

### Fase 1 ✅
- [x] Dashboard Principal
- [x] Autenticação OAuth
- [x] Radar de Bio
- [x] Sistema de Monetização (Stripe)

### Fase 2 ✅
- [x] Gerador de E-books
- [x] Robô Produtor (Prompts + Anúncios)

### Fase 3 (Próximas)
- [ ] Automação de Blogs
- [ ] RobôChat (Assistente IA)
- [ ] Analytics avançado
- [ ] Integração com plataformas de blog
- [ ] Text-to-Speech para audiobooks
- [ ] Export PDF de e-books

---

## 🤝 Contribuição

Contribuições são bem-vindas! Por favor:

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

---

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

---

## 👥 Autores

- **Elevare Team** - Inteligência de Vendas para Estética.

---

## 🙏 Agradecimentos

- Comunidade de profissionais de estética
- Carine Marques- Fisioterapeuta autante na Estética há mais de 20 anos.
- Contribuidores open source

---

**Elevare AI NeuroVendas** - Venda como ciência, não como esperança. 🚀
