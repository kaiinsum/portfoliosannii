import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { Injectable, PLATFORM_ID, computed, effect, inject, signal } from '@angular/core';
import type { PortfolioMode } from '../models/portfolio.models';
import { StorageService } from './storage.service';

const STORAGE_KEY = 'portfolio.mode';

@Injectable({ providedIn: 'root' })
export class PortfolioModeService {
  private readonly _mode = signal<PortfolioMode>('design');
  readonly mode = this._mode.asReadonly();

  readonly isDesign = computed(() => this._mode() === 'design');
  readonly isTechnical = computed(() => this._mode() === 'technical');

  private readonly platformId = inject(PLATFORM_ID);
  private readonly storage = inject(StorageService);
  private readonly document = inject(DOCUMENT);

  constructor() {
    const saved = (this.storage.getItem(STORAGE_KEY) as PortfolioMode | null) ?? null;
    if (saved === 'design' || saved === 'technical') {
      this._mode.set(saved);
    } else {
      // Default to technical (dark theme)
      this._mode.set('technical');
    }

    effect(() => {
      // SSR-safe: browser-only side effects.
      if (!isPlatformBrowser(this.platformId)) return;
      this.storage.setItem(STORAGE_KEY, this._mode());
      this.document.documentElement.dataset['theme'] = this._mode() === 'technical' ? 'dark' : 'light';
    });
  }

  toggle(): void {
    this._mode.update((m) => (m === 'design' ? 'technical' : 'design'));
  }

  setMode(mode: PortfolioMode): void {
    this._mode.set(mode);
  }
}

