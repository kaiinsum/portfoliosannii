import {
  Component,
  OnInit,
  AfterViewInit,
  inject,
  computed,
  effect,
  Renderer2,
  ElementRef
} from '@angular/core';
import { RouterLink, RouterOutlet, Router } from '@angular/router';
import { PortfolioModeService } from '../../../core/services/portfolio-mode.service';
import { isPlatformBrowser } from '@angular/common';
import { PLATFORM_ID } from '@angular/core';

@Component({
  selector: 'app-portfolio-shell-page',
  imports: [RouterOutlet, RouterLink],
  template: `
    <header class="app-header border-bottom">
      <div class="container py-3 d-flex align-items-center justify-content-between gap-3">
        <a routerLink="/" class="d-flex align-items-center gap-3 text-decoration-none">
          <img
            class="avatar"
            [class.avatar--flipped]="isTechnical()"
            src="assets/avatar/avatar.svg"
            alt="Avatar"
            width="44"
            height="44"
            loading="lazy"
          />
          <div class="lh-sm">
            <div class="fw-semibold text-body">Portfolio</div>
            <div class="small text-secondary">{{ modeLabel() }}</div>
          </div>
        </a>

        <nav class="d-flex align-items-center gap-2">
          <a class="btn btn-sm btn-outline-secondary" routerLink="/" (click)="onNavigationClick()">
            About
          </a>
          <a class="btn btn-sm btn-outline-secondary" routerLink="/projects" (click)="onNavigationClick()">Projects</a>
          <a class="btn btn-sm btn-outline-secondary" routerLink="/contact" (click)="onNavigationClick()">Contact</a>
          <div class="form-check form-switch ms-2 mb-0">
            <input
              class="form-check-input"
              type="checkbox"
              role="switch"
              id="modeSwitch"
              [checked]="isTechnical()"
              (change)="toggleMode()"
            />
            <label class="form-check-label small text-secondary" for="modeSwitch">
              {{ isTechnical() ? 'Technical' : 'Design' }}
            </label>
          </div>
        </nav>
      </div>
    </header>

    <main class="app-main">
      <div class="page-fade container py-4">
        <router-outlet />
      </div>
    </main>

    <footer class="border-top">
      <div class="container py-4 d-flex justify-content-between align-items-center">
        <div class="small text-secondary">© {{ year }} San Nii Copyright</div>
        <a class="small text-secondary text-decoration-none" routerLink="/admin/login" style="display: none;">Admin</a>
      </div>
    </footer>
  `,
  styleUrl: './portfolio-shell.page.css',
})
export class PortfolioShellPage implements OnInit, AfterViewInit {
  private readonly modeSvc = inject(PortfolioModeService);
  private readonly renderer = inject(Renderer2);
  private readonly elementRef = inject(ElementRef);
  private readonly router = inject(Router);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly isBrowser = isPlatformBrowser(this.platformId);

  readonly isTechnical = this.modeSvc.isTechnical;
  readonly modeLabel = computed(() => (this.modeSvc.isDesign() ? 'Design Portfolio' : 'Technical Portfolio'));

  readonly year = new Date().getFullYear();

  private isThemeSwitching = false;

  ngOnInit(): void {
    // Initialize any setup needed when component loads
  }

  ngAfterViewInit(): void {
    if (this.isBrowser) {
      this.initSmoothScrolling();
      this.initScrollAnimations();
      this.initCursorGlow();
    }
  }

  toggleMode(): void {
    // Set flag to prevent navigation-based reloads during theme switching
    this.isThemeSwitching = true;
    
    this.modeSvc.toggle();
    
    // Check if we're on About or Contact page - no reload needed
    const currentUrl = this.router.url;
    if (currentUrl === '/' || currentUrl === '/about' || currentUrl === '/contact') {
      console.log('PortfolioShellPage: Theme toggle on About/Contact page - no reload needed');
      // Clear the flag immediately since no reload
      setTimeout(() => {
        this.isThemeSwitching = false;
      }, 100);
      return;
    }
    
    // For other pages (like Projects), reload as before
    setTimeout(() => {
      window.location.reload();
    }, 200);
    
    // Clear the flag after a reasonable delay
    setTimeout(() => {
      this.isThemeSwitching = false;
    }, 1000);
  }

  private readonly loadDataEffect = effect(() => {
    // This will automatically trigger when mode changes
    const currentMode = this.modeSvc.mode();
    console.log('PortfolioShellPage: Mode changed to:', currentMode);
    void this.loadContent(currentMode);
    
    // Reinitialize scroll animations for About and Contact pages
    const currentUrl = this.router.url;
    if (currentUrl === '/' || currentUrl === '/about' || currentUrl === '/contact') {
      console.log('PortfolioShellPage: Reinitializing scroll animations for theme change');
      setTimeout(() => {
        this.reinitScrollAnimations();
      }, 200); // Small delay to allow DOM updates
    }
  });

  // Effect to reload data on navigation
  private readonly navigationEffect = effect(() => {
    // This will trigger when router events occur
    this.router.events.subscribe((event) => {
      if (event.constructor.name === 'NavigationEnd') {
        // Don't reload if we're currently switching themes
        if (this.isThemeSwitching) {
          console.log('PortfolioShellPage: Skipping reload during theme switching');
          return;
        }
        
        // Don't reload if we're on the About or Contact page (theme changes are handled reactively)
        const currentUrl = this.router.url;
        if (currentUrl === '/' || currentUrl === '/about' || currentUrl === '/contact') {
          console.log('PortfolioShellPage: Skipping reload on About/Contact page - theme changes are reactive');
          return;
        }
        
        console.log('PortfolioShellPage: Navigation ended, reloading page for fresh data');
        // Reload the entire page to ensure fresh data on every navigation
        if (this.isBrowser) {
          setTimeout(() => {
            window.location.reload();
          }, 100); // Small delay to ensure navigation is complete
        }
      }
    });
  });

  onNavigationClick(): void {
    if (this.isBrowser) {
      // Wait for navigation to complete, then reload
      setTimeout(() => {
        window.location.reload();
      }, 500); // Wait 500ms for navigation to complete
    }
  }

  private async loadContent(mode: string): Promise<void> {
    // This method will trigger data reload in child components
    // The actual data loading is handled by individual page components
    // This is just a placeholder to trigger the effect
    console.log('PortfolioShellPage: Loading content for mode:', mode);
  }

  private initSmoothScrolling(): void {
    if (!this.isBrowser) return;
    
    // Add smooth scrolling to anchor links
    document.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      const link = target.closest('a[href^="#"]');
      
      if (link) {
        e.preventDefault();
        const targetId = link.getAttribute('href')?.substring(1);
        if (targetId) {
          const targetElement = document.getElementById(targetId);
          if (targetElement) {
            targetElement.scrollIntoView({
              behavior: 'smooth',
              block: 'start'
            });
          }
        }
      }
    });
  }

  private initScrollAnimations(): void {
    if (!this.isBrowser) return;
    
    this.reinitScrollAnimations();
  }

  private reinitScrollAnimations(): void {
    if (!this.isBrowser) return;
    
    // Remove existing observer if it exists
    if (this.scrollObserver) {
      this.scrollObserver.disconnect();
    }
    
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };

    this.scrollObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    }, observerOptions);

    // Force re-render of all animate-on-scroll elements on About page
    const animatedElements = document.querySelectorAll('.animate-on-scroll');
    animatedElements.forEach(element => {
      // Remove visible class to trigger re-animation
      element.classList.remove('visible');
      // Force reflow to ensure DOM updates with new theme data
      void (element as HTMLElement).offsetHeight;
    });

    // Re-observe all elements with animate-on-scroll class
    setTimeout(() => {
      const animatedElements = document.querySelectorAll('.animate-on-scroll');
      animatedElements.forEach(el => this.scrollObserver!.observe(el));
    }, 100);
  }

  private scrollObserver?: IntersectionObserver;

  private initCursorGlow(): void {
    if (!this.isBrowser) return;
    
    // Only initialize cursor glow in dark theme
    const isDarkTheme = document.documentElement.getAttribute('data-theme') === 'dark';
    if (!isDarkTheme) return;

    // Create cursor glow element
    const cursorGlow = document.createElement('div');
    cursorGlow.className = 'cursor-glow';
    document.body.appendChild(cursorGlow);
    
    document.addEventListener('mousemove', (e) => {
      cursorGlow.style.left = e.clientX + 'px';
      cursorGlow.style.top = e.clientY + 'px';
    });

    // Hide cursor glow when mouse leaves window
    document.addEventListener('mouseleave', () => {
      cursorGlow.style.opacity = '0';
    });

    // Show cursor glow when mouse enters window
    document.addEventListener('mouseenter', () => {
      cursorGlow.style.opacity = '1';
    });

    // Add ripple effect on click
    document.addEventListener('click', (e) => {
      this.createRipple(e.clientX, e.clientY);
      this.createSparkle(e.clientX, e.clientY);
    });
  }

  private createRipple(x: number, y: number): void {
    if (!this.isBrowser) return;
    
    // Only create ripple in dark theme
    const isDarkTheme = document.documentElement.getAttribute('data-theme') === 'dark';
    if (!isDarkTheme) return;

    // Create ripple element
    const ripple = document.createElement('div');
    ripple.className = 'ripple';
    ripple.style.left = x + 'px';
    ripple.style.top = y + 'px';
    
    document.body.appendChild(ripple);
    
    // Remove ripple after animation completes
    setTimeout(() => {
      ripple.remove();
    }, 800);
  }

  private createSparkle(x: number, y: number): void {
    if (!this.isBrowser) return;
    
    // Only create sparkle in light theme
    const isDarkTheme = document.documentElement.getAttribute('data-theme') === 'dark';
    if (isDarkTheme) return;

    // Create multiple sparkles for better effect
    for (let i = 0; i < 3; i++) {
      setTimeout(() => {
        const sparkle = document.createElement('div');
        sparkle.className = 'sparkle';
        
        // Random offset around click position
        const offsetX = (Math.random() - 0.5) * 30;
        const offsetY = (Math.random() - 0.5) * 30;
        
        sparkle.style.left = (x + offsetX) + 'px';
        sparkle.style.top = (y + offsetY) + 'px';
        
        // Set random CSS variables for sparkle float animation
        sparkle.style.setProperty('--x-offset', `${(Math.random() - 0.5) * 20}px`);
        sparkle.style.setProperty('--y-offset', `${(Math.random() - 0.5) * 20}px`);
        
        document.body.appendChild(sparkle);
        
        // Remove sparkle after animation completes
        setTimeout(() => {
          sparkle.remove();
        }, 800);
      }, i * 100); // Stagger the sparkles
    }
  }

  private initStarBackground(): void {
    if (!this.isBrowser) return;
    
    // Only initialize star background in dark theme
    const isDarkTheme = document.documentElement.getAttribute('data-theme') === 'dark';
    if (!isDarkTheme) return;

    // Create star background container
    const starBackground = document.createElement('div');
    starBackground.className = 'star-background';
    document.body.appendChild(starBackground);

    // Create initial stars
    this.createStars(starBackground);

    // Track mouse movement for star parallax effect
    let mouseX = 0;
    let mouseY = 0;

    document.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      this.updateStarPositions(starBackground, mouseX, mouseY);
    });

    // Reinitialize stars when theme changes to dark
    effect(() => {
      const currentMode = this.modeSvc.mode();
      const isDarkTheme = document.documentElement.getAttribute('data-theme') === 'dark';
      if (isDarkTheme) {
        // Clear existing stars and recreate
        if (starBackground && starBackground.parentNode) {
          starBackground.innerHTML = '';
          this.createStars(starBackground);
        }
      } else {
        // Remove star background when switching to light theme
        if (starBackground && starBackground.parentNode) {
          starBackground.remove();
        }
      }
    });
  }

  private createStars(container: HTMLElement): void {
    const starCount = 150;
    const sizes = ['small', 'medium', 'large'];
    
    for (let i = 0; i < starCount; i++) {
      const star = document.createElement('div');
      const size = sizes[Math.floor(Math.random() * sizes.length)];
      
      star.className = `star ${size}`;
      
      // Random position
      const x = Math.random() * 100;
      const y = Math.random() * 100;
      
      star.style.left = `${x}%`;
      star.style.top = `${y}%`;
      
      // Random animation delay
      star.style.animationDelay = `${Math.random() * 3}s`;
      
      // Store original position for parallax effect
      (star as any)['dataset']['originalX'] = x.toString();
      (star as any)['dataset']['originalY'] = y.toString();
      (star as any)['dataset']['parallaxSpeed'] = (Math.random() * 0.5 + 0.1).toString();
      
      container.appendChild(star);
    }
  }

  private updateStarPositions(container: HTMLElement, mouseX: number, mouseY: number): void {
    if (!container) return;
    
    const stars = container.querySelectorAll('.star');
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;
    
    stars.forEach((star) => {
      const starElement = star as HTMLElement;
      const originalX = parseFloat((starElement as any)['dataset']['originalX'] || '0');
      const originalY = parseFloat((starElement as any)['dataset']['originalY'] || '0');
      const parallaxSpeed = parseFloat((starElement as any)['dataset']['parallaxSpeed'] || '0.3');
      
      // Calculate parallax offset based on mouse position
      const centerX = windowWidth / 2;
      const centerY = windowHeight / 2;
      const offsetX = (mouseX - centerX) / centerX;
      const offsetY = (mouseY - centerY) / centerY;
      
      // Apply parallax effect
      const newX = originalX + (offsetX * parallaxSpeed * 10);
      const newY = originalY + (offsetY * parallaxSpeed * 10);
      
      starElement.style.left = `${newX}%`;
      starElement.style.top = `${newY}%`;
    });
  }
}

