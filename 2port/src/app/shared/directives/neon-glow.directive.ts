import { Directive, ElementRef, Renderer2, OnInit, OnDestroy, inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';

interface NeonParticle {
  element: HTMLElement;
  x: number;
  y: number;
  size: number;
  color: string;
  velocity: { x: number; y: number };
  opacity: number;
  lifetime: number;
  glowIntensity: number;
  pulsePhase: number;
}

@Directive({
  selector: '[appNeonGlow]',
  standalone: true
})
export class NeonGlowDirective implements OnInit, OnDestroy {
  private element = inject(ElementRef);
  private renderer = inject(Renderer2);
  private document = inject(DOCUMENT);
  
  private particles: NeonParticle[] = [];
  private animationFrameId: number | null = null;
  private isDarkTheme = false;
  private themeObserver: MutationObserver | null = null;
  
  private readonly neonColors = [
    '#00ffff', // Cyan
    '#ff00ff', // Magenta
    '#ffff00', // Yellow
    '#00ff00', // Lime
    '#ff00aa', // Hot Pink
    '#00ffaa', // Aqua
    '#aa00ff', // Purple
    '#ffaa00'  // Orange
  ];

  ngOnInit(): void {
    this.checkTheme();
    this.observeThemeChanges();
    this.startAnimation();
    
    // Add initial neon effect on page load
    setTimeout(() => {
      if (this.isDarkTheme) {
        this.createInitialNeonBurst();
      }
    }, 200);
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
      
      // Clear all particles when switching to light theme
      if (wasDark && !this.isDarkTheme) {
        this.clearAllParticles();
      } else if (!wasDark && this.isDarkTheme) {
        // Create initial burst when switching to dark theme
        this.createInitialNeonBurst();
      }
    });

    this.themeObserver.observe(this.document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme']
    });
  }

  private clearAllParticles(): void {
    const hostElement = this.element.nativeElement as HTMLElement;
    
    this.particles.forEach(particle => {
      if (particle.element.parentNode) {
        this.renderer.removeChild(hostElement, particle.element);
      }
    });
    
    this.particles = [];
  }

  private startAnimation(): void {
    const animate = () => {
      if (this.isDarkTheme) {
        this.createRandomParticle();
        this.updateParticles();
        this.renderParticles();
      }
      this.animationFrameId = requestAnimationFrame(animate);
    };

    this.animationFrameId = requestAnimationFrame(animate);
  }

  private createInitialNeonBurst(): void {
    const hostElement = this.element.nativeElement as HTMLElement;
    const rect = hostElement.getBoundingClientRect();
    
    // Create 8-12 initial neon particles for dramatic effect
    const initialCount = Math.floor(Math.random() * 5) + 8;
    
    for (let i = 0; i < initialCount; i++) {
      setTimeout(() => {
        const angle = (Math.PI * 2 * i) / initialCount;
        const distance = Math.random() * 100 + 50;
        
        const particle: NeonParticle = {
          element: this.document.createElement('div'),
          x: rect.width / 2 + Math.cos(angle) * distance,
          y: rect.height / 2 + Math.sin(angle) * distance,
          size: Math.random() * 40 + 20,
          color: this.neonColors[Math.floor(Math.random() * this.neonColors.length)],
          velocity: {
            x: Math.cos(angle) * 2,
            y: Math.sin(angle) * 2
          },
          opacity: 1,
          lifetime: 0,
          glowIntensity: 1,
          pulsePhase: Math.random() * Math.PI * 2
        };

        this.styleNeonParticle(particle);
        this.renderer.appendChild(hostElement, particle.element);
        this.particles.push(particle);
      }, i * 50);
    }
  }

  private createRandomParticle(): void {
    if (Math.random() < 0.03) { // 3% chance per frame
      const hostElement = this.element.nativeElement as HTMLElement;
      const rect = hostElement.getBoundingClientRect();
      
      const particle: NeonParticle = {
        element: this.document.createElement('div'),
        x: Math.random() * rect.width,
        y: Math.random() * rect.height,
        size: Math.random() * 30 + 15,
        color: this.neonColors[Math.floor(Math.random() * this.neonColors.length)],
        velocity: {
          x: (Math.random() - 0.5) * 1.5,
          y: (Math.random() - 0.5) * 1.5
        },
        opacity: 0,
        lifetime: 0,
        glowIntensity: Math.random() * 0.5 + 0.5,
        pulsePhase: Math.random() * Math.PI * 2
      };

      this.styleNeonParticle(particle);
      this.renderer.appendChild(hostElement, particle.element);
      this.particles.push(particle);
    }
  }

  private styleNeonParticle(particle: NeonParticle): void {
    // Base styles
    this.renderer.setStyle(particle.element, 'position', 'absolute');
    this.renderer.setStyle(particle.element, 'border-radius', '50%');
    this.renderer.setStyle(particle.element, 'pointer-events', 'none');
    this.renderer.setStyle(particle.element, 'will-change', 'transform, opacity, filter');
    
    // Neon glow effects
    this.renderer.setStyle(particle.element, 'background', particle.color);
    this.renderer.setStyle(particle.element, 'box-shadow', `
      0 0 10px ${particle.color},
      0 0 20px ${particle.color},
      0 0 30px ${particle.color},
      0 0 40px ${particle.color}
    `);
    this.renderer.setStyle(particle.element, 'filter', `
      blur(1px) 
      brightness(1.5) 
      contrast(1.2)
    `);
    this.renderer.setStyle(particle.element, 'mix-blend-mode', 'screen');
  }

  private updateParticles(): void {
    const hostElement = this.element.nativeElement as HTMLElement;
    const rect = hostElement.getBoundingClientRect();
    
    this.particles = this.particles.filter(particle => {
      // Update position
      particle.x += particle.velocity.x;
      particle.y += particle.velocity.y;
      
      // Boundary checking with soft bounce
      const margin = particle.size / 2;
      if (particle.x < margin || particle.x > rect.width - margin) {
        particle.velocity.x *= -0.7;
        particle.x = Math.max(margin, Math.min(rect.width - margin, particle.x));
      }
      
      if (particle.y < margin || particle.y > rect.height - margin) {
        particle.velocity.y *= -0.7;
        particle.y = Math.max(margin, Math.min(rect.height - margin, particle.y));
      }
      
      // Update lifetime and opacity
      particle.lifetime += 1;
      
      // Fade in and then out with neon pulse effect
      if (particle.lifetime < 30) {
        particle.opacity = particle.lifetime / 30;
      } else {
        particle.opacity = Math.max(0, 1 - (particle.lifetime - 30) / 150);
      }
      
      // Update pulse phase for glowing effect
      particle.pulsePhase += 0.05;
      particle.glowIntensity = 0.7 + Math.sin(particle.pulsePhase) * 0.3;
      
      // Add slight friction
      particle.velocity.x *= 0.99;
      particle.velocity.y *= 0.99;
      
      // Remove if fully faded
      return particle.opacity > 0;
    });
  }

  private renderParticles(): void {
    this.particles.forEach(particle => {
      const glowSize = 20 + particle.glowIntensity * 30;
      
      this.renderer.setStyle(particle.element, 'left', `${particle.x - particle.size / 2}px`);
      this.renderer.setStyle(particle.element, 'top', `${particle.y - particle.size / 2}px`);
      this.renderer.setStyle(particle.element, 'width', `${particle.size}px`);
      this.renderer.setStyle(particle.element, 'height', `${particle.size}px`);
      this.renderer.setStyle(particle.element, 'opacity', particle.opacity);
      
      // Dynamic glow effect
      this.renderer.setStyle(particle.element, 'box-shadow', `
        0 0 ${glowSize * 0.3}px ${particle.color},
        0 0 ${glowSize * 0.6}px ${particle.color},
        0 0 ${glowSize * 0.9}px ${particle.color},
        0 0 ${glowSize * 1.2}px ${particle.color}
      `);
      
      // Pulsing transform
      const scale = 1 + Math.sin(particle.pulsePhase) * 0.1 * particle.glowIntensity;
      this.renderer.setStyle(particle.element, 'transform', `scale(${scale})`);
    });
  }
}
