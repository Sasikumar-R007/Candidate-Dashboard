/** Short-lived in-memory cache for aggregate (non user-specific) read endpoints. */

const store = new Map<string, { expires: number; value: unknown }>();

export async function getCachedValue<T>(
  key: string,
  ttlMs: number,
  loader: () => Promise<T>,
): Promise<T> {
  const now = Date.now();
  const hit = store.get(key);
  if (hit && hit.expires > now) {
    return hit.value as T;
  }

  const value = await loader();
  store.set(key, { value, expires: now + ttlMs });
  return value;
}

export function invalidateCachedValue(key: string) {
  store.delete(key);
}
