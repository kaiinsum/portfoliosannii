import { Injectable } from '@angular/core';
import { ContentService } from './content.service';
import type { AboutContent, ContactContent, PortfolioMode, Project } from '../models/portfolio.models';

export interface AdminDataExport {
  version: string;
  exportDate: string;
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
}

@Injectable({
  providedIn: 'root'
})
export class DataManagementService {
  constructor(private contentService: ContentService) {}

  async exportAllData(): Promise<AdminDataExport> {
    const [designContent, technicalContent] = await Promise.all([
      this.contentService.getModeContent('design'),
      this.contentService.getModeContent('technical')
    ]);

    return {
      version: '1.0',
      exportDate: new Date().toISOString(),
      modes: {
        design: {
          about: designContent.about,
          contact: designContent.contact,
          projects: designContent.projects
        },
        technical: {
          about: technicalContent.about,
          contact: technicalContent.contact,
          projects: technicalContent.projects
        }
      }
    };
  }

  async importAllData(data: AdminDataExport): Promise<void> {
    try {
      // Import design mode data
      await Promise.all([
        this.contentService.updateAbout('design', data.modes.design.about),
        this.contentService.updateContact('design', data.modes.design.contact),
        ...data.modes.design.projects.map(project => 
          this.contentService.upsertProject('design', project)
        )
      ]);

      // Import technical mode data
      await Promise.all([
        this.contentService.updateAbout('technical', data.modes.technical.about),
        this.contentService.updateContact('technical', data.modes.technical.contact),
        ...data.modes.technical.projects.map(project => 
          this.contentService.upsertProject('technical', project)
        )
      ]);
    } catch (error) {
      console.error('Error importing data:', error);
      throw new Error('Failed to import data. Please check the file format and try again.');
    }
  }

  downloadDataAsFile(data: AdminDataExport, filename?: string): void {
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = filename || `portfolio-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  async readDataFromFile(file: File): Promise<AdminDataExport> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (event) => {
        try {
          const result = event.target?.result as string;
          const data = JSON.parse(result) as AdminDataExport;
          
          // Validate data structure
          if (!this.validateExportData(data)) {
            reject(new Error('Invalid file format. Please ensure the file is a valid portfolio backup.'));
            return;
          }
          
          resolve(data);
        } catch (error) {
          reject(new Error('Failed to parse file. Please ensure it\'s a valid JSON file.'));
        }
      };
      
      reader.onerror = () => {
        reject(new Error('Failed to read file.'));
      };
      
      reader.readAsText(file);
    });
  }

  private validateExportData(data: any): data is AdminDataExport {
    return (
      data &&
      typeof data === 'object' &&
      data.version &&
      data.exportDate &&
      data.modes &&
      data.modes.design &&
      data.modes.technical &&
      data.modes.design.about &&
      data.modes.design.contact &&
      Array.isArray(data.modes.design.projects) &&
      data.modes.technical.about &&
      data.modes.technical.contact &&
      Array.isArray(data.modes.technical.projects)
    );
  }
}
