import type { Cache, CacheTransactionCallback } from "../domain.ts";
import { path } from "../deps.ts";

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

class FileCache implements Cache {
  _transactionQueue: Promise<void> = Promise.resolve();

  async get<T>(key: string) {
    try {
      const fileContents = await Deno.readTextFile(`.cache/${key}`);
      if (!fileContents) return undefined;
      return JSON.parse(fileContents) as T;
    } catch (_ex) {
      return undefined;
    }
  }

  async put(key: string, value: unknown) {
    await Deno.mkdir(path.dirname(`.cache/${key}`), { recursive: true });
    await Deno.writeTextFile(`.cache/${key}`, JSON.stringify(value, null, 2));
  }

  async transaction(key: string, fn: CacheTransactionCallback) {
    this._transactionQueue = this._transactionQueue.then(() => fn(this, key));
    await this._transactionQueue;
  }
}

export { FileCache, MemoryCache };
