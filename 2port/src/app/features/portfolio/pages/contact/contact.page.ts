import { Component, computed, effect, inject, signal, OnInit, OnDestroy } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { Router } from '@angular/router';
import type { ContactContent, PortfolioMode } from '../../../../core/models/portfolio.models';
import { ContentService } from '../../../../core/services/content.service';
import { PortfolioModeService } from '../../../../core/services/portfolio-mode.service';

@Component({
  selector: 'app-contact-page',
  template: `
    <!-- Contact Hero Section -->
    <section class="contact-hero animate-on-scroll">
      <div class="container">
        <div class="text-center">
          <h1 class="display-5 fw-bold mb-3">Get In Touch</h1>
          <p class="lead text-secondary mb-5">Let's discuss your next project</p>
        </div>
      </div>
    </section>

    <!-- Contact Content -->
    <section class="contact-content">
      <div class="container">
        <div class="row justify-content-center">
          <div class="col-12 col-lg-8">
            <div class="contact-info-card animate-on-scroll text-center">
              <div class="contact-info-header">
                <div class="contact-icon mx-auto">📧</div>
                <h2 class="contact-title">Let's Connect</h2>
                <p class="contact-subtitle">I'm always interested in hearing about new projects and opportunities.</p>
              </div>

              <div class="contact-details">
                <div class="contact-item">
                  <div class="contact-item-icon">📧</div>
                  <div class="contact-item-content">
                    <h4>Email</h4>
                    <a class="contact-link" [href]="'mailto:' + (contact()?.email || '')">
                      {{ contact()?.email || 'hello@example.com' }}
                    </a>
                  </div>
                </div>

                <div class="contact-item">
                  <div class="contact-item-icon">🌐</div>
                  <div class="contact-item-content">
                    <h4>Social</h4>
                    <div class="social-links">
                      @for (s of (contact()?.socials || []); track s.url) {
                        <a class="social-link" [href]="s.url" target="_blank" rel="noreferrer">
                          <span class="social-icon">{{ getSocialIcon(s.label) }}</span>
                          <span class="social-label">{{ s.label }}</span>
                        </a>
                      }
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  `,
})
export class ContactPage implements OnInit, OnDestroy {
  private readonly modeSvc = inject(PortfolioModeService);
  private readonly content = inject(ContentService);
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);
  private readonly router = inject(Router);

  readonly modeLabel = computed(() => (this.modeSvc.isDesign() ? 'Design Portfolio' : 'Technical Portfolio'));
  readonly contact = signal<ContactContent | null>(null);

  // Reactive data loading that responds to mode changes
  private readonly loadDataEffect = effect(() => {
    // This will automatically trigger when mode changes
    const currentMode = this.modeSvc.mode();
    console.log('ContactPage: Mode changed to:', currentMode);
    void this.loadData(currentMode);
  });

  ngOnInit(): void {
    console.log('ContactPage: ngOnInit called');
    this.updatePageMetadata();
  }

  ngOnDestroy(): void {
    console.log('ContactPage: ngOnDestroy called');
    // Cleanup is handled automatically by Angular
  }

  private updatePageMetadata(): void {
    const label = this.modeLabel();
    this.title.setTitle(`${label} — Contact`);
    this.meta.updateTag({ name: 'description', content: `Contact — ${label}` });
  }

  private async loadData(mode: PortfolioMode): Promise<void> {
    console.log('ContactPage: Loading data for mode:', mode);
    try {
      const data = await this.content.getModeContent(mode);
      console.log('ContactPage: Data loaded successfully:', data);
      this.contact.set(data.contact);
    } catch (error) {
      console.error('ContactPage: Failed to load contact content:', error);
      // Set fallback contact content
      this.contact.set({
        email: 'hello@example.com',
        socials: [
          { label: 'GitHub', url: 'https://github.com' },
          { label: 'LinkedIn', url: 'https://linkedin.com' }
        ]
      });
    }
  }

  getSocialIcon(label: string): string {
    const icons: { [key: string]: string } = {
      'GitHub': '🐙',
      'LinkedIn': '💼',
      'Twitter': '🐦',
      'Instagram': '📷',
      'Facebook': '📘',
      'Dribbble': '🏀',
      'Behance': '🎨',
      'CodePen': '🖊️',
      'YouTube': '📺',
      'Medium': '📝'
    };
    return icons[label] || '🔗';
  }
}

