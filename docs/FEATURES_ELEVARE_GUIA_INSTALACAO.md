# 📋 GUIA DE INSTALAÇÃO MANUAL DAS FEATURES

Este guia te ajuda a instalar manualmente as 3 features implementadas no seu projeto local.

---

## 📦 O Que Você Tem Aqui

```
FEATURES_PARA_COPIAR/
├── email/                    # Sistema de Emails
│   ├── client.ts
│   ├── templates/
│   │   └── index.ts
│   ├── README.md
│   └── email.ts (router)
│
├── logging/                  # Sistema de Logging
│   ├── logger.ts
│   ├── logging-middleware.ts
│   └── LOGGING.md
│
├── cache/                    # Sistema de Cache
│   ├── cache.ts
│   ├── cache.ts (router)
│   └── CACHE_EXAMPLES.md
│
└── GUIA_INSTALACAO.md (este arquivo)
```

---

## 🚀 PASSO A PASSO DE INSTALAÇÃO

### 1️⃣ Sistema de Emails

```bash
# No diretório raiz do seu projeto:

# Criar diretório se não existir
mkdir -p server/email/templates

# Copiar arquivos
cp email/client.ts server/email/
cp email/templates/index.ts server/email/templates/
cp email/README.md server/email/
cp email/email.ts server/routers/
```

**Depois, edite `server/routers.ts` e adicione:**

```typescript
import { emailRouter } from './routers/email';

// ... dentro do appRouter:
export const appRouter = router({
  // ... outros routers
  email: emailRouter,  // ← ADICIONE ESTA LINHA
});
```

**Adicione no `.env.example`:**

```bash
# Email Configuration
SENDGRID_API_KEY=
RESEND_API_KEY=
EMAIL_FROM=noreply@seudominio.com
EMAIL_FROM_NAME=Seu App
```

---

### 2️⃣ Sistema de Logging

```bash
# Copiar arquivos
cp logging/logger.ts server/_core/
cp logging/logging-middleware.ts server/_core/
cp logging/LOGGING.md server/_core/
```

**Depois, edite `server/_core/index.ts` e adicione:**

```typescript
import { loggingMiddleware, errorLoggingMiddleware } from './_core/logging-middleware';

// ... depois de app.use(cors(...))
app.use(loggingMiddleware);  // ← ADICIONE ESTA LINHA

// ... antes de servir arquivos estáticos
app.use(errorLoggingMiddleware);  // ← ADICIONE ESTA LINHA
```

---

### 3️⃣ Sistema de Cache

```bash
# Copiar arquivos
cp cache/cache.ts server/_core/
cp cache/cache.ts server/routers/  # Renomeie para cache-router.ts se necessário
cp cache/CACHE_EXAMPLES.md server/_core/
```

**Depois, edite `server/routers.ts` e adicione:**

```typescript
import { cacheRouter } from './routers/cache';

// ... dentro do appRouter:
export const appRouter = router({
  // ... outros routers
  cache: cacheRouter,  // ← ADICIONE ESTA LINHA
});
```

---

## 🔧 Instalação Completa (Todos de Uma Vez)

Se preferir instalar tudo de uma vez:

```bash
# No diretório raiz do seu projeto:

# Sistema de Emails
mkdir -p server/email/templates
cp email/client.ts server/email/
cp email/templates/index.ts server/email/templates/
cp email/README.md server/email/
cp email/email.ts server/routers/

# Sistema de Logging
cp logging/logger.ts server/_core/
cp logging/logging-middleware.ts server/_core/
cp logging/LOGGING.md server/_core/

# Sistema de Cache
cp cache/cache.ts server/_core/
cp cache/cache.ts server/routers/cache.ts
cp cache/CACHE_EXAMPLES.md server/_core/
```

**Depois, edite manualmente:**

1. `server/routers.ts` - adicione emailRouter e cacheRouter
2. `server/_core/index.ts` - adicione logging middlewares
3. `.env.example` - adicione variáveis de email

---

## ✅ Verificação

Após instalar tudo, verifique se os arquivos existem:

```bash
# Sistema de Emails
ls -la server/email/
ls -la server/routers/email.ts

# Sistema de Logging
ls -la server/_core/logger.ts
ls -la server/_core/logging-middleware.ts

# Sistema de Cache
ls -la server/_core/cache.ts
ls -la server/routers/cache.ts
```

---

## 🧪 Teste

```bash
# Compilar
npm run build

# Iniciar servidor
npm start
```

Se tudo estiver correto, você verá logs coloridos no console! 🎉

---

## 📚 Documentação

Cada feature tem sua própria documentação:

- **Emails**: `server/email/README.md`
- **Logging**: `server/_core/LOGGING.md`
- **Cache**: `server/_core/CACHE_EXAMPLES.md`

---

## 🆘 Problemas?

Se encontrar erros:

1. **Erro de import**: Verifique se os caminhos estão corretos
2. **Erro de tipo**: Execute `npm run build` para ver detalhes
3. **Erro de runtime**: Verifique se adicionou os middlewares corretamente

---

## 💡 Dicas

- Instale uma feature por vez e teste
- Leia a documentação de cada feature
- Use `npm run build` para verificar erros de TypeScript
- Comece pelo sistema de logging (facilita debug)

---

**Boa sorte! 🚀**
