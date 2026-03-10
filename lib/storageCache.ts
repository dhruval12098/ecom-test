type CacheEnvelope<T> = {
  data: T;
  expiresAt: number;
};

const PREFIX = "tulsi_cache:";

export function readCache<T>(key: string): T | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(PREFIX + key);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CacheEnvelope<T>;
    if (!parsed || typeof parsed.expiresAt !== "number") return null;
    if (Date.now() > parsed.expiresAt) {
      window.localStorage.removeItem(PREFIX + key);
      return null;
    }
    return parsed.data ?? null;
  } catch {
    return null;
  }
}

export function writeCache<T>(key: string, data: T, ttlMs: number) {
  if (typeof window === "undefined") return;
  try {
    const payload: CacheEnvelope<T> = {
      data,
      expiresAt: Date.now() + ttlMs
    };
    window.localStorage.setItem(PREFIX + key, JSON.stringify(payload));
  } catch {
    // ignore storage failures (quota, disabled, etc.)
  }
}

export function clearCache(key: string) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(PREFIX + key);
  } catch {
    // ignore
  }
}
