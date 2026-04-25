import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { Injectable, PLATFORM_ID, inject } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class StorageService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly document = inject(DOCUMENT);
  private readonly memory = new Map<string, string>();

  private get isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }

  private get browserStorage(): Storage | null {
    return this.document.defaultView?.localStorage ?? null;
  }

  getItem(key: string): string | null {
    if (this.isBrowser) return this.browserStorage?.getItem(key) ?? null;
    return this.memory.get(key) ?? null;
  }

  setItem(key: string, value: string): void {
    if (this.isBrowser) {
      this.browserStorage?.setItem(key, value);
      return;
    }
    this.memory.set(key, value);
  }

  remove(key: string): void {
    if (this.isBrowser) {
      this.browserStorage?.removeItem(key);
      return;
    }
    this.memory.delete(key);
  }

  getJson<T>(key: string): T | null {
    const raw = this.getItem(key);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as T;
    } catch {
      return null;
    }
  }

  setJson<T>(key: string, value: T): void {
    this.setItem(key, JSON.stringify(value));
  }
}

