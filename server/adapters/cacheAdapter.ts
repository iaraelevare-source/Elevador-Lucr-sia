// Adapter to wrap core cache and allow future swap

import * as core from "../_core/cache";

export const cache = core.cache;
export const createNamespacedCache = core.createNamespacedCache;
export const userCache = core.userCache;
export const aiCache = core.aiCache;
export const analyticsCache = core.analyticsCache;
export const contentCache = core.contentCache;
export const cached = core.cached;
