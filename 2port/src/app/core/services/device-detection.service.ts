import { Injectable, signal } from '@angular/core';
import { PLATFORM_ID, Inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class DeviceDetectionService {
  private readonly isBrowser: boolean;

  readonly isMobile = signal(false);
  readonly isTablet = signal(false);
  readonly isDesktop = signal(false);
  readonly isLowPerformanceDevice = signal(false);

  constructor(@Inject(PLATFORM_ID) platformId: Object) {
    this.isBrowser = isPlatformBrowser(platformId);
    
    if (this.isBrowser) {
      this.detectDevice();
      this.detectPerformance();
    }
  }

  private detectDevice(): void {
    if (!this.isBrowser) return;

    const userAgent = navigator.userAgent.toLowerCase();
    const screenWidth = window.innerWidth;

    // Detect mobile devices
    const mobileRegex = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini|mobile/i;
    this.isMobile.set(mobileRegex.test(userAgent) && screenWidth < 768);

    // Detect tablets
    this.isTablet.set(screenWidth >= 768 && screenWidth < 1024);

    // Detect desktop
    this.isDesktop.set(screenWidth >= 1024);
  }

  private detectPerformance(): void {
    if (!this.isBrowser) return;

    // Detect low performance devices based on various factors
    let lowPerformanceScore = 0;

    // Check hardware concurrency (CPU cores)
    const cores = navigator.hardwareConcurrency || 4;
    if (cores <= 2) lowPerformanceScore += 2;
    else if (cores <= 4) lowPerformanceScore += 1;

    // Check device memory (if available)
    const memory = (navigator as any).deviceMemory;
    if (memory && memory <= 2) lowPerformanceScore += 2;
    else if (memory && memory <= 4) lowPerformanceScore += 1;

    // Check connection speed (if available)
    const connection = (navigator as any).connection;
    if (connection) {
      if (connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g') {
        lowPerformanceScore += 2;
      } else if (connection.effectiveType === '3g') {
        lowPerformanceScore += 1;
      }
    }

    // Mobile devices are generally lower performance
    if (this.isMobile()) lowPerformanceScore += 1;

    // Mark as low performance if score is high enough
    this.isLowPerformanceDevice.set(lowPerformanceScore >= 3);
  }

  // Method to get optimized animation settings based on device
  getAnimationSettings(): {
    enableColorSplash: boolean;
    enableImageSlideshow: boolean;
    slideshowInterval: number;
    enableScrollAnimations: boolean;
    maxConcurrentAnimations: number;
  } {
    if (this.isLowPerformanceDevice() || this.isMobile()) {
      return {
        enableColorSplash: false,
        enableImageSlideshow: false,
        slideshowInterval: 0,
        enableScrollAnimations: false,
        maxConcurrentAnimations: 1
      };
    } else if (this.isTablet()) {
      return {
        enableColorSplash: true,
        enableImageSlideshow: true,
        slideshowInterval: 2000, // Slower on tablets
        enableScrollAnimations: true,
        maxConcurrentAnimations: 3
      };
    } else {
      // Desktop settings
      return {
        enableColorSplash: true,
        enableImageSlideshow: true,
        slideshowInterval: 1500, // Normal desktop speed
        enableScrollAnimations: true,
        maxConcurrentAnimations: 5
      };
    }
  }
}
