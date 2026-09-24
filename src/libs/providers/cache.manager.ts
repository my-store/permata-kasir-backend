import { CACHE_MANAGER, Cache } from "@nestjs/cache-manager";
import { Inject, Injectable } from "@nestjs/common";

@Injectable()
export class CacheManagerProvider {
    constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

    async set(key: string, value: any, ttl?: number): Promise<void> {
        await this.cacheManager.set(key, value, ttl);
    }

    async get<T>(key: string): Promise<T | undefined> {
        return this.cacheManager.get<T>(key);
    }

    async delete(key: string): Promise<boolean> {
        return this.cacheManager.del(key);
    }

    deleteAfter(key: string, ms: number): NodeJS.Timeout {
        return setTimeout(() => this.delete(key), ms);
    }
}
