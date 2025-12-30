# FEATURES_ELEVARE Imported Modules

This folder contains features copied from `FEATURES_ELEVARE/FEATURES_PARA_COPIAR` for evaluation and integration into this workspace.

## Contents
- `logging/`: logging utilities and configurations
- `email/`: email client, templates, and send routines
- `cache/`: cache layer helpers

## Integration Plan (suggested)

### Logging
- Compare with existing logger at `server/lib/logger.ts` and `server/_core/logger.ts` (if present).
- Option A: Use imported logging as a drop-in by creating an adapter that exports the same interface consumed by the app.
- Option B: Merge missing capabilities (formatters, transports) into the current logger.

### Email
- Current email implementation is under `server/email`. Review differences in client and template handling.
- Decide on the canonical email client (e.g., nodemailer, Resend, or other), then:
  - Wire credentials through `server/_core/env.ts` and `.env`.
  - Expose a single `sendEmail()` in `server/email/index.ts` that calls into the chosen implementation.

### Cache
- There is cache logic in `server/_core/cache.ts` and endpoints in `server/routers/cache.ts`.
- If the imported cache adds features (namespacing, TTL, serialization), integrate via a small wrapper to avoid breaking existing callers.

## Steps to integrate safely
1. Create adapters that match current interfaces before swapping internals.
2. Add small unit tests around critical functions (logger init, email send, cache get/set).
3. Roll out changes behind a config flag; enable in staging first.
4. Monitor logs and error rates.

## Quick Test Commands
```bash
# Install deps
pnpm install

# Type-check and build
pnpm build

# Run dev server
pnpm dev
```