import { Component, EventEmitter, Input, Output } from '@angular/core';
import type { Project } from '../../../core/models/portfolio.models';

@Component({
  selector: 'app-project-detail-modal',
  template: `
    @if (open && project) {
      <div class="modal-backdrop-custom" (click)="close.emit()"></div>

      <div class="modal-custom" role="dialog" aria-modal="true">
        <div class="card border-0 shadow-lg">
          <div class="card-body p-4">
            <div class="d-flex justify-content-between gap-3 align-items-start">
              <div>
                <h3 class="h5 mb-1">{{ project.title }}</h3>
                <div class="small text-secondary">
                  @for (t of project.techStack; track t) {
                    <span class="me-2">{{ t }}</span>
                  }
                </div>
              </div>
              <button type="button" class="btn btn-sm btn-outline-secondary" (click)="close.emit()">Close</button>
            </div>

            <img class="w-100 rounded mt-3" [src]="project.image" [alt]="project.title" loading="lazy" />

            <p class="mt-3 mb-3 text-secondary">{{ project.description }}</p>

            <div class="d-flex flex-wrap gap-2">
              @for (l of project.links; track l.url) {
                <a class="btn btn-sm btn-primary" [href]="l.url" target="_blank" rel="noreferrer">
                  {{ l.label }}
                </a>
              }
            </div>
          </div>
        </div>
      </div>
    }
  `,
  styleUrl: './project-detail-modal.component.css',
})
export class ProjectDetailModalComponent {
  @Input({ required: true }) open = false;
  @Input() project: Project | null = null;
  @Output() close = new EventEmitter<void>();
}

