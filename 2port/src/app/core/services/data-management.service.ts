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
          console.log('File read result:', result);
          
          if (!result) {
            reject(new Error('File is empty or could not be read.'));
            return;
          }
          
          const data = JSON.parse(result) as AdminDataExport;
          console.log('Parsed data:', data);
          
          // Validate data structure
          if (!this.validateExportData(data)) {
            console.log('Validation failed:', data);
            reject(new Error('Invalid file format. Please ensure file is a valid portfolio backup.'));
            return;
          }
          
          resolve(data);
        } catch (error) {
          console.error('Parse error:', error);
          reject(new Error('Failed to parse file. Please ensure it\'s a valid JSON file.'));
        }
      };
      
      reader.onerror = (error) => {
        console.error('File reader error:', error);
        reject(new Error('Failed to read file.'));
      };
      
      reader.readAsText(file);
    });
  }

  private validateExportData(data: any): data is AdminDataExport {
    console.log('Validating data structure:', data);
    
    if (!data || typeof data !== 'object') {
      console.log('Invalid: data is not an object');
      return false;
    }
    
    if (!data.modes || typeof data.modes !== 'object') {
      console.log('Invalid: modes is missing or not an object');
      return false;
    }
    
    if (!data.modes.design || !data.modes.technical) {
      console.log('Invalid: design or technical mode missing');
      return false;
    }
    
    const designMode = data.modes.design;
    const technicalMode = data.modes.technical;
    
    // Check design mode structure
    if (!designMode.about || !designMode.contact || !Array.isArray(designMode.projects)) {
      console.log('Invalid: design mode structure incomplete');
      return false;
    }
    
    // Check technical mode structure  
    if (!technicalMode.about || !technicalMode.contact || !Array.isArray(technicalMode.projects)) {
      console.log('Invalid: technical mode structure incomplete');
      return false;
    }
    
    console.log('Validation passed');
    return true;
  }
}
