import { Component, computed, effect, inject, signal, OnInit, OnDestroy } from '@angular/core';
import { Title, Meta } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { PortfolioModeService } from '../../../../core/services/portfolio-mode.service';
import { ContentService } from '../../../../core/services/content.service';
import type { AboutContent, PortfolioMode, FeatureItem } from '../../../../core/models/portfolio.models';

@Component({
  selector: 'app-about-page',
  template: `
    <!-- Hero Section -->
    <section class="hero-section animate-on-scroll">
      <div class="container">
        <div class="row justify-content-center">
          <div class="col-12 col-lg-10 text-center">
            <div class="d-flex justify-content-center mb-4">
              <img
                class="rounded-circle hero-avatar"
                [src]="about()?.avatar || 'asset_main/avatar/avatar.png'"
                alt="Avatar"
                width="120"
                height="120"
                loading="lazy"
              />
            </div>
            <h1 class="hero-title">{{ about()?.heading || 'Welcome to My Portfolio' }}</h1>
            <p class="hero-subtitle">{{ about()?.intro || 'Creating amazing digital experiences with passion and precision' }}</p>
            <div class="d-flex flex-wrap justify-content-center gap-3 mb-5">
              <a href="/projects" (click)="navigateToProjects()" class="hero-cta">View My Work</a>
              <a href="https://www.facebook.com/sanniidepranxis1971/" target="_blank" class="btn btn-outline-secondary btn-lg d-flex align-items-center">Get In Touch</a>
            </div>
            
            <!-- Theme Switch Section -->
            <section class="theme-switch-section mb-5">
              <div class="text-center">
                <br>
                <br>
                <br>
                <br>
                <h2 class="display-5 fw-bold mb-3">
                  @if (isDarkTheme()) {
                    Want to know about my <span class="highlight-text">Creative version</span>?
                  } @else {
                    Want to know about my <span class="highlight-text">Technical version</span>?
                  }
                </h2>
                <p class="lead text-secondary mb-4">Switch between different portfolio experiences</p>
                <button class="btn-fancy" (click)="switchTheme()">
                  Click here
                </button>
              </div>
            </section>
          </div>
        </div>
      </div>
    </section>

    <!-- Features Section -->
    <section class="features-section" id="features">
      <div class="container">
        <div class="text-center mb-5">
          <h2 class="display-5 fw-bold mb-3">What I Do</h2>
          <p class="lead text-secondary">Specialized skills to bring your ideas to life</p>
        </div>
        <div class="features-grid">
          @for (feature of (about()?.features || currentFeatures()); track feature.id) {
            @if (feature.link) {
              <a [href]="feature.link" target="_blank" class="feature-card animate-on-scroll feature-link">
                <div class="feature-icon">{{ feature.icon }}</div>
                <h3 class="feature-title">{{ feature.title }}</h3>
                <p class="feature-description">{{ feature.description }}</p>
                <div class="feature-link-indicator">→</div>
              </a>
            } @else {
              <div class="feature-card animate-on-scroll">
                <div class="feature-icon">{{ feature.icon }}</div>
                <h3 class="feature-title">{{ feature.title }}</h3>
                <p class="feature-description">{{ feature.description }}</p>
              </div>
            }
          }
        </div>
      </div>
    </section>

    <!-- Skills Section -->
    <section class="skills-section py-5 animate-on-scroll">
      <div class="container">
        <div class="card border-0 shadow-sm">
          <div class="card-body p-5">
            <h2 class="h3 text-center mb-4">Technical Skills</h2>
            <div class="d-flex flex-wrap gap-2 justify-content-center">
              @for (tag of (about()?.tags || []); track tag) {
                <span class="badge rounded-pill text-bg-secondary fs-6 px-3 py-2">{{ tag }}</span>
              }
            </div>
          </div>
        </div>
      </div>
    </section>
  `,
})
export class AboutPage implements OnInit, OnDestroy {
  private readonly modeSvc = inject(PortfolioModeService);
  private readonly content = inject(ContentService);
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);
  private readonly router = inject(Router);

  readonly modeLabel = computed(() => (this.modeSvc.isDesign() ? 'Creative Portfolio' : 'Technical Portfolio'));
  readonly about = signal<AboutContent | null>(null);
  readonly currentFeatures = computed(() => this.getDefaultFeatures());
  readonly isDarkTheme = computed(() => {
    return this.modeSvc.isTechnical(); // Technical mode = dark theme
  });
  
  // Reactive data loading that responds to mode changes
  private readonly loadDataEffect = effect(() => {
    // This will automatically trigger when mode changes
    const currentMode = this.modeSvc.mode();
    console.log('AboutPage: Mode changed to:', currentMode);
    void this.loadData(currentMode);
  });

  // Effect to trigger features update when theme changes
  private readonly themeChangeEffect = effect(() => {
    // This will trigger when the computed currentFeatures is accessed
    // and the theme has changed
    this.currentFeatures();
  });

  ngOnInit(): void {
    console.log('AboutPage: ngOnInit called');
    this.updatePageMetadata();
  }

  ngOnDestroy(): void {
    console.log('AboutPage: ngOnDestroy called');
    // Cleanup is handled automatically by Angular's effect cleanup
  }

  private updatePageMetadata(): void {
    const label = this.modeLabel();
    this.title.setTitle(`${label} — About`);
    this.meta.updateTag({ name: 'description', content: `About — ${label}` });
  }

  private async loadData(mode: PortfolioMode): Promise<void> {
    console.log('AboutPage: Loading data for mode:', mode);
    try {
      const data = await this.content.getModeContent(mode);
      console.log('AboutPage: Data loaded successfully:', data);
      this.about.set(data.about);
    } catch (error) {
      console.error('AboutPage: Failed to load about content:', error);
      // Set fallback content
      this.about.set({
        heading: 'Welcome to My Portfolio',
        intro: 'Creating amazing digital experiences with passion and precision',
        tags: ['Web Development', 'UI/UX Design', 'Performance Optimization'],
        avatar: 'asset_main/avatar/avatar.png'
      });
    }
  }

  getDefaultFeatures(): FeatureItem[] {
    const isDarkTheme = this.isDarkTheme();
    
    if (isDarkTheme) {
      // Dark theme features
      return [
        {
          id: 'web-dev',
          icon: '💻',
          title: 'Web Development',
          description: 'Building responsive, modern web applications with cutting-edge technologies'
        },
        {
          id: 'ai-engineer',
          icon: '🤖',
          title: 'AI Agent Engineer',
          description: 'Designing and developing intelligent AI agents for automated solutions'
        },
        {
          id: 'business-analysis',
          icon: '📊',
          title: 'Business Analysis',
          description: 'Analyzing business requirements and providing strategic technical solutions'
        }
      ];
    } else {
      // Light theme features
      return [
        {
          id: 'content-creating',
          icon: '✍️',
          title: 'Content Creating',
          description: 'Producing engaging and creative content for various platforms and audiences'
        },
        {
          id: 'marketing',
          icon: '📢',
          title: 'Marketing',
          description: 'Developing effective marketing strategies and campaigns for brand growth'
        },
        {
          id: 'video-editing',
          icon: '🎬',
          title: 'Video Editing',
          description: 'Creating compelling video content with professional editing techniques'
        }
      ];
    }
  }

  navigateToProjects(): void {
    // Navigate to projects and then reload
    this.router.navigate(['/projects']).then(() => {
      setTimeout(() => {
        window.location.reload();
      }, 500);
    });
  }

  switchTheme(): void {
    // Toggle between Creative (light) and Technical (dark) modes
    this.modeSvc.toggle();
    
    // No reload needed - theme changes are handled reactively
  }
}

