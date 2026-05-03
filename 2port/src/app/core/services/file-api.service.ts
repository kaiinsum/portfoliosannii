import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import type { AboutContent, ContactContent, Project } from '../models/portfolio.models';

@Injectable({
  providedIn: 'root'
})
export class FileApiService {
  private readonly http = inject(HttpClient);
  private readonly API_BASE = '/api/assets';

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
      // Fallback to localStorage for development
      this.saveToLocalStorage(`asset_main_${mode}_about`, about);
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
      // Fallback to localStorage for development
      this.saveToLocalStorage(`asset_main_${mode}_contact`, contact);
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
      // Fallback to localStorage for development
      this.saveToLocalStorage(`asset_main_${mode}_projects`, projects);
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
      // Fallback to localStorage for development
      this.saveToLocalStorage('asset_main_portfolio_data', data);
    }
  }

  private saveToLocalStorage(key: string, data: any): void {
    localStorage.setItem(key, JSON.stringify(data));
    console.log(`Saved to localStorage as fallback: ${key}`);
  }

  // Method to check if we're in development mode
  isDevelopmentMode(): boolean {
    return !window.location.hostname.includes('localhost') === false;
  }
}
