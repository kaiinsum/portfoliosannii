import { Component, computed, effect, inject, signal, OnDestroy, OnInit } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { Router, RouterLink } from '@angular/router';
import type { Project, PortfolioMode } from '../../../../core/models/portfolio.models';
import { ContentService } from '../../../../core/services/content.service';
import { PortfolioModeService } from '../../../../core/services/portfolio-mode.service';
import { DeviceDetectionService } from '../../../../core/services/device-detection.service';
import { filter } from 'rxjs';
import { NavigationEnd } from '@angular/router';

@Component({
  selector: 'app-projects-page',
  imports: [RouterLink],
  template: `
    <!-- Projects Header -->
    <section class="projects-header animate-on-scroll">
      <div class="container">
        <div class="text-center mb-5">
          <h1 class="display-5 fw-bold mb-3">My Projects</h1>
          <p class="lead text-secondary">{{ modeLabel() }} projects showcase</p>
          
          <!-- Theme Switch Button -->
          <div class="mt-4">
            <button class="btn-fancy" (click)="switchTheme()">
              Switch to {{ modeSvc.isDesign() ? 'Technical' : 'Creative' }} Theme
            </button>
          </div>
        </div>

        <!-- Search Bar -->
        <div class="row justify-content-center mb-4">
          <div class="col-12 col-lg-6">
            <div class="search-container">
              <input
                class="form-control search-input"
                placeholder="Search projects (title, description, tech)…"
                [value]="query()"
                (input)="onSearchInput($event)"
                (keyup.enter)="onSearchInput($event)"
              />
              @if (query().trim()) {
                <button class="search-clear" (click)="clearSearch()">×</button>
              }
              <div class="search-icon">🔍</div>
            </div>
          </div>
        </div>

        <!-- Sort Filter -->
        <div class="row justify-content-center mb-5">
          <div class="col-12 col-lg-6">
            <div class="sort-container">
              <label class="sort-label">Sort by:</label>
              <select class="form-select sort-select" (change)="sortOption.set(($any($event.target).value))">
                <option value="featured">Featured First</option>
                <option value="name">Name (A-Z)</option>
                <option value="name-desc">Name (Z-A)</option>
                <option value="year">Year (Newest)</option>
                <option value="year-desc">Year (Oldest)</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Projects Grid -->
    <section class="projects-grid-section">
      <div class="container">
        <div class="projects-grid">
          @for (p of filtered(); track p.id) {
            <div class="project-card-container animate-on-scroll">
              <a class="project-card" [routerLink]="['/projects', p.id]">
                <div class="project-image-container" 
                     [attr.data-slideshow-enabled]="animationSettings().enableImageSlideshow"
                     (mouseenter)="animationSettings().enableImageSlideshow ? startImageSlideshow(p.id, getAllImages(p)) : null"
                     (mouseleave)="animationSettings().enableImageSlideshow ? stopImageSlideshow(p.id) : null">
                  <img class="project-image" 
                       [src]="getCurrentImage(p.id, getAllImages(p))" 
                       [alt]="p.title" 
                       loading="lazy" />
                  
                  <!-- Image indicators -->
                  @if (getAllImages(p).length > 1) {
                    <div class="image-indicators">
                      @for (img of getAllImages(p); track $index) {
                        <div class="indicator" 
                             [class.active]="getCurrentImageIndex(p.id) === $index"></div>
                      }
                    </div>
                  }
                  
                  <div class="project-overlay">
                    <div class="project-overlay-content">
                      <span class="view-project">View Project →</span>
                    </div>
                  </div>
                  @if (p.featured) {
                    <div class="featured-badge">Featured</div>
                  }
                </div>
                <div class="project-content">
                  <h3 class="project-title">{{ p.title }}</h3>
                  @if (p.date) {
                    <div class="project-date">
                      <span class="year-badge">{{ getYear(p.date) }}</span>
                    </div>
                  }
                  <p class="project-description">{{ p.description }}</p>
                  <div class="project-tech">
                    @for (t of p.techStack; track t) {
                      <span class="tech-badge">{{ t }}</span>
                    }
                  </div>
                </div>
              </a>
            </div>
          }
        </div>

        @if (filtered().length === 0) {
          <div class="text-center py-5">
            <div class="no-results">
              <div class="no-results-icon">🔍</div>
              <h3>No projects found</h3>
              <p class="text-secondary">Try adjusting your search terms</p>
            </div>
          </div>
        }
      </div>
    </section>
  `,
  styleUrl: './projects.page.css',
})
export class ProjectsPage implements OnInit, OnDestroy {
  readonly modeSvc = inject(PortfolioModeService);
  private readonly content = inject(ContentService);
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);
  private readonly router = inject(Router);
  private readonly deviceDetection = inject(DeviceDetectionService);
  
  private routerSubscription: any;
  readonly animationSettings = computed(() => this.deviceDetection.getAnimationSettings());

  readonly modeLabel = computed(() => (this.modeSvc.isDesign() ? 'Creative Portfolio' : 'Technical Portfolio'));
  readonly projects = signal<Project[]>([]);
  readonly query = signal('');
  readonly sortOption = signal('featured');
  
  // Image slideshow state
  private slideshowIntervals = new Map<string, any>();
  private currentImageIndexes = new Map<string, number>();

  readonly filtered = computed(() => {
    const q = this.query().trim().toLowerCase();
    const sort = this.sortOption();
    let list = this.projects();
    
    // Apply sorting based on sortOption
    list = [...list].sort((a, b) => {
      switch (sort) {
        case 'featured':
          // Featured projects come first, then by date
          if (a.featured && !b.featured) return -1;
          if (!a.featured && b.featured) return 1;
          if (a.date && b.date) {
            return new Date(b.date).getTime() - new Date(a.date).getTime();
          }
          return 0;
          
        case 'name':
          // Sort by name A-Z
          return a.title.localeCompare(b.title);
          
        case 'name-desc':
          // Sort by name Z-A
          return b.title.localeCompare(a.title);
          
        case 'year':
          // Sort by year newest first
          if (a.date && b.date) {
            return new Date(b.date).getTime() - new Date(a.date).getTime();
          }
          if (a.date && !b.date) return -1;
          if (!a.date && b.date) return 1;
          return 0;
          
        case 'year-desc':
          // Sort by year oldest first
          if (a.date && b.date) {
            return new Date(a.date).getTime() - new Date(b.date).getTime();
          }
          if (a.date && !b.date) return -1;
          if (!a.date && b.date) return 1;
          return 0;
          
        default:
          return 0;
      }
    });
    
    if (!q) return list;
    return list.filter((p) => {
      const hay = `${p.title} ${p.description} ${(p.techStack || []).join(' ')}`.toLowerCase();
      return hay.includes(q);
    });
  });

  // Reactive data loading that responds to mode changes
  private readonly loadDataEffect = effect(() => {
    // This will automatically trigger when mode changes
    const currentMode = this.modeSvc.mode();
    console.log('ProjectsPage: Mode changed to:', currentMode);
    void this.loadData(currentMode);
  });

  // Ensure filtered computed property is reactive from the start
  private readonly filterEffect = effect(() => {
    // Access the filtered computed property to establish reactivity
    const filteredProjects = this.filtered();
    console.log('ProjectsPage: Filter updated, showing', filteredProjects.length, 'projects');
  });

  ngOnInit(): void {
    console.log('ProjectsPage: ngOnInit called');
    this.updatePageMetadata();
    
    // Listen to router events to detect when user navigates back to projects page
    this.routerSubscription = this.router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        // Check if we're navigating back to the projects page
        if (event.urlAfterRedirects === '/projects' || event.urlAfterRedirects.startsWith('/projects?')) {
          console.log('ProjectsPage: User navigated back to projects page, refreshing data');
          // Force data refresh when returning to projects page
          void this.loadData(this.modeSvc.mode());
        }
      });
  }

  ngOnDestroy(): void {
    console.log('ProjectsPage: ngOnDestroy called');
    // Clean up all intervals
    this.slideshowIntervals.forEach(interval => clearInterval(interval));
    this.slideshowIntervals.clear();
    
    // Clean up router subscription
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }
  }

  private updatePageMetadata(): void {
    const label = this.modeLabel();
    this.title.setTitle(`${label} — Projects`);
    this.meta.updateTag({ name: 'description', content: `Projects — ${label}` });
  }

  private async loadData(mode: PortfolioMode): Promise<void> {
    console.log('ProjectsPage: Loading data for mode:', mode);
    try {
      const data = await this.content.getModeContent(mode);
      console.log('ProjectsPage: Data loaded successfully:', data);
      this.projects.set(data.projects);
    } catch (error) {
      console.error('ProjectsPage: Failed to load projects:', error);
      // Set fallback projects
      this.projects.set([]);
    }
  }

  switchTheme(): void {
    // Toggle between Creative (light) and Technical (dark) modes
    this.modeSvc.toggle();
    
    // Reload page after a short delay to ensure theme change is applied
    // This single reload will handle the theme change without conflicts
    setTimeout(() => {
      window.location.reload();
    }, 200);
  }

  getYear(dateString: string): string {
    return new Date(dateString).getFullYear().toString();
  }

  onSearchInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    const newValue = target.value || '';
    console.log('ProjectsPage: Search input changed to:', newValue);
    this.query.set(newValue);
    
    // Force reactivity by accessing the filtered computed property
    const currentFiltered = this.filtered();
    console.log('ProjectsPage: Filtered projects count:', currentFiltered.length);
  }

  clearSearch(): void {
    this.query.set('');
  }

  startImageSlideshow(projectId: string, images: string[]): void {
    const settings = this.animationSettings();
    if (!settings.enableImageSlideshow || images.length <= 1) return;
    
    // Stop any existing slideshow for this project
    this.stopImageSlideshow(projectId);
    
    // Initialize current index if not exists
    if (!this.currentImageIndexes.has(projectId)) {
      this.currentImageIndexes.set(projectId, 0);
    }
    
    // Start slideshow with device-aware interval
    const interval = setInterval(() => {
      const currentIndex = this.currentImageIndexes.get(projectId) || 0;
      const nextIndex = (currentIndex + 1) % images.length;
      this.currentImageIndexes.set(projectId, nextIndex);
    }, settings.slideshowInterval);
    
    this.slideshowIntervals.set(projectId, interval);
  }

  stopImageSlideshow(projectId: string): void {
    const interval = this.slideshowIntervals.get(projectId);
    if (interval) {
      clearInterval(interval);
      this.slideshowIntervals.delete(projectId);
    }
  }

  getCurrentImage(projectId: string, images: string[]): string {
    const index = this.currentImageIndexes.get(projectId) || 0;
    return images[index] || images[0];
  }

  getCurrentImageIndex(projectId: string): number {
    return this.currentImageIndexes.get(projectId) || 0;
  }

  getAllImages(project: Project): string[] {
    if (project.images && project.images.length > 0) {
      return [project.image, ...project.images];
    }
    return [project.image];
  }
}

