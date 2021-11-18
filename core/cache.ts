import type { Cache, CacheTransactionCallback } from "../domain.ts";

class MemoryCache implements Cache {
  _cacheStore: Record<string, unknown> = {};
  _transactionQueue: Promise<void> = Promise.resolve();

  get<T>(key: string) {
    return Promise.resolve(this._cacheStore[key] as T);
  }

  put(key: string, value: unknown) {
    this._cacheStore[key] = value;
    return Promise.resolve();
  }
  async transaction(key: string, fn: CacheTransactionCallback) {
    this._transactionQueue = this._transactionQueue.then(() => fn(this, key));
    await this._transactionQueue;
  }
}

export { MemoryCache };
