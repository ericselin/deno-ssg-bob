import type { Cache, CacheTransactionCallback } from "../domain.ts";
import { path } from "../deps.ts";

class MemoryCache implements Cache {
  /** @private */
  _cacheStore: Record<string, unknown> = {};

  get<T>(key: string) {
    return Promise.resolve(this._cacheStore[key] as T);
  }

  put(key: string, value: unknown) {
    this._cacheStore[key] = value;
    return Promise.resolve();
  }

  delete(key: string) {
    delete this._cacheStore[key];
    return Promise.resolve();
  }

  deleteFrom(key: string, property: string) {
    const cacheEntry = this._cacheStore[key];
    if (typeof cacheEntry === "object") {
      delete (cacheEntry as Record<string, unknown>)[property];
    }
    return Promise.resolve();
  }

  add(key: string, value: Record<string, unknown>) {
    if (typeof this._cacheStore[key] === "undefined") {
      this._cacheStore[key] = {};
    }
    const cacheEntry = this._cacheStore[key];
    if (
      cacheEntry && typeof cacheEntry === "object" &&
      cacheEntry.constructor === Object
    ) {
      this._cacheStore[key] = Object.assign(cacheEntry, value);
      return Promise.resolve();
    }
    throw new Error(`Cache at key ${key} is not an array - cannot add`);
  }
}

class FileCache implements Cache {
  /** @private */
  _transactionQueue: Promise<void> = Promise.resolve();
  /** @private */
  _cacheDir: string;

  constructor(cacheDir = ".cache") {
    this._cacheDir = cacheDir;
  }

  async get<T>(key: string) {
    try {
      const fileContents = await Deno.readTextFile(
        path.join(this._cacheDir, key),
      );
      if (!fileContents) return undefined;
      return JSON.parse(fileContents) as T;
    } catch (_ex) {
      return undefined;
    }
  }

  async put(key: string, value: unknown) {
    await Deno.mkdir(path.join(this._cacheDir, path.dirname(key)), {
      recursive: true,
    });
    await Deno.writeTextFile(
      path.join(this._cacheDir, key),
      JSON.stringify(value, null, 2),
    );
  }

  async add(key: string, value: Record<string, unknown>) {
    await this._transaction(
      key,
      async (cache, key) => {
        const cacheEntry = await cache.get(key);
        if (!cacheEntry) {
          await cache.put(key, value);
          return;
        }
        if (
          typeof cacheEntry === "object" &&
          cacheEntry.constructor === Object
        ) {
          await cache.put(key, Object.assign(cacheEntry, value));
          return;
        }
        throw new Error(`Cache entry at ${key} is not in the correct format`);
      },
    );
  }

  async delete(key: string) {
    await Deno.remove(path.join(this._cacheDir, key));
  }

  async deleteFrom(key: string, property: string) {
    await this._transaction(
      key,
      async (cache, key) => {
        const cacheEntry = await cache.get<Record<string, unknown>>(key);
        if (typeof cacheEntry === "object") {
          delete cacheEntry[property];
          await cache.put(key, cacheEntry);
        }
      },
    );
  }

  /** @private */
  async _transaction(key: string, fn: CacheTransactionCallback) {
    this._transactionQueue = this._transactionQueue.then(() => fn(this, key));
    await this._transactionQueue;
  }
}

export { FileCache, MemoryCache };
