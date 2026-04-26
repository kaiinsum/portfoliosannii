import { Directive, ElementRef, Renderer2, OnInit, OnDestroy, inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';

interface ColorSplash {
  element: HTMLElement;
  x: number;
  y: number;
  size: number;
  color: string;
  velocity: { x: number; y: number };
  opacity: number;
  lifetime: number;
}

@Directive({
  selector: '[appColorSplash]',
  standalone: true
})
export class ColorSplashDirective implements OnInit, OnDestroy {
  private element = inject(ElementRef);
  private renderer = inject(Renderer2);
  private document = inject(DOCUMENT);
  
  private splashes: ColorSplash[] = [];
  private animationFrameId: number | null = null;
  private isDarkTheme = false;
  private themeObserver: MutationObserver | null = null;
  
  private readonly colors = [
    'rgba(102, 126, 234, 0.6)',  // Blue
    'rgba(240, 147, 251, 0.6)',  // Pink
    'rgba(79, 172, 254, 0.6)',   // Light Blue
    'rgba(67, 233, 123, 0.6)',   // Green
    'rgba(250, 112, 154, 0.6)',  // Rose
    'rgba(254, 225, 64, 0.6)',   // Yellow
    'rgba(139, 92, 246, 0.6)',   // Purple
    'rgba(236, 72, 153, 0.6)'    // Fuchsia
  ];

  ngOnInit(): void {
    this.checkTheme();
    this.observeThemeChanges();
    this.startAnimation();
    this.addMouseClickListener();
    
    // Add initial splash effect on page load
    setTimeout(() => {
      if (!this.isDarkTheme) {
        this.createInitialSplash();
      }
    }, 500);
  }

  ngOnDestroy(): void {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
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
      
      // Clear all splashes when switching to dark theme
      if (!wasDark && this.isDarkTheme) {
        this.clearAllSplashes();
      }
    });

    this.themeObserver.observe(this.document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme']
    });
  }

  private clearAllSplashes(): void {
    const hostElement = this.element.nativeElement as HTMLElement;
    
    // Remove all splash elements
    this.splashes.forEach(splash => {
      if (splash.element.parentNode) {
        this.renderer.removeChild(hostElement, splash.element);
      }
    });
    
    // Clear the array
    this.splashes = [];
  }

  private addMouseClickListener(): void {
    this.renderer.listen(this.element.nativeElement, 'click', (event: MouseEvent) => {
      if (!this.isDarkTheme) {
        const rect = this.element.nativeElement.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        this.createClickSplash(x, y);
      }
    });
  }

  private createInitialSplash(): void {
    const hostElement = this.element.nativeElement as HTMLElement;
    const rect = hostElement.getBoundingClientRect();
    
    // Create 3-5 initial splashes
    const initialSplashCount = Math.floor(Math.random() * 3) + 3;
    
    for (let i = 0; i < initialSplashCount; i++) {
      setTimeout(() => {
        const splash: ColorSplash = {
          element: this.document.createElement('div'),
          x: Math.random() * rect.width,
          y: Math.random() * rect.height,
          size: Math.random() * 60 + 40,
          color: this.colors[Math.floor(Math.random() * this.colors.length)],
          velocity: {
            x: (Math.random() - 0.5) * 2,
            y: (Math.random() - 0.5) * 2 - 1
          },
          opacity: 0,
          lifetime: 0
        };

        // Style splash element
        this.renderer.setStyle(splash.element, 'position', 'absolute');
        this.renderer.setStyle(splash.element, 'border-radius', '50%');
        this.renderer.setStyle(splash.element, 'pointer-events', 'none');
        this.renderer.setStyle(splash.element, 'filter', 'blur(1.5px)');
        this.renderer.setStyle(splash.element, 'mix-blend-mode', 'screen');
        this.renderer.setStyle(splash.element, 'will-change', 'transform, opacity');
        this.renderer.setStyle(splash.element, 'animation', 'splashRotate 3s ease-in-out infinite');
        
        this.renderer.appendChild(hostElement, splash.element);
        this.splashes.push(splash);

        // Add click effect for initial splash with delay
        setTimeout(() => {
          this.createClickSplash(splash.x, splash.y);
        }, 50);
      }, i * 100); // Stagger initial splashes
    }
    
    // Also trigger a click effect at center after initial splashes
    setTimeout(() => {
      this.createClickSplash(rect.width / 2, rect.height / 2);
    }, initialSplashCount * 100 + 200);
  }

  private startAnimation(): void {
    const animate = () => {
      if (!this.isDarkTheme) {
        this.createRandomSplash();
        this.updateSplashes();
        this.renderSplashes();
      }
      this.animationFrameId = requestAnimationFrame(animate);
    };

    this.animationFrameId = requestAnimationFrame(animate);
  }

  private createRandomSplash(): void {
    if (Math.random() < 0.05) { // 5% chance per frame (more frequent)
      const hostElement = this.element.nativeElement as HTMLElement;
      const rect = hostElement.getBoundingClientRect();
      
      const splash: ColorSplash = {
        element: this.document.createElement('div'),
        x: Math.random() * rect.width,
        y: Math.random() * rect.height,
        size: Math.random() * 80 + 30, // 30-110px (larger)
        color: this.colors[Math.floor(Math.random() * this.colors.length)],
        velocity: {
          x: (Math.random() - 0.5) * 3,
          y: (Math.random() - 0.5) * 3 - 1.5 // More movement
        },
        opacity: 0,
        lifetime: 0
      };

      // Style the splash element
      this.renderer.setStyle(splash.element, 'position', 'absolute');
      this.renderer.setStyle(splash.element, 'border-radius', '50%');
      this.renderer.setStyle(splash.element, 'pointer-events', 'none');
      this.renderer.setStyle(splash.element, 'filter', 'blur(1.5px)');
      this.renderer.setStyle(splash.element, 'mix-blend-mode', 'screen');
      this.renderer.setStyle(splash.element, 'will-change', 'transform, opacity');
      this.renderer.setStyle(splash.element, 'animation', 'splashRotate 3s ease-in-out infinite');
      
      this.renderer.appendChild(hostElement, splash.element);
      this.splashes.push(splash);

      // Add initial click effect
      this.createClickSplash(splash.x, splash.y);
    }
  }

  private createClickSplash(x: number, y: number): void {
    const clickSplash = this.document.createElement('div');
    this.renderer.setStyle(clickSplash, 'position', 'absolute');
    this.renderer.setStyle(clickSplash, 'left', `${x}px`);
    this.renderer.setStyle(clickSplash, 'top', `${y}px`);
    this.renderer.setStyle(clickSplash, 'width', '20px');
    this.renderer.setStyle(clickSplash, 'height', '20px');
    this.renderer.setStyle(clickSplash, 'border-radius', '50%');
    this.renderer.setStyle(clickSplash, 'background', 'radial-gradient(circle, rgba(255, 255, 255, 0.8), transparent)');
    this.renderer.setStyle(clickSplash, 'pointer-events', 'none');
    this.renderer.setStyle(clickSplash, 'transform', 'scale(0)');
    this.renderer.setStyle(clickSplash, 'transition', 'transform 0.3s ease-out');
    
    const hostElement = this.element.nativeElement as HTMLElement;
    this.renderer.appendChild(hostElement, clickSplash);
    
    // Animate the click effect
    setTimeout(() => {
      this.renderer.setStyle(clickSplash, 'transform', 'scale(3)');
      this.renderer.setStyle(clickSplash, 'opacity', '0');
    }, 50);
    
    // Remove after animation
    setTimeout(() => {
      if (clickSplash.parentNode) {
        this.renderer.removeChild(hostElement, clickSplash);
      }
    }, 350);
  }

  private updateSplashes(): void {
    this.splashes = this.splashes.filter(splash => {
      // Update position
      splash.x += splash.velocity.x;
      splash.y += splash.velocity.y;
      
      // Update lifetime and opacity
      splash.lifetime += 1;
      
      // Fade in and then out
      if (splash.lifetime < 60) { // First second (assuming 60fps)
        splash.opacity = splash.lifetime / 60;
      } else {
        splash.opacity = Math.max(0, 1 - (splash.lifetime - 60) / 180); // Fade out over 3 seconds
      }
      
      // Add slight gravity and friction
      splash.velocity.y += 0.05;
      splash.velocity.x *= 0.99;
      splash.velocity.y *= 0.99;
      
      // Remove if fully faded
      return splash.opacity > 0;
    });
  }

  private renderSplashes(): void {
    this.splashes.forEach(splash => {
      this.renderer.setStyle(splash.element, 'left', `${splash.x - splash.size / 2}px`);
      this.renderer.setStyle(splash.element, 'top', `${splash.y - splash.size / 2}px`);
      this.renderer.setStyle(splash.element, 'width', `${splash.size}px`);
      this.renderer.setStyle(splash.element, 'height', `${splash.size}px`);
      this.renderer.setStyle(splash.element, 'background', splash.color);
      this.renderer.setStyle(splash.element, 'opacity', splash.opacity);
      this.renderer.setStyle(splash.element, 'transform', `scale(${0.5 + splash.opacity * 0.5})`);
    });
  }
}
