import { Injectable, ElementRef } from '@angular/core';
import { animate, stagger, splitText } from 'animejs';

@Injectable({
  providedIn: 'root'
})
export class AnimeService {

  constructor() { }

  // Background particle animation
  createParticleAnimation(container: ElementRef): void {
    const particles = container.nativeElement.querySelectorAll('.particle');
    animate(particles, {
      translateX: () => Math.random() * 2000 - 1000,
      translateY: () => Math.random() * 2000 - 1000,
      scale: () => Math.random() * 2 + 0.5,
      rotate: () => Math.random() * 360,
      opacity: [0, 1, 0],
      duration: () => Math.random() * 3000 + 2000,
      delay: stagger(50),
      loop: true,
      direction: 'alternate',
      easing: 'inOutQuad'
    });
  }

  // Floating background shapes animation
  createFloatingShapes(container: ElementRef): void {
    const shapes = container.nativeElement.querySelectorAll('.floating-shape');
    animate(shapes, {
      translateY: () => Math.random() * 100 - 50,
      translateX: () => Math.random() * 100 - 50,
      rotate: () => Math.random() * 360,
      scale: [1, 1.2, 1],
      duration: () => Math.random() * 4000 + 3000,
      delay: stagger(200),
      loop: true,
      direction: 'alternate',
      easing: 'inOutSine'
    });
  }

  // Gradient background animation
  createGradientAnimation(element: ElementRef): void {
    animate(element.nativeElement, {
      background: [
        'linear-gradient(45deg, #667eea 0%, #764ba2 100%)',
        'linear-gradient(45deg, #f093fb 0%, #f5576c 100%)',
        'linear-gradient(45deg, #4facfe 0%, #00f2fe 100%)',
        'linear-gradient(45deg, #43e97b 0%, #38f9d7 100%)',
        'linear-gradient(45deg, #fa709a 0%, #fee140 100%)',
        'linear-gradient(45deg, #667eea 0%, #764ba2 100%)'
      ],
      duration: 10000,
      loop: true,
      easing: 'linear'
    });
  }

  // Text reveal animation with stagger
  animateTextReveal(element: ElementRef): void {
    const { chars } = splitText(element.nativeElement, { words: false, chars: true });
    animate(chars, {
      translateY: [50, 0],
      opacity: [0, 1],
      rotate: [10, 0],
      duration: 800,
      delay: stagger(30),
      easing: 'outExpo'
    });
  }

  // Card entrance animation
  animateCardEntrance(cards: NodeListOf<Element>): void {
    animate(cards, {
      translateY: [100, 0],
      opacity: [0, 1],
      scale: [0.8, 1],
      duration: 600,
      delay: stagger(100),
      easing: 'outBack'
    });
  }

  // Button hover effect
  createButtonHoverEffect(button: ElementRef): void {
    const element = button.nativeElement;
    
    // Mouse enter animation
    const mouseEnter = () => {
      animate(element, {
        scale: 1.05,
        translateY: -2,
        duration: 300,
        easing: 'outQuad'
      });
    };

    // Mouse leave animation
    const mouseLeave = () => {
      animate(element, {
        scale: 1,
        translateY: 0,
        duration: 300,
        easing: 'outQuad'
      });
    };

    element.addEventListener('mouseenter', mouseEnter);
    element.addEventListener('mouseleave', mouseLeave);
  }

  // Scroll-triggered animation
  createScrollAnimation(element: ElementRef): void {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animate(entry.target, {
            translateY: [50, 0],
            opacity: [0, 1],
            duration: 800,
            easing: 'outExpo'
          });
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });

    observer.observe(element.nativeElement);
  }

  // Loading animation
  createLoadingAnimation(element: ElementRef): void {
    animate(element.nativeElement, {
      rotate: 360,
      duration: 1000,
      loop: true,
      easing: 'linear'
    });
  }

  // Pulse animation for important elements
  createPulseAnimation(element: ElementRef): void {
    animate(element.nativeElement, {
      scale: [1, 1.1, 1],
      opacity: [1, 0.8, 1],
      duration: 2000,
      loop: true,
      easing: 'inOutSine'
    });
  }

  // Wave animation for backgrounds
  createWaveAnimation(container: ElementRef): void {
    const waves = container.nativeElement.querySelectorAll('.wave');
    waves.forEach((wave: any, index: number) => {
      animate(wave, {
        translateY: [0, -30, 0],
        opacity: [0.3, 0.8, 0.3],
        duration: 3000 + (index * 500),
        delay: index * 200,
        loop: true,
        easing: 'inOutSine'
      });
    });
  }

  // Parallax effect on mouse move
  createParallaxEffect(container: ElementRef): void {
    const element = container.nativeElement;
    const layers = element.querySelectorAll('.parallax-layer');
    
    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX - window.innerWidth / 2) / window.innerWidth;
      const y = (e.clientY - window.innerHeight / 2) / window.innerHeight;
      
      layers.forEach((layer: any, index: number) => {
        const speed = (index + 1) * 10;
        animate(layer, {
          translateX: x * speed,
          translateY: y * speed,
          duration: 1000,
          easing: 'outQuad'
        });
      });
    };

    element.addEventListener('mousemove', handleMouseMove);
  }

  // Staggered list animation
  animateListItems(items: NodeListOf<Element>): void {
    animate(items, {
      translateX: [-50, 0],
      opacity: [0, 1],
      duration: 500,
      delay: stagger(100),
      easing: 'outBack'
    });
  }

  // Morphing shapes animation
  createMorphingShapes(shapes: NodeListOf<Element>): void {
    animate(shapes, {
      borderRadius: [
        '50% 0% 50% 0%',
        '0% 50% 0% 50%',
        '50% 0% 50% 0%'
      ],
      rotate: [0, 180, 360],
      scale: [1, 1.2, 1],
      duration: 4000,
      loop: true,
      easing: 'inOutSine'
    });
  }
}
