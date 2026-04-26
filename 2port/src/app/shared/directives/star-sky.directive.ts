import { Directive, ElementRef, Renderer2, OnInit, OnDestroy, inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';

interface Star {
  element: HTMLElement;
  x: number;
  y: number;
  size: number;
  opacity: number;
  twinkleSpeed: number;
  blinkSpeed: number;
}

@Directive({
  selector: '[appStarSky]',
  standalone: true
})
export class StarSkyDirective implements OnInit, OnDestroy {
  private element = inject(ElementRef);
  private renderer = inject(Renderer2);
  private document = inject(DOCUMENT);
  
  private stars: Star[] = [];
  private mouseX = 0;
  private mouseY = 0;
  private animationFrameId: number | null = null;
  private mouseMoveListener: ((event: MouseEvent) => void) | null = null;
  private isDarkTheme = false;
  private themeObserver: MutationObserver | null = null;

  ngOnInit(): void {
    this.checkTheme();
    this.observeThemeChanges();
    this.createStarField();
    this.addMouseMoveListener();
    this.startAnimation();
  }

  ngOnDestroy(): void {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
    if (this.mouseMoveListener) {
      this.document.removeEventListener('mousemove', this.mouseMoveListener);
    }
    if (this.themeObserver) {
      this.themeObserver.disconnect();
    }
  }

  private checkTheme(): void {
    const html = this.document.documentElement;
    this.isDarkTheme = html.hasAttribute('data-theme') && html.getAttribute('data-theme') === 'dark';
  }

  private observeThemeChanges(): void {
    this.themeObserver = new MutationObserver(() => {
      const wasDark = this.isDarkTheme;
      this.checkTheme();
      
      // Clear stars when switching to light theme
      if (wasDark && !this.isDarkTheme) {
        this.clearStars();
      }
    });

    this.themeObserver.observe(this.document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme']
    });
  }

  private createStarField(): void {
    const hostElement = this.element.nativeElement as HTMLElement;
    const rect = hostElement.getBoundingClientRect();
    
    // Responsive star count based on screen size
    const isMobile = window.innerWidth < 768;
    const baseStarCount = isMobile ? 30 : 150;
    const maxStarCount = isMobile ? 80 : 200;
    const starCount = Math.floor(Math.random() * (maxStarCount - baseStarCount)) + baseStarCount;
    
    // Responsive star size for mobile
    const baseSize = isMobile ? 1 : 2;
    const maxSize = isMobile ? 2 : 3;
    
    for (let i = 0; i < starCount; i++) {
      const star: Star = {
        element: this.document.createElement('div'),
        x: Math.random() * rect.width,
        y: Math.random() * rect.height,
        size: Math.random() * maxSize + baseSize, // Smaller on mobile
        opacity: Math.random() * 0.6 + 0.4, // 0.4-1.0 opacity
        twinkleSpeed: Math.random() * 0.02 + 0.01, // 0.01-0.03
        blinkSpeed: Math.random() * 0.01 + 0.005 // Blinking speed
      };

      // Style star
      this.renderer.setStyle(star.element, 'position', 'absolute');
      this.renderer.setStyle(star.element, 'border-radius', '50%');
      this.renderer.setStyle(star.element, 'background', '#ffffff');
      this.renderer.setStyle(star.element, 'pointer-events', 'none');
      this.renderer.setStyle(star.element, 'will-change', 'transform, opacity');
      this.renderer.setStyle(star.element, 'box-shadow', '0 0 4px rgba(255, 255, 255, 0.6)');
      
      this.renderer.appendChild(hostElement, star.element);
      this.stars.push(star);
    }
  }

  // Mouse listener removed - stars no longer depend on mouse movement

  private startAnimation(): void {
    const animate = () => {
      if (this.isDarkTheme) {
        this.updateStars();
        this.renderStars();
      }
      this.animationFrameId = requestAnimationFrame(animate);
    };

    this.animationFrameId = requestAnimationFrame(animate);
  }

  private updateStars(): void {
    const hostElement = this.element.nativeElement as HTMLElement;
    const rect = hostElement.getBoundingClientRect();
    
    this.stars.forEach(star => {
      // Gentle floating animation with blinking
      star.x += Math.sin(Date.now() * 0.001 + star.twinkleSpeed) * 0.15;
      star.y += Math.cos(Date.now() * 0.001 + star.twinkleSpeed) * 0.08;
      
      // Combined twinkle and blink effect
      const twinkle = Math.sin(Date.now() * star.twinkleSpeed) * 0.7;
      const blink = Math.sin(Date.now() * star.blinkSpeed) > 0 ? 0.8 : 0.3;
      star.opacity = 0.3 + twinkle * blink;
    });
  }

  private renderStars(): void {
    this.stars.forEach(star => {
      this.renderer.setStyle(star.element, 'left', `${star.x - star.size / 2}px`);
      this.renderer.setStyle(star.element, 'top', `${star.y - star.size / 2}px`);
      this.renderer.setStyle(star.element, 'width', `${star.size}px`);
      this.renderer.setStyle(star.element, 'height', `${star.size}px`);
      this.renderer.setStyle(star.element, 'opacity', star.opacity);
      this.renderer.setStyle(star.element, 'transform', `scale(${0.5 + star.opacity * 0.5})`);
    });
  }

  private clearStars(): void {
    const hostElement = this.element.nativeElement as HTMLElement;
    
    // Remove all star elements
    this.stars.forEach(star => {
      if (star.element.parentNode) {
        this.renderer.removeChild(hostElement, star.element);
      }
    });
    
    // Clear the array
    this.stars = [];
  }
}
