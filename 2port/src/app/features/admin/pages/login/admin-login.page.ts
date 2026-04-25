import { Component, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-admin-login-page',
  imports: [ReactiveFormsModule],
  template: `
    <div class="container py-5" style="max-width: 520px;">
      <div class="card border-0 shadow-sm">
        <div class="card-body p-4">
          <h1 class="h4 mb-1">Admin login</h1>
          <p class="text-secondary mb-4">
            Credentials are in <code>mk.txt</code> (and mirrored in
            <code>src/environments/environment.ts</code>).
          </p>

          @if (error()) {
            <div class="alert alert-danger py-2" role="alert">{{ error() }}</div>
          }

          <form [formGroup]="form" (ngSubmit)="submit()">
            <div class="mb-3">
              <label class="form-label">Username</label>
              <input class="form-control" formControlName="username" autocomplete="username" />
            </div>

            <div class="mb-3">
              <label class="form-label">Password</label>
              <input
                class="form-control"
                type="password"
                formControlName="password"
                autocomplete="current-password"
              />
            </div>

            <button class="btn btn-primary w-100" type="submit" [disabled]="form.invalid">Login</button>
          </form>
        </div>
      </div>
    </div>
  `,
})
export class AdminLoginPage {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly title = inject(Title);

  readonly error = signal<string | null>(null);

  readonly form = new FormGroup({
    username: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    password: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
  });

  constructor() {
    this.title.setTitle('Admin login');
  }

  submit(): void {
    this.error.set(null);
    const { username, password } = this.form.getRawValue();
    const ok = this.auth.login(username, password);
    if (!ok) {
      this.error.set('Invalid credentials.');
      return;
    }
    void this.router.navigateByUrl('/admin');
  }
}

