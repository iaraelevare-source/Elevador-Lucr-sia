// Minimal smoke test for adapters (run with: pnpm tsx scripts/adapter-smoke.ts)
import { logger, child, forRequest } from "../server/adapters/loggingAdapter";
import { sendEmail, getEmailConfig, EmailOptions } from "../server/adapters/emailAdapter";
import { cache, createNamespacedCache } from "../server/adapters/cacheAdapter";

async function testLogging() {
  logger.debug("Adapter debug log", { env: process.env.NODE_ENV });
  logger.info("Adapter info log", { feature: process.env.USE_FEATURES_LOGGER });
  const reqLogger = forRequest({ method: "GET", path: "/health", ip: "127.0.0.1", headers: { "x-correlation-id": "smoke-123", "user-agent": "adapter-smoke" } });
  reqLogger.info("Request scoped log");
  const childLogger = child({ module: "smoke" });
  childLogger.warn("Child logger warn");
}

async function testEmail() {
  const cfg = getEmailConfig();
  logger.info("Email config", cfg as any);
  const opts: EmailOptions = {
    to: "dev@example.com",
    subject: "Adapter Smoke Test",
    html: "<strong>Hello from adapters</strong>",
    text: "Hello from adapters",
  } as any;
  const res = await sendEmail(opts);
  logger.info("Email send result", res as any);
}

async function testCache() {
  cache.set("smoke:key", { ok: true }, { ttl: 1000 });
  const value = cache.get<{ ok: boolean }>("smoke:key");
  logger.info("Cache get", { value });
  const ns = createNamespacedCache("general" as any);
  await ns.getOrSet("calc", async () => 42, 5000);
  logger.info("Namespaced cache hit", { exists: ns.get<number>("calc") });
}

async function main() {
  await testLogging();
  await testCache();
  await testEmail();
  logger.info("Adapter smoke test finished");
}

main().catch(err => {
  logger.error("Adapter smoke test failed", err);
  process.exit(1);
});
