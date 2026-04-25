import { Injectable, computed, inject, signal } from '@angular/core';
import { StorageService } from './storage.service';
import { environment } from '../../../environments/environment';

const TOKEN_KEY = 'admin.session.v1';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly storage = inject(StorageService);
  private readonly _token = signal<string | null>(this.storage.getItem(TOKEN_KEY));

  readonly isLoggedIn = computed(() => this._token() === '1');

  login(username: string, password: string): boolean {
    const ok = username === environment.admin.username && password === environment.admin.password;
    if (!ok) return false;
    this.storage.setItem(TOKEN_KEY, '1');
    this._token.set('1');
    return true;
  }

  logout(): void {
    this.storage.remove(TOKEN_KEY);
    this._token.set(null);
  }
}

