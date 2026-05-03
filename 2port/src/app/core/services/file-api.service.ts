import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import type { AboutContent, ContactContent, Project } from '../models/portfolio.models';

@Injectable({
  providedIn: 'root'
})
export class FileApiService {
  private readonly http = inject(HttpClient);
  private readonly API_BASE = 'http://localhost:3001/api/assets';

  async saveAbout(mode: 'design' | 'technical', about: AboutContent): Promise<void> {
    try {
      await firstValueFrom(
        this.http.post(`${this.API_BASE}/${mode}/about.json`, about, {
          headers: { 'Content-Type': 'application/json' }
        })
      );
      console.log(`Saved about data to asset_main/data/${mode}/about.json`);
    } catch (error) {
      console.error('Failed to save about data:', error);
      throw error;
    }
  }

  async saveContact(mode: 'design' | 'technical', contact: ContactContent): Promise<void> {
    try {
      await firstValueFrom(
        this.http.post(`${this.API_BASE}/${mode}/contact.json`, contact, {
          headers: { 'Content-Type': 'application/json' }
        })
      );
      console.log(`Saved contact data to asset_main/data/${mode}/contact.json`);
    } catch (error) {
      console.error('Failed to save contact data:', error);
      throw error;
    }
  }

  async saveProjects(mode: 'design' | 'technical', projects: Project[]): Promise<void> {
    try {
      await firstValueFrom(
        this.http.post(`${this.API_BASE}/${mode}/projects.json`, projects, {
          headers: { 'Content-Type': 'application/json' }
        })
      );
      console.log(`Saved projects data to asset_main/data/${mode}/projects.json`);
    } catch (error) {
      console.error('Failed to save projects data:', error);
      throw error;
    }
  }

  async savePortfolioData(data: any): Promise<void> {
    try {
      await firstValueFrom(
        this.http.post(`${this.API_BASE}/portfolio-data.json`, data, {
          headers: { 'Content-Type': 'application/json' }
        })
      );
      console.log(`Saved portfolio data to asset_main/portfolio-data.json`);
    } catch (error) {
      console.error('Failed to save portfolio data:', error);
      throw error;
    }
  }

  async saveImage(imagePath: string, imageData: string): Promise<void> {
    try {
      await firstValueFrom(
        this.http.post(`${this.API_BASE}/images`, { path: imagePath, data: imageData }, {
          headers: { 'Content-Type': 'application/json' }
        })
      );
      console.log(`Saved image to asset_main/${imagePath}`);
    } catch (error) {
      console.error('Failed to save image:', error);
      throw error;
    }
  }

  // Method to save all files at once
  async saveAllAssetFiles(designData: any, technicalData: any): Promise<void> {
    try {
      const portfolioData = {
        version: '1.0',
        lastModified: new Date().toISOString(),
        modes: { design: designData, technical: technicalData },
        assets: {}
      };

      await Promise.all([
        // Save design mode data
        this.saveAbout('design', designData.about),
        this.saveContact('design', designData.contact),
        this.saveProjects('design', designData.projects),
        
        // Save technical mode data
        this.saveAbout('technical', technicalData.about),
        this.saveContact('technical', technicalData.contact),
        this.saveProjects('technical', technicalData.projects),
        
        // Save portfolio data
        this.savePortfolioData(portfolioData)
      ]);

      // Save images if they exist
      const allImages = [
        ...(designData.projects || []).map((p: Project) => p.image),
        ...(technicalData.projects || []).map((p: Project) => p.image),
        designData.about?.avatar,
        technicalData.about?.avatar
      ].filter(Boolean);

      for (const imagePath of allImages) {
        if (imagePath.startsWith('data:')) {
          // Handle base64 images
          const fileName = `asset_main/images/${Date.now()}-image.svg`;
          await this.saveImage(fileName, imagePath);
        }
      }

      console.log('All asset_main files saved successfully!');
    } catch (error) {
      console.error('Failed to save asset files:', error);
      throw error;
    }
  }

  // Method to read data from asset_main files
  async readAssetFile(filePath: string): Promise<any> {
    try {
      const response = await firstValueFrom(
        this.http.get(`${this.API_BASE}/${filePath}`)
      );
      return response;
    } catch (error) {
      console.error(`Failed to read asset file ${filePath}:`, error);
      throw error;
    }
  }
}
