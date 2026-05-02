import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import type { AboutContent, ContactContent, PortfolioMode, Project } from '../models/portfolio.models';

export interface AssetFileData {
  version: string;
  lastModified: string;
  modes: {
    design: {
      about: AboutContent;
      contact: ContactContent;
      projects: Project[];
    };
    technical: {
      about: AboutContent;
      contact: ContactContent;
      projects: Project[];
    };
  };
  assets: {
    [key: string]: string; // Base64 encoded images
  };
}

@Injectable({
  providedIn: 'root'
})
export class AssetFileService {
  private readonly http = inject(HttpClient);
  private readonly ASSET_FILE_PATH = 'assets/portfolio-data.json';

  async loadAssetFile(): Promise<AssetFileData> {
    try {
      const data = await firstValueFrom(this.http.get<AssetFileData>(this.ASSET_FILE_PATH));
      return this.decodeImages(data);
    } catch (error) {
      console.warn('Asset file not found, using fallback data');
      return this.getFallbackData();
    }
  }

  async saveAssetFile(data: AssetFileData): Promise<void> {
    try {
      const encodedData = this.encodeImages(data);
      // Note: In a real application, this would save to a server
      // For demo purposes, we'll just log the data
      console.log('Asset file data prepared:', encodedData);
      
      // You could also trigger a download for the user
      this.downloadAssetFile(encodedData);
    } catch (error) {
      console.error('Failed to save asset file:', error);
      throw new Error('Failed to save asset file');
    }
  }

  private encodeImages(data: AssetFileData): AssetFileData {
    const assets: { [key: string]: string } = {};
    
    // Process design mode
    data.modes.design.about.avatar = this.processImage(data.modes.design.about.avatar, assets);
    data.modes.design.projects = data.modes.design.projects.map(project => ({
      ...project,
      image: this.processImage(project.image, assets),
      images: (project.images || []).map(img => this.processImage(img, assets))
    }));
    
    // Process technical mode
    data.modes.technical.about.avatar = this.processImage(data.modes.technical.about.avatar, assets);
    data.modes.technical.projects = data.modes.technical.projects.map(project => ({
      ...project,
      image: this.processImage(project.image, assets),
      images: (project.images || []).map(img => this.processImage(img, assets))
    }));
    
    return {
      ...data,
      assets
    };
  }

  private decodeImages(data: AssetFileData): AssetFileData {
    if (!data.assets) return data;
    
    // Process design mode
    data.modes.design.about.avatar = this.restoreImage(data.modes.design.about.avatar, data.assets);
    data.modes.design.projects = data.modes.design.projects.map(project => ({
      ...project,
      image: this.restoreImage(project.image, data.assets),
      images: (project.images || []).map(img => this.restoreImage(img, data.assets))
    }));
    
    // Process technical mode
    data.modes.technical.about.avatar = this.restoreImage(data.modes.technical.about.avatar, data.assets);
    data.modes.technical.projects = data.modes.technical.projects.map(project => ({
      ...project,
      image: this.restoreImage(project.image, data.assets),
      images: (project.images || []).map(img => this.restoreImage(img, data.assets))
    }));
    
    return data;
  }

  private processImage(imagePath: string, assets: { [key: string]: string }): string {
    if (!imagePath || !imagePath.startsWith('data:')) {
      return imagePath; // Return as-is if not a data URL
    }
    
    // Generate a unique key for this image
    const key = `img_${Object.keys(assets).length}_${Date.now()}`;
    assets[key] = imagePath;
    return `asset:${key}`;
  }

  private restoreImage(imagePath: string, assets: { [key: string]: string }): string {
    if (!imagePath || !imagePath.startsWith('asset:')) {
      return imagePath; // Return as-is if not an asset reference
    }
    
    const key = imagePath.replace('asset:', '');
    return assets[key] || imagePath; // Fallback to original if not found
  }

  private downloadAssetFile(data: AssetFileData): void {
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `portfolio-asset-file-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  private getFallbackData(): AssetFileData {
    return {
      version: '1.0',
      lastModified: new Date().toISOString(),
      modes: {
        design: {
          about: {
            heading: 'Hi, I\'m Quan Toai Cong',
            intro: 'I create delightful creative experiences with a focus on design, typography, and motion. This is the Creative Portfolio mode (light theme).',
            tags: ['Creative Design', 'UX', 'Figma', 'Design Systems', 'Branding'],
            avatar: 'assets/avatar/avatar.svg'
          },
          contact: {
            email: 'contact@example.com',
            socials: [
              { label: 'GitHub', url: 'https://github.com' },
              { label: 'LinkedIn', url: 'https://linkedin.com' }
            ]
          },
          projects: []
        },
        technical: {
          about: {
            heading: 'Hi, I\'m Quan Toai Cong',
            intro: 'I build robust technical solutions with a focus on performance, scalability, and clean code. This is the Technical Portfolio mode (dark theme).',
            tags: ['Web Development', 'TypeScript', 'Angular', 'Node.js', 'Performance'],
            avatar: 'assets/avatar/avatar.svg'
          },
          contact: {
            email: 'contact@example.com',
            socials: [
              { label: 'GitHub', url: 'https://github.com' },
              { label: 'LinkedIn', url: 'https://linkedin.com' }
            ]
          },
          projects: []
        }
      },
      assets: {}
    };
  }

  // Helper method to convert external images to data URLs
  async convertImageToDataURL(imagePath: string): Promise<string> {
    if (imagePath.startsWith('data:')) {
      return imagePath; // Already a data URL
    }
    
    try {
      const response = await fetch(imagePath);
      const blob = await response.blob();
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.warn('Failed to convert image to data URL:', imagePath);
      return imagePath; // Return original if conversion fails
    }
  }

  // Method to update asset file with current data
  async updateAssetFile(designData: any, technicalData: any): Promise<void> {
    const assetData: AssetFileData = {
      version: '1.0',
      lastModified: new Date().toISOString(),
      modes: {
        design: designData,
        technical: technicalData
      },
      assets: {}
    };
    
    await this.saveAssetFile(assetData);
  }
}
