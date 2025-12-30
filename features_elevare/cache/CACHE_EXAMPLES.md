# 💾 Exemplos de Uso do Sistema de Cache

## 📚 Casos de Uso Comuns

### 1. Cachear Dados de Usuário

```typescript
import { createNamespacedCache } from '../_core/cache';

const userCache = createNamespacedCache('user');

export const userRouter = router({
  getProfile: protectedProcedure
    .query(async ({ ctx }) => {
      const cacheKey = `profile:${ctx.user.id}`;
      
      // Tentar obter do cache
      return userCache.getOrSet(
        cacheKey,
        async () => {
          // Se não estiver no cache, buscar do banco
          return await db.user.findUnique({
            where: { id: ctx.user.id },
            include: { subscription: true },
          });
        },
        5 * 60 * 1000 // 5 minutos
      );
    }),
});
```

### 2. Cachear Resultados de IA (Prompts Repetidos)

```typescript
import { createNamespacedCache } from '../_core/cache';

const aiCache = createNamespacedCache('ai');

export const contentRouter = router({
  generateAd: protectedProcedure
    .input(z.object({ prompt: z.string() }))
    .mutation(async ({ input }) => {
      const cacheKey = `ad:${hashPrompt(input.prompt)}`;
      
      return aiCache.getOrSet(
        cacheKey,
        async () => {
          // Gerar com IA (operação cara)
          return await llm.generate(input.prompt);
        },
        60 * 60 * 1000 // 1 hora
      );
    }),
});

function hashPrompt(prompt: string): string {
  return crypto.createHash('md5').update(prompt).digest('hex');
}
```

### 3. Cachear Configurações do Sistema

```typescript
import { createNamespacedCache } from '../_core/cache';

const configCache = createNamespacedCache('config');

async function getSystemConfig() {
  return configCache.getOrSet(
    'system',
    async () => {
      return await db.config.findMany();
    },
    30 * 60 * 1000 // 30 minutos
  );
}
```

### 4. Cachear Dados de Assinatura

```typescript
import { createNamespacedCache } from '../_core/cache';

const subscriptionCache = createNamespacedCache('subscription');

export const subscriptionRouter = router({
  getCredits: protectedProcedure
    .query(async ({ ctx }) => {
      const cacheKey = `credits:${ctx.user.id}`;
      
      return subscriptionCache.getOrSet(
        cacheKey,
        async () => {
          return await db.subscription.findUnique({
            where: { userId: ctx.user.id },
            select: { credits: true, plan: true },
          });
        },
        2 * 60 * 1000 // 2 minutos
      );
    }),
  
  // Invalidar cache ao consumir créditos
  consumeCredit: protectedProcedure
    .mutation(async ({ ctx }) => {
      // Consumir crédito
      await db.subscription.update({
        where: { userId: ctx.user.id },
        data: { credits: { decrement: 1 } },
      });
      
      // Invalidar cache
      subscriptionCache.delete(`credits:${ctx.user.id}`);
      
      return { success: true };
    }),
});
```

### 5. Cachear Queries Pesadas de Analytics

```typescript
import { createNamespacedCache } from '../_core/cache';

const analyticsCache = createNamespacedCache('analytics');

export const analyticsRouter = router({
  getDashboardStats: protectedProcedure
    .query(async ({ ctx }) => {
      const cacheKey = `dashboard:${ctx.user.id}`;
      
      return analyticsCache.getOrSet(
        cacheKey,
        async () => {
          // Query pesada com múltiplos JOINs
          const [totalUsers, totalRevenue, activeSubscriptions] = await Promise.all([
            db.user.count(),
            db.payment.aggregate({ _sum: { amount: true } }),
            db.subscription.count({ where: { status: 'active' } }),
          ]);
          
          return { totalUsers, totalRevenue, activeSubscriptions };
        },
        10 * 60 * 1000 // 10 minutos
      );
    }),
});
```

### 6. Cachear Dados Públicos (Planos, Preços)

```typescript
import { createNamespacedCache } from '../_core/cache';

const publicCache = createNamespacedCache('public');

export const publicRouter = router({
  getPlans: publicProcedure
    .query(async () => {
      return publicCache.getOrSet(
        'plans',
        async () => {
          return [
            { name: 'Grátis', price: 0, credits: 10 },
            { name: 'PRO', price: 67, credits: 100 },
            { name: 'PRO+', price: 117, credits: -1 },
          ];
        },
        24 * 60 * 60 * 1000 // 24 horas
      );
    }),
});
```

### 7. Invalidação de Cache em Cascata

```typescript
import { createNamespacedCache } from '../_core/cache';

const userCache = createNamespacedCache('user');

export const userRouter = router({
  updateProfile: protectedProcedure
    .input(z.object({ name: z.string() }))
    .mutation(async ({ input, ctx }) => {
      // Atualizar no banco
      const updated = await db.user.update({
        where: { id: ctx.user.id },
        data: { name: input.name },
      });
      
      // Invalidar todos os caches relacionados ao usuário
      userCache.delete(`profile:${ctx.user.id}`);
      userCache.delete(`settings:${ctx.user.id}`);
      
      return updated;
    }),
});
```

### 8. Cache com Namespace Pattern

```typescript
import { cache } from '../_core/cache';

// Invalidar todos os caches de um usuário específico
function invalidateUserCache(userId: number) {
  cache.deletePattern(`user:.*:${userId}`);
}

// Invalidar todos os caches de IA
function invalidateAICache() {
  cache.deletePattern(`ai:.*`);
}

// Usar em webhook do Stripe
export async function handleSubscriptionUpdate(userId: number) {
  await db.subscription.update({
    where: { userId },
    data: { plan: 'PRO' },
  });
  
  // Invalidar todos os caches do usuário
  invalidateUserCache(userId);
}
```

### 9. Decorador @Cacheable (Experimental)

```typescript
import { Cacheable } from '../_core/cache';

class UserService {
  @Cacheable(5 * 60 * 1000) // 5 minutos
  async getUserById(id: number) {
    return await db.user.findUnique({ where: { id } });
  }
  
  @Cacheable(10 * 60 * 1000) // 10 minutos
  async getUserStats(id: number) {
    // Query pesada
    return await db.user.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            posts: true,
            comments: true,
            likes: true,
          },
        },
      },
    });
  }
}
```

### 10. Monitoramento de Cache (Admin)

```typescript
// Frontend - Admin Dashboard
import { trpc } from '@/lib/trpc';

function CacheMonitor() {
  const { data: stats } = trpc.cache.getStats.useQuery();
  const clearCache = trpc.cache.clear.useMutation();
  
  return (
    <div>
      <h2>Cache Statistics</h2>
      <p>Hits: {stats?.hits}</p>
      <p>Misses: {stats?.misses}</p>
      <p>Hit Rate: {stats?.hitRate}</p>
      <p>Size: {stats?.size} items</p>
      
      <button onClick={() => clearCache.mutate()}>
        Clear Cache
      </button>
    </div>
  );
}
```

---

## 🎯 Best Practices

### 1. TTL Apropriado

```typescript
// Dados que mudam raramente: TTL longo
const plans = await publicCache.getOrSet('plans', fetchPlans, 24 * 60 * 60 * 1000);

// Dados que mudam frequentemente: TTL curto
const credits = await userCache.getOrSet('credits', fetchCredits, 2 * 60 * 1000);

// Dados em tempo real: não cachear
const liveStats = await db.stats.findMany(); // Sem cache
```

### 2. Invalidação Proativa

```typescript
// Sempre invalidar cache após mutações
export const postRouter = router({
  create: protectedProcedure
    .input(z.object({ title: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const post = await db.post.create({
        data: { ...input, userId: ctx.user.id },
      });
      
      // Invalidar cache de posts do usuário
      cache.deletePattern(`posts:user:${ctx.user.id}`);
      
      return post;
    }),
});
```

### 3. Namespace Organizado

```typescript
// Usar namespaces consistentes
const userCache = createNamespacedCache('user');
const postCache = createNamespacedCache('post');
const aiCache = createNamespacedCache('ai');
const analyticsCache = createNamespacedCache('analytics');

// Chaves descritivas
userCache.set(`profile:${userId}`, data);
postCache.set(`list:${userId}:page:${page}`, data);
aiCache.set(`prompt:${hash}`, data);
```

### 4. Error Handling

```typescript
async function getCachedData(key: string) {
  try {
    return await cache.getOrSet(key, async () => {
      return await db.data.findMany();
    });
  } catch (error) {
    logger.error('Cache error, falling back to direct query', error);
    // Fallback: buscar diretamente sem cache
    return await db.data.findMany();
  }
}
```

### 5. Monitoramento

```typescript
// Log de cache misses para otimização
const data = cache.get('key');
if (!data) {
  logger.warn('Cache miss', { key: 'key' });
}

// Verificar hit rate periodicamente
setInterval(() => {
  const stats = cache.getStats();
  logger.info('Cache stats', stats);
  
  if (parseFloat(stats.hitRate) < 50) {
    logger.warn('Low cache hit rate', { hitRate: stats.hitRate });
  }
}, 60 * 60 * 1000); // A cada hora
```

---

## ⚠️ Quando NÃO Usar Cache

1. **Dados críticos em tempo real** (saldo bancário, estoque)
2. **Dados sensíveis** que mudam frequentemente
3. **Operações de escrita** (POST, PUT, DELETE)
4. **Dados únicos por usuário** com baixa reutilização
5. **Queries muito rápidas** (< 10ms) - overhead do cache pode ser maior

---

## 📊 Métricas de Sucesso

- **Hit Rate > 70%**: Excelente
- **Hit Rate 50-70%**: Bom
- **Hit Rate < 50%**: Revisar estratégia de cache

---

**Desenvolvido com ❤️ pela equipe Elevare AI**
