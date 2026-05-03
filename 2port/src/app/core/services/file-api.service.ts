import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import type { AboutContent, ContactContent, Project } from '../models/portfolio.models';

@Injectable({
  providedIn: 'root'
})
export class FileApiService {
  private readonly http = inject(HttpClient);

  async saveAbout(mode: 'design' | 'technical', about: AboutContent): Promise<void> {
    // For development, download the file directly
    this.downloadJsonFile(`asset_main/data/${mode}/about.json`, about);
    console.log(`Prepared about data for asset_main/data/${mode}/about.json`);
  }

  async saveContact(mode: 'design' | 'technical', contact: ContactContent): Promise<void> {
    // For development, download the file directly
    this.downloadJsonFile(`asset_main/data/${mode}/contact.json`, contact);
    console.log(`Prepared contact data for asset_main/data/${mode}/contact.json`);
  }

  async saveProjects(mode: 'design' | 'technical', projects: Project[]): Promise<void> {
    // For development, download the file directly
    this.downloadJsonFile(`asset_main/data/${mode}/projects.json`, projects);
    console.log(`Prepared projects data for asset_main/data/${mode}/projects.json`);
  }

  async savePortfolioData(data: any): Promise<void> {
    // For development, download the file directly
    this.downloadJsonFile(`asset_main/portfolio-data.json`, data);
    console.log(`Prepared portfolio data for asset_main/portfolio-data.json`);
  }

  private downloadJsonFile(filename: string, data: any): void {
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  // Method to save multiple files at once
  async saveAllAssetFiles(designData: any, technicalData: any): Promise<void> {
    const files = [
      { filename: 'asset_main/data/design/about.json', data: designData.about },
      { filename: 'asset_main/data/design/contact.json', data: designData.contact },
      { filename: 'asset_main/data/design/projects.json', data: designData.projects },
      { filename: 'asset_main/data/technical/about.json', data: technicalData.about },
      { filename: 'asset_main/data/technical/contact.json', data: technicalData.contact },
      { filename: 'asset_main/data/technical/projects.json', data: technicalData.projects },
      { filename: 'asset_main/portfolio-data.json', data: { version: '1.0', lastModified: new Date().toISOString(), modes: { design: designData, technical: technicalData }, assets: {} } }
    ];

    // Download all files with a small delay between each
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      setTimeout(() => {
        this.downloadJsonFile(file.filename, file.data);
      }, i * 200); // 200ms delay between downloads
    }
  }
}
