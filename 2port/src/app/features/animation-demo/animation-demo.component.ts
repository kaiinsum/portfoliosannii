import { Component, ElementRef, ViewChild, AfterViewInit, QueryList, ViewChildren } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AnimeService } from '../../shared/services/anime.service';

@Component({
  selector: 'app-animation-demo',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './animation-demo.component.html',
  styleUrls: ['./animation-demo.component.css']
})
export class AnimationDemoComponent implements AfterViewInit {
  
  @ViewChild('particleContainer') particleContainer!: ElementRef;
  @ViewChild('gradientBackground') gradientBackground!: ElementRef;
  @ViewChild('shapesContainer') shapesContainer!: ElementRef;
  @ViewChild('waveContainer') waveContainer!: ElementRef;
  @ViewChild('parallaxContainer') parallaxContainer!: ElementRef;
  @ViewChildren('animatedCard') animatedCards!: QueryList<ElementRef>;
  @ViewChildren('listItem') listItems!: QueryList<ElementRef>;
  @ViewChildren('morphingShape') morphingShapes!: QueryList<ElementRef>;

  constructor(private animeService: AnimeService) {}

  ngAfterViewInit(): void {
    this.initializeAnimations();
  }

  private initializeAnimations(): void {
    // Initialize all animations after view is ready
    setTimeout(() => {
      this.createBackgroundParticles();
      this.createGradientBackground();
      this.createFloatingShapes();
      this.createWaveEffect();
      this.createParallaxEffect();
      this.animateCards();
      this.animateList();
      this.createMorphingShapes();
    }, 100);
  }

  createBackgroundParticles(): void {
    if (this.particleContainer) {
      this.animeService.createParticleAnimation(this.particleContainer);
    }
  }

  createGradientBackground(): void {
    if (this.gradientBackground) {
      this.animeService.createGradientAnimation(this.gradientBackground);
    }
  }

  createFloatingShapes(): void {
    if (this.shapesContainer) {
      this.animeService.createFloatingShapes(this.shapesContainer);
    }
  }

  createWaveEffect(): void {
    if (this.waveContainer) {
      this.animeService.createWaveAnimation(this.waveContainer);
    }
  }

  createParallaxEffect(): void {
    if (this.parallaxContainer) {
      this.animeService.createParallaxEffect(this.parallaxContainer);
    }
  }

  animateCards(): void {
    if (this.animatedCards.length > 0) {
      const cards = this.animatedCards.map(card => card.nativeElement);
      this.animeService.animateCardEntrance(cards as unknown as NodeListOf<Element>);
    }
  }

  animateList(): void {
    if (this.listItems.length > 0) {
      const items = this.listItems.map(item => item.nativeElement);
      this.animeService.animateListItems(items as unknown as NodeListOf<Element>);
    }
  }

  createMorphingShapes(): void {
    if (this.morphingShapes.length > 0) {
      const shapes = this.morphingShapes.map(shape => shape.nativeElement);
      this.animeService.createMorphingShapes(shapes as unknown as NodeListOf<Element>);
    }
  }

  onTextAnimation(element: HTMLElement): void {
    const elementRef = { nativeElement: element } as ElementRef;
    this.animeService.animateTextReveal(elementRef);
  }

  onButtonHover(button: HTMLElement): void {
    const elementRef = { nativeElement: button } as ElementRef;
    this.animeService.createButtonHoverEffect(elementRef);
  }

  onScrollAnimation(element: ElementRef): void {
    this.animeService.createScrollAnimation(element);
  }

  createPulse(element: HTMLElement): void {
    const elementRef = { nativeElement: element } as ElementRef;
    this.animeService.createPulseAnimation(elementRef);
  }

  createLoading(element: HTMLElement): void {
    const elementRef = { nativeElement: element } as ElementRef;
    this.animeService.createLoadingAnimation(elementRef);
  }
}
