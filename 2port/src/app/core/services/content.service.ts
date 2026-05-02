import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import type { AboutContent, ContactContent, PortfolioMode, Project } from '../models/portfolio.models';
import { StorageService } from './storage.service';
import { AssetFileService } from './asset-file.service';

type ModeContent = {
  about: AboutContent;
  contact: ContactContent;
  projects: Project[];
};

const CONTENT_VERSION = 1;
const KEY = (mode: PortfolioMode) => `portfolio.content.${mode}.v${CONTENT_VERSION}`;

@Injectable({ providedIn: 'root' })
export class ContentService {
  private readonly http = inject(HttpClient);
  private readonly storage = inject(StorageService);
  private readonly assetFile = inject(AssetFileService);

  async ensureSeeded(mode: PortfolioMode): Promise<void> {
    const existing = this.storage.getJson<ModeContent>(KEY(mode));
    if (existing) return;

    const [about, contact, projects] = await Promise.all([
      firstValueFrom(this.http.get<AboutContent>(`assets/data/${mode}/about.json`)),
      firstValueFrom(this.http.get<ContactContent>(`assets/data/${mode}/contact.json`)),
      firstValueFrom(this.http.get<Project[]>(`assets/data/${mode}/projects.json`)),
    ]);

    this.storage.setJson(KEY(mode), { about, contact, projects });
  }

  async getModeContent(mode: PortfolioMode): Promise<ModeContent> {
    await this.ensureSeeded(mode);
    const data = this.storage.getJson<ModeContent>(KEY(mode));
    if (!data) throw new Error(`Missing content for mode: ${mode}`);
    return data;
  }

  async updateAbout(mode: PortfolioMode, about: AboutContent): Promise<void> {
    const data = await this.getModeContent(mode);
    this.storage.setJson(KEY(mode), { ...data, about });
  }

  async updateContact(mode: PortfolioMode, contact: ContactContent): Promise<void> {
    const data = await this.getModeContent(mode);
    this.storage.setJson(KEY(mode), { ...data, contact });
  }

  async upsertProject(mode: PortfolioMode, project: Project): Promise<void> {
    const data = await this.getModeContent(mode);
    const idx = data.projects.findIndex((p) => p.id === project.id);
    const next =
      idx >= 0
        ? data.projects.map((p) => (p.id === project.id ? project : p))
        : [{ ...project }, ...data.projects];
    this.storage.setJson(KEY(mode), { ...data, projects: next });
  }

  async deleteProject(mode: PortfolioMode, projectId: string): Promise<void> {
    const data = await this.getModeContent(mode);
    this.storage.setJson(KEY(mode), { ...data, projects: data.projects.filter((p) => p.id !== projectId) });
  }

  async resetMode(mode: PortfolioMode): Promise<void> {
    this.storage.remove(KEY(mode));
    await this.ensureSeeded(mode);
  }
}

