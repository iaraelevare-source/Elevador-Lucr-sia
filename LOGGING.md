# 📊 Sistema de Logging - Elevare AI

Sistema completo de logging estruturado com correlation ID tracking, performance monitoring e contexto de requests.

---

## 🚀 Features

- ✅ **Logs estruturados** com contexto rico
- ✅ **Correlation ID** para tracking de requests end-to-end
- ✅ **Performance monitoring** automático
- ✅ **Sanitização automática** de dados sensíveis
- ✅ **Formato JSON** em produção (fácil parsing)
- ✅ **Formato colorido** em desenvolvimento (fácil leitura)
- ✅ **Níveis de log configuráveis** (debug, info, warn, error)
- ✅ **Child loggers** com contexto herdado

---

## 📚 Uso Básico

### Logger Simples

```typescript
import { logger } from './logger';

// Log informativo
logger.info('User logged in', { userId: 123 });

// Log de erro
logger.error('Failed to fetch data', error);

// Log de warning
logger.warn('Rate limit approaching', { remaining: 5 });

// Log de debug (apenas em desenvolvimento)
logger.debug('Processing request', { data: {...} });
```

### Com Contexto

```typescript
// Definir contexto global
logger.setContext({ userId: 123, sessionId: 'abc' });

logger.info('Action performed'); // Inclui userId e sessionId

// Limpar contexto
logger.clearContext();
```

### Child Logger

```typescript
// Criar logger filho com contexto adicional
const userLogger = logger.child({ userId: 123, email: 'user@example.com' });

userLogger.info('Profile updated'); // Inclui userId e email
userLogger.error('Failed to save', error);
```

### Performance Tracking

```typescript
// Medir performance de operações assíncronas
const result = await logger.time('fetch-user-data', async () => {
  return await db.user.findUnique({ where: { id: 123 } });
});

// Log automático: "Performance: fetch-user-data (45ms)"
```

---

## 🌐 Request Logging

### Automático

Todas as requests HTTP são automaticamente logadas com:
- Correlation ID único
- Path e método
- IP e User-Agent
- Query params e body (sanitizado)
- Status code
- Duração da request

```
ℹ️ [INFO] Request started [a1b2c3d4] { query: {...}, body: {...} }
ℹ️ [INFO] Request completed [a1b2c3d4] { statusCode: 200, duration: "45ms" }
```

### Usar Logger da Request

```typescript
import { getRequestLogger } from './logging-middleware';

app.get('/api/users', (req, res) => {
  const logger = getRequestLogger(req);
  
  logger.info('Fetching users', { limit: 10 });
  
  // ... código ...
  
  logger.info('Users fetched successfully', { count: users.length });
});
```

### Correlation ID

O correlation ID é:
1. Gerado automaticamente para cada request
2. Retornado no header `X-Correlation-ID`
3. Propagado para todos os logs da request
4. Útil para debugging e tracing

```bash
# Cliente pode enviar correlation ID
curl -H "X-Correlation-ID: my-custom-id" https://api.elevare.ai/users
```

---

## 🎨 Formato dos Logs

### Desenvolvimento (Colorido)

```
🔍 [DEBUG] Processing data [a1b2c3d4] { items: 5 }
ℹ️ [INFO] User logged in [b2c3d4e5] { userId: 123 }
⚠️ [WARN] Cache miss [c3d4e5f6] { key: "user:123" }
❌ [ERROR] Database error [d4e5f6g7] { message: "Connection timeout" }
```

### Produção (JSON)

```json
{
  "level": "info",
  "message": "User logged in",
  "timestamp": "2025-01-26T10:30:45.123Z",
  "context": {
    "correlationId": "a1b2c3d4-e5f6-g7h8-i9j0-k1l2m3n4o5p6",
    "userId": 123,
    "requestPath": "/api/auth/login",
    "method": "POST",
    "ip": "192.168.1.1"
  },
  "meta": {
    "loginMethod": "oauth"
  }
}
```

---

## 🔐 Sanitização de Dados Sensíveis

O sistema **automaticamente remove** dados sensíveis dos logs:

- ❌ `password`
- ❌ `token`
- ❌ `secret`
- ❌ `apiKey` / `api_key`
- ❌ `authorization`
- ❌ `creditCard` / `credit_card`
- ❌ `cvv`
- ❌ `ssn`

```typescript
logger.info('User data', {
  email: 'user@example.com',
  password: '123456', // Será logado como [REDACTED]
  apiKey: 'sk_test_abc', // Será logado como [REDACTED]
});
```

---

## ⚙️ Configuração

### Variáveis de Ambiente

```bash
# Nível mínimo de log (debug, info, warn, error)
LOG_LEVEL=info

# Ambiente (afeta formato dos logs)
NODE_ENV=production
```

### Níveis de Log

| Nível | Descrição | Quando Usar |
|-------|-----------|-------------|
| `debug` | Informações detalhadas | Debugging, apenas em dev |
| `info` | Informações gerais | Eventos normais |
| `warn` | Avisos | Situações incomuns mas não críticas |
| `error` | Erros | Falhas que precisam atenção |

---

## 📊 Exemplos de Uso

### 1. Logging em Router tRPC

```typescript
import { logger } from '../_core/logger';

export const userRouter = router({
  getProfile: protectedProcedure
    .query(async ({ ctx }) => {
      const requestLogger = logger.child({
        userId: ctx.user.id,
        operation: 'getProfile',
      });
      
      requestLogger.info('Fetching user profile');
      
      try {
        const profile = await db.user.findUnique({
          where: { id: ctx.user.id },
        });
        
        requestLogger.info('Profile fetched successfully');
        return profile;
      } catch (error) {
        requestLogger.error('Failed to fetch profile', error);
        throw error;
      }
    }),
});
```

### 2. Performance Tracking em Operações Pesadas

```typescript
import { logger } from '../_core/logger';

async function generateEbook(userId: number, topic: string) {
  const userLogger = logger.child({ userId, operation: 'generateEbook' });
  
  userLogger.info('Starting ebook generation', { topic });
  
  // Medir performance de cada etapa
  const outline = await userLogger.time('generate-outline', async () => {
    return await llm.generateOutline(topic);
  });
  
  const content = await userLogger.time('generate-content', async () => {
    return await llm.generateContent(outline);
  });
  
  const pdf = await userLogger.time('render-pdf', async () => {
    return await pdfRenderer.render(content);
  });
  
  userLogger.info('Ebook generated successfully', {
    pages: pdf.pageCount,
    size: pdf.sizeInBytes,
  });
  
  return pdf;
}
```

### 3. Error Tracking com Contexto Rico

```typescript
import { logger } from '../_core/logger';

async function processPayment(userId: number, amount: number) {
  const paymentLogger = logger.child({
    userId,
    operation: 'processPayment',
    amount,
  });
  
  try {
    paymentLogger.info('Processing payment');
    
    const result = await stripe.charges.create({
      amount: amount * 100,
      currency: 'brl',
      customer: userId,
    });
    
    paymentLogger.info('Payment successful', {
      chargeId: result.id,
      status: result.status,
    });
    
    return result;
  } catch (error) {
    paymentLogger.error('Payment failed', error, {
      errorCode: error.code,
      errorType: error.type,
    });
    
    throw error;
  }
}
```

---

## 🔍 Debugging com Correlation ID

### Encontrar Todos os Logs de uma Request

```bash
# Em produção (logs JSON)
cat logs.json | jq 'select(.context.correlationId == "a1b2c3d4")'

# Em desenvolvimento (logs coloridos)
grep "a1b2c3d4" logs.txt
```

### Passar Correlation ID Entre Serviços

```typescript
// Serviço A
const correlationId = logger.generateCorrelationId();

await fetch('https://service-b.com/api', {
  headers: {
    'X-Correlation-ID': correlationId,
  },
});

// Serviço B recebe e usa o mesmo ID
// Todos os logs ficam conectados!
```

---

## 📈 Monitoramento em Produção

### Integração com Ferramentas Externas

```typescript
// TODO: Adicionar integração com Sentry
if (process.env.NODE_ENV === 'production') {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
  });
}

// No logger.error()
if (!this.isDevelopment && error) {
  Sentry.captureException(error, {
    extra: { message, context },
  });
}
```

### Parsing de Logs JSON

```bash
# Contar erros por tipo
cat logs.json | jq -r 'select(.level == "error") | .error.message' | sort | uniq -c

# Requests mais lentas
cat logs.json | jq -r 'select(.performance) | "\(.performance.duration) \(.message)"' | sort -n

# Top IPs
cat logs.json | jq -r '.context.ip' | sort | uniq -c | sort -nr | head -10
```

---

## 🎯 Best Practices

1. **Use child loggers** para operações com contexto específico
2. **Sempre logue erros** com contexto suficiente para debugging
3. **Use performance tracking** para operações críticas
4. **Não logue dados sensíveis** (o sistema sanitiza automaticamente, mas evite)
5. **Use níveis apropriados** (debug para detalhes, info para eventos, warn para anomalias, error para falhas)
6. **Inclua IDs relevantes** (userId, orderId, etc) no contexto
7. **Propague correlation IDs** entre serviços

---

## 🚀 Próximos Passos

- [ ] Integração com Sentry para error tracking
- [ ] Integração com LogRocket para session replay
- [ ] Dashboard de logs em tempo real
- [ ] Alertas automáticos para erros críticos
- [ ] Métricas agregadas (latência, taxa de erro, etc)

---

**Desenvolvido com ❤️ pela equipe Elevare AI**
