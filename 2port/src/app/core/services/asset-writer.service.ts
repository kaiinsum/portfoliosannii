import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import type { AboutContent, ContactContent, Project } from '../models/portfolio.models';

@Injectable({
  providedIn: 'root'
})
export class AssetWriterService {
  private readonly http = inject(HttpClient);

  async saveAbout(mode: 'design' | 'technical', about: AboutContent): Promise<void> {
    try {
      const filePath = `asset_main/data/${mode}/about.json`;
      await firstValueFrom(this.http.put(filePath, about, { 
        headers: { 'Content-Type': 'application/json' }
      }));
      console.log(`Saved about data to ${filePath}`);
    } catch (error) {
      console.error('Failed to save about data:', error);
      throw new Error('Failed to save about data to asset_main');
    }
  }

  async saveContact(mode: 'design' | 'technical', contact: ContactContent): Promise<void> {
    try {
      const filePath = `asset_main/data/${mode}/contact.json`;
      await firstValueFrom(this.http.put(filePath, contact, { 
        headers: { 'Content-Type': 'application/json' }
      }));
      console.log(`Saved contact data to ${filePath}`);
    } catch (error) {
      console.error('Failed to save contact data:', error);
      throw new Error('Failed to save contact data to asset_main');
    }
  }

  async saveProjects(mode: 'design' | 'technical', projects: Project[]): Promise<void> {
    try {
      const filePath = `asset_main/data/${mode}/projects.json`;
      await firstValueFrom(this.http.put(filePath, projects, { 
        headers: { 'Content-Type': 'application/json' }
      }));
      console.log(`Saved projects data to ${filePath}`);
    } catch (error) {
      console.error('Failed to save projects data:', error);
      throw new Error('Failed to save projects data to asset_main');
    }
  }

  async savePortfolioData(data: any): Promise<void> {
    try {
      const filePath = `asset_main/portfolio-data.json`;
      await firstValueFrom(this.http.put(filePath, data, { 
        headers: { 'Content-Type': 'application/json' }
      }));
      console.log(`Saved portfolio data to ${filePath}`);
    } catch (error) {
      console.error('Failed to save portfolio data:', error);
      throw new Error('Failed to save portfolio data to asset_main');
    }
  }
}
