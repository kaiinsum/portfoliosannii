import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'app-not-found-page',
  imports: [RouterLink],
  template: `
    <div class="container py-5">
      <h1 class="display-6 mb-2">Page not found</h1>
      <p class="text-secondary mb-4">The page you’re looking for doesn’t exist.</p>
      <a class="btn btn-primary" routerLink="/">Go home</a>
    </div>
  `,
})
export class NotFoundPage {
  private readonly title = inject(Title);

  constructor() {
    this.title.setTitle('Not found');
  }
}

