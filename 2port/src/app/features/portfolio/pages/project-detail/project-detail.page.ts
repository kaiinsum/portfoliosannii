import { Component, computed, effect, inject, signal } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import type { Project } from '../../../../core/models/portfolio.models';
import { ContentService } from '../../../../core/services/content.service';
import { PortfolioModeService } from '../../../../core/services/portfolio-mode.service';

@Component({
  selector: 'app-project-detail-page',
  imports: [RouterLink],
  template: `
    <div class="d-flex align-items-center justify-content-between gap-3 mb-3">
      <div>
        <h1 class="h4 mb-1">{{ project()?.title || 'Project' }}</h1>
        <div class="small text-secondary">{{ modeLabel() }}</div>
      </div>
      <div class="d-flex gap-2">
        @if (previousProject()) {
          <a class="btn btn-sm btn-outline-secondary" (click)="navigateToProject(previousProject()!.id)" title="Previous Project">
            ← Previous
          </a>
        }
        @if (nextProject()) {
          <a class="btn btn-sm btn-outline-secondary" (click)="navigateToProject(nextProject()!.id)" title="Next Project">
            Next →
          </a>
        }
        <a class="btn btn-sm btn-outline-secondary" routerLink="/projects">Back to Projects</a>
      </div>
    </div>

    @if (!project()) {
      <div class="alert alert-warning">Project not found.</div>
    } @else {
      <div class="card border-0 shadow-sm">
        <div class="card-body p-4">
          <!-- Enhanced Image Gallery -->
          <div class="project-gallery mb-4">
            @if (getAllImages().length > 1) {
              <div class="enhanced-gallery">
                <!-- Main Image with Navigation -->
                <div class="main-image-container">
                  <button class="nav-btn nav-prev" (click)="previousImage()" [disabled]="currentImageIndex() === 0">
                    <span class="nav-icon">‹</span>
                  </button>
                  
                  <div class="main-image-wrapper">
                    <img class="main-image" [src]="getCurrentImage()" [alt]="project()!.title" loading="lazy" />
                    <div class="image-counter">{{ currentImageIndex() + 1 }} / {{ getAllImages().length }}</div>
                  </div>
                  
                  <button class="nav-btn nav-next" (click)="nextImage()" [disabled]="currentImageIndex() === getAllImages().length - 1">
                    <span class="nav-icon">›</span>
                  </button>
                </div>

                <!-- Sub-images Gallery -->
                <div class="sub-images-section">
                  <h4 class="sub-images-title">Project Gallery</h4>
                  <div class="sub-images-grid">
                    @for (img of getAllImages(); track $index) {
                      <div 
                        class="sub-image-item" 
                        [class.active]="currentImageIndex() === $index"
                        (click)="setCurrentImage($index)"
                      >
                        <img 
                          class="sub-image" 
                          [src]="img" 
                          [alt]="'Project image ' + ($index + 1)"
                          loading="lazy"
                        />
                        <div class="sub-image-overlay">
                          <span class="sub-image-number">{{ $index + 1 }}</span>
                        </div>
                      </div>
                    }
                  </div>
                </div>
              </div>
            } @else {
              <div class="single-image-container">
                <img class="w-100 rounded mb-3" [src]="project()!.image" [alt]="project()!.title" loading="lazy" />
              </div>
            }
          </div>

          <p class="text-secondary mb-3">{{ project()!.description }}</p>

          <div class="mb-3">
            <div class="text-secondary small mb-2">Tech stack</div>
            <div class="d-flex flex-wrap gap-2">
              @for (t of project()!.techStack; track t) {
                <span class="badge rounded-pill text-bg-secondary">{{ t }}</span>
              }
            </div>
          </div>

          <div class="d-flex flex-wrap gap-2">
            @for (l of project()!.links; track l.url) {
              <a class="btn btn-sm btn-primary" [href]="l.url" target="_blank" rel="noreferrer">{{ l.label }}</a>
            }
          </div>
        </div>
      </div>
    }
  `,
})
export class ProjectDetailPage {
  private readonly modeSvc = inject(PortfolioModeService);
  private readonly content = inject(ContentService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);

  readonly modeLabel = computed(() => (this.modeSvc.isDesign() ? 'Design Portfolio' : 'Technical Portfolio'));
  readonly project = signal<Project | null>(null);
  readonly allProjects = signal<Project[]>([]);
  readonly currentImageIndex = signal(0);

  readonly previousProject = computed(() => {
    const projects = this.allProjects();
    const current = this.project();
    if (!current || !projects.length) return null;
    
    const currentIndex = projects.findIndex(p => p.id === current.id);
    return currentIndex > 0 ? projects[currentIndex - 1] : null;
  });

  readonly nextProject = computed(() => {
    const projects = this.allProjects();
    const current = this.project();
    if (!current || !projects.length) return null;
    
    const currentIndex = projects.findIndex(p => p.id === current.id);
    return currentIndex < projects.length - 1 ? projects[currentIndex + 1] : null;
  });

  constructor() {
    effect(() => {
      const id = this.route.snapshot.paramMap.get('id');
      void this.load(id);
    });
  }

  private async load(id: string | null): Promise<void> {
    if (!id) {
      this.project.set(null);
      this.allProjects.set([]);
      return;
    }

    const data = await this.content.getModeContent(this.modeSvc.mode());
    const projects = data.projects;
    const p = projects.find((x) => x.id === id) ?? null;
    
    this.project.set(p);
    this.allProjects.set(projects);
    this.currentImageIndex.set(0); // Reset image index when loading new project

    const label = this.modeLabel();
    const pageTitle = p ? `${p.title} — ${label}` : `Project — ${label}`;
    this.title.setTitle(pageTitle);
    this.meta.updateTag({ name: 'description', content: p ? p.description : `Project detail — ${label}` });
  }

  getAllImages(): string[] {
    const project = this.project();
    if (!project) return [];
    
    if (project.images && project.images.length > 0) {
      return [project.image, ...project.images];
    }
    return [project.image];
  }

  getCurrentImage(): string {
    const images = this.getAllImages();
    const index = this.currentImageIndex();
    return images[index] || images[0] || '';
  }

  setCurrentImage(index: number): void {
    const images = this.getAllImages();
    if (index >= 0 && index < images.length) {
      this.currentImageIndex.set(index);
    }
  }

  previousImage(): void {
    const currentIndex = this.currentImageIndex();
    if (currentIndex > 0) {
      this.currentImageIndex.set(currentIndex - 1);
    }
  }

  nextImage(): void {
    const currentIndex = this.currentImageIndex();
    const images = this.getAllImages();
    if (currentIndex < images.length - 1) {
      this.currentImageIndex.set(currentIndex + 1);
    }
  }

  navigateToProject(projectId: string): void {
    // Navigate to the project and then reload
    this.router.navigate(['/projects', projectId]).then(() => {
      setTimeout(() => {
        window.location.reload();
      }, 500);
    });
  }
}

