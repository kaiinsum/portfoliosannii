import { Component, computed, effect, inject, signal, ViewChild } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Title } from '@angular/platform-browser';
import type { AboutContent, ContactContent, PortfolioMode, Project } from '../../../../core/models/portfolio.models';
import { AuthService } from '../../../../core/services/auth.service';
import { ContentService } from '../../../../core/services/content.service';
import { AssetService } from '../../../../core/services/asset.service';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';
import { NotificationComponent } from '../../../../shared/components/notification/notification.component';

function newId(prefix = 'p'): string {
  const id =
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  return `${prefix}-${id}`;
}

@Component({
  selector: 'app-admin-dashboard-page',
  imports: [ReactiveFormsModule, RouterLink, ConfirmDialogComponent, NotificationComponent],
  template: `
    <div class="admin-dashboard">
      <div class="container py-4">
        <!-- Header -->
        <div class="admin-header">
          <div class="admin-header-content">
            <div class="admin-title">
              <h1 class="admin-heading">
                <span class="admin-icon">🎨</span>
                Admin Dashboard
              </h1>
              <p class="admin-subtitle">Edit About / Projects / Contact for both modes</p>
            </div>
            <div class="admin-actions">
              <a class="btn btn-outline-secondary btn-fancy" routerLink="/">
                <span class="btn-icon">🏠</span>
                Back to site
              </a>
              <button class="btn btn-outline-danger btn-fancy" type="button" (click)="logout()">
                <span class="btn-icon">🚪</span>
                Logout
              </button>
            </div>
          </div>
        </div>

      <div class="card border-0 shadow-sm mb-3">
        <div class="card-body p-3 d-flex flex-wrap align-items-center gap-2 justify-content-between">
          <div class="small text-secondary">Mode</div>
          <div class="btn-group" role="group" aria-label="mode">
            <button class="btn btn-sm" [class.btn-primary]="mode() === 'design'" [class.btn-outline-secondary]="mode() !== 'design'" (click)="setMode('design')">
              Design
            </button>
            <button class="btn btn-sm" [class.btn-primary]="mode() === 'technical'" [class.btn-outline-secondary]="mode() !== 'technical'" (click)="setMode('technical')">
              Technical
            </button>
          </div>
          <button class="btn btn-sm btn-outline-secondary ms-auto" type="button" (click)="resetMode()">
            Reset this mode to JSON defaults
          </button>
        </div>
      </div>

      <div class="row g-3">
        <div class="col-12 col-lg-6">
          <div class="card border-0 shadow-sm h-100">
            <div class="card-body p-4">
              <h2 class="h6 text-uppercase text-secondary mb-3">About</h2>
              <form [formGroup]="aboutForm" (ngSubmit)="saveAbout()">
                <div class="mb-2">
                  <label class="form-label">Heading</label>
                  <input class="form-control" formControlName="heading" />
                </div>
                <div class="mb-2">
                  <label class="form-label">Intro</label>
                  <textarea class="form-control" formControlName="intro" rows="4"></textarea>
                </div>
                <div class="mb-2">
                  <label class="form-label">Tags (comma separated)</label>
                  <input class="form-control" formControlName="tags" />
                </div>
                <div class="mb-3">
                  <label class="form-label">Avatar path</label>
                  <input class="form-control" formControlName="avatar" />
                  <div class="form-text">Example: <code>assets/avatar/avatar.svg</code></div>
                </div>
                <div class="mb-3">
                  <label class="form-label">Upload avatar (optional)</label>
                  <input class="form-control" type="file" accept="image/*" (change)="onAvatarUpload($event)" />
                  <div class="form-text">Saved to browser storage as a data URL (per mode).</div>
                </div>
                <button class="btn btn-primary" type="submit" [disabled]="aboutForm.invalid">Save About</button>
              </form>
            </div>
          </div>
        </div>

        <div class="col-12 col-lg-6">
          <div class="card border-0 shadow-sm h-100">
            <div class="card-body p-4">
              <h2 class="h6 text-uppercase text-secondary mb-3">Contact</h2>
              <form [formGroup]="contactForm" (ngSubmit)="saveContact()">
                <div class="mb-2">
                  <label class="form-label">Email</label>
                  <input class="form-control" formControlName="email" />
                </div>
                <div class="mb-3">
                  <label class="form-label">Social links (one per line: Label|https://...)</label>
                  <textarea class="form-control" formControlName="socials" rows="6"></textarea>
                </div>
                <button class="btn btn-primary" type="submit" [disabled]="contactForm.invalid">Save Contact</button>
              </form>
            </div>
          </div>
        </div>

        <div class="col-12">
          <div class="card border-0 shadow-sm">
            <div class="card-body p-4">
              <div class="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-3">
                <h2 class="h6 text-uppercase text-secondary mb-0">Projects</h2>
                <button class="btn btn-sm btn-outline-primary" type="button" (click)="startCreate()">Add project</button>
              </div>

              <div class="row g-2 mb-4">
                @for (p of projects(); track p.id) {
                  <div class="col-12 col-md-6 col-xl-4">
                    <div class="border rounded p-3 h-100">
                      <div class="d-flex justify-content-between gap-2">
                        <div class="fw-semibold">{{ p.title }}</div>
                        <div class="d-flex gap-2">
                          <button class="btn btn-sm btn-outline-secondary" type="button" (click)="startEdit(p)">Edit</button>
                          <button class="btn btn-sm btn-outline-danger btn-fancy" type="button" (click)="confirmDelete(p.id)">
                          <span class="btn-icon">🗑️</span>
                          Delete
                        </button>
                        </div>
                      </div>
                      <div class="small text-secondary mt-1">{{ p.id }}</div>
                    </div>
                  </div>
                }
              </div>

              <div class="border rounded p-3">
                <div class="d-flex justify-content-between align-items-center mb-2">
                  <div class="fw-semibold">{{ editorTitle() }}</div>
                  <button class="btn btn-sm btn-outline-secondary" type="button" (click)="cancelEdit()">Clear</button>
                </div>
                <form [formGroup]="projectForm" (ngSubmit)="saveProject()">
                  <div class="row g-2">
                    <div class="col-12 col-lg-6">
                      <label class="form-label">Title</label>
                      <input class="form-control" formControlName="title" />
                    </div>
                    <div class="col-12 col-lg-6">
                      <label class="form-label">Image path</label>
                      <input class="form-control" formControlName="image" />
                      <div class="form-text">
                        Or upload below (saved to browser storage as a data URL).
                      </div>
                    </div>
                    <div class="col-12">
                      <label class="form-label">Description</label>
                      <textarea class="form-control" rows="3" formControlName="description"></textarea>
                    </div>
                    <div class="col-12 col-lg-6">
                      <label class="form-label">Tech stack (comma separated)</label>
                      <input class="form-control" formControlName="techStack" />
                    </div>
                    <div class="col-12 col-lg-6">
                      <label class="form-label">Links (one per line: Label|https://...)</label>
                      <textarea class="form-control" rows="3" formControlName="links"></textarea>
                    </div>
                    <div class="col-12 col-lg-6">
                      <label class="form-label">Project Date</label>
                      <input class="form-control" type="date" formControlName="date" />
                      <div class="form-text">Used for sorting projects (newest first). Featured projects always appear first regardless of date.</div>
                    </div>
                    <div class="col-12 col-lg-6">
                      <label class="form-label">Upload main image (optional)</label>
                      <input class="form-control" type="file" accept="image/*" (change)="onImageUpload($event)" />
                      <div class="form-text">Tip: large files may exceed browser storage limits.</div>
                    </div>
                    <div class="col-12">
                      <label class="form-label">Additional Images</label>
                      <div class="mb-3">
                        <input class="form-control" type="file" accept="image/*" multiple (change)="onMultipleImageUpload($event)" />
                        <div class="form-text">Upload multiple images at once. These will appear as sub-images in the project gallery.</div>
                      </div>
                      
                      <!-- Current Images Display -->
                      @if (currentProjectImages().length > 0) {
                        <div class="border rounded p-3">
                          <h6 class="mb-3">Current Images</h6>
                          <div class="row g-2">
                            @for (img of currentProjectImages(); track $index) {
                              <div class="col-6 col-md-4 col-lg-3">
                                <div class="position-relative">
                                  <img [src]="img" class="img-fluid rounded border" alt="Project image" />
                                  <button type="button" class="btn btn-sm btn-danger position-absolute top-0 end-0 m-1" (click)="removeProjectImage($index)">
                                    <span class="visually-hidden">Remove</span>
                                    <span>×</span>
                                  </button>
                                </div>
                              </div>
                            }
                          </div>
                        </div>
                      }
                    </div>
                    <div class="col-12 col-lg-6">
                      <div class="form-check mt-2">
                        <input class="form-check-input" type="checkbox" id="featured" formControlName="featured" />
                        <label class="form-check-label" for="featured">Featured</label>
                      </div>
                    </div>
                    <div class="col-12">
                      <button class="btn btn-primary" type="submit" [disabled]="projectForm.invalid">Save project</button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
      </div>
      
      <!-- Confirmation Dialog -->
      <app-confirm-dialog #confirmDialog />
      
      <!-- Notification Component -->
      <app-notification #notification />
    </div>
  `,
  styleUrl: './admin-dashboard.page.css',
})
export class AdminDashboardPage {
  private readonly auth = inject(AuthService);
  private readonly content = inject(ContentService);
  private readonly title = inject(Title);
  private readonly assetService = inject(AssetService);
  
  @ViewChild('confirmDialog') confirmDialog!: ConfirmDialogComponent;
  @ViewChild('notification') notification!: NotificationComponent;

  readonly mode = signal<PortfolioMode>('design');

  readonly aboutForm = new FormGroup({
    heading: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    intro: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    tags: new FormControl('', { nonNullable: true }),
    avatar: new FormControl('assets/avatar/avatar.svg', { nonNullable: true, validators: [Validators.required] }),
  });

  readonly contactForm = new FormGroup({
    email: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.email] }),
    socials: new FormControl('', { nonNullable: true }),
  });

  readonly projects = signal<Project[]>([]);
  private editingId: string | null = null;

  readonly editorTitle = computed(() => (this.editingId ? `Edit project (${this.editingId})` : 'Create new project'));

  readonly projectForm = new FormGroup({
    title: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    image: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    images: new FormControl<string[]>([]),
    description: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    techStack: new FormControl('', { nonNullable: true }),
    links: new FormControl('', { nonNullable: true }),
    featured: new FormControl(false, { nonNullable: true }),
    date: new FormControl('', { nonNullable: true }),
  });

  readonly currentProjectImages = signal<string[]>([]);

  constructor() {
    this.title.setTitle('Admin dashboard');
    effect(() => void this.load());
  }

  setMode(m: PortfolioMode): void {
    this.mode.set(m);
  }

  logout(): void {
    this.auth.logout();
    location.assign('/admin/login');
  }

  async resetMode(): Promise<void> {
    await this.content.resetMode(this.mode());
    await this.load();
  }

  async saveAbout(): Promise<void> {
    try {
      const raw = this.aboutForm.getRawValue();
      const about: AboutContent = {
        heading: raw.heading,
        intro: raw.intro,
        tags: raw.tags
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean),
        avatar: raw.avatar,
      };
      await this.content.updateAbout(this.mode(), about);
      await this.load();
      this.notification.success('About section updated successfully');
    } catch (error) {
      this.notification.error('Failed to update about section. Please try again.');
    }
  }

  async onAvatarUpload(ev: Event): Promise<void> {
    const input = ev.target as HTMLInputElement | null;
    const file = input?.files?.item(0) ?? null;
    if (!file) return;

    try {
      const assetUrl = await this.assetService.saveAsset(file, 'avatar');
      this.aboutForm.patchValue({ avatar: assetUrl });
      this.notification.success('Avatar updated successfully');
    } catch (error) {
      this.notification.error('Failed to update avatar');
    }
    
    if (input) input.value = '';
  }

  async saveContact(): Promise<void> {
    try {
      const raw = this.contactForm.getRawValue();
      const contact: ContactContent = {
        email: raw.email,
        socials: raw.socials
          .split('\n')
          .map((l) => l.trim())
          .filter(Boolean)
          .map((l) => {
            const [label, url] = l.split('|').map((x) => x.trim());
            return { label: label || url, url };
          })
          .filter((s) => !!s.url),
      };
      await this.content.updateContact(this.mode(), contact);
      await this.load();
      this.notification.success('Contact information updated successfully');
    } catch (error) {
      this.notification.error('Failed to update contact information. Please try again.');
    }
  }

  startCreate(): void {
    this.editingId = null;
    this.currentProjectImages.set([]);
    this.projectForm.reset({
      title: '',
      image: '',
      images: [],
      description: '',
      techStack: '',
      links: '',
      featured: false,
      date: '',
    });
  }

  startEdit(p: Project): void {
    this.editingId = p.id;
    this.currentProjectImages.set(p.images || []);
    this.projectForm.reset({
      title: p.title,
      image: p.image,
      images: p.images || [],
      description: p.description,
      techStack: p.techStack.join(', '),
      links: p.links.map((l) => `${l.label}|${l.url}`).join('\n'),
      featured: !!p.featured,
      date: p.date || '',
    });
  }

  cancelEdit(): void {
    this.startCreate();
  }

  async saveProject(): Promise<void> {
    try {
      const raw = this.projectForm.getRawValue();
      const project: Project = {
        id: this.editingId ?? newId(this.mode() === 'design' ? 'd' : 't'),
        title: raw.title,
        description: raw.description,
        image: raw.image,
        images: raw.images || [],
        techStack: raw.techStack
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean),
        links: raw.links
          .split('\n')
          .map((l) => l.trim())
          .filter(Boolean)
          .map((l) => {
            const [label, url] = l.split('|').map((x) => x.trim());
            return { label: label || url, url };
          })
          .filter((s) => !!s.url),
        featured: !!raw.featured,
        date: raw.date || undefined,
      };
      await this.content.upsertProject(this.mode(), project);
      await this.load();
      this.startCreate();
      
      const action = this.editingId ? 'updated' : 'created';
      this.notification.success(`Project "${project.title}" ${action} successfully`);
    } catch (error) {
      this.notification.error('Failed to save project. Please try again.');
    }
  }

  async confirmDelete(id: string): Promise<void> {
    const project = this.projects().find(p => p.id === id);
    if (!project) return;
    
    const confirmed = await this.confirmDialog.show({
      title: 'Delete Project',
      message: `Are you sure you want to delete "${project.title}"? This action cannot be undone.`,
      confirmText: 'Delete',
      cancelText: 'Cancel',
      type: 'danger'
    });
    
    if (confirmed) {
      try {
        await this.content.deleteProject(this.mode(), id);
        await this.load();
        this.notification.success(`Project "${project.title}" deleted successfully`);
      } catch (error) {
        this.notification.error('Failed to delete project. Please try again.');
      }
    }
  }

  async remove(id: string): Promise<void> {
    await this.content.deleteProject(this.mode(), id);
    await this.load();
  }

  async onImageUpload(ev: Event): Promise<void> {
    const input = ev.target as HTMLInputElement | null;
    const file = input?.files?.item(0) ?? null;
    if (!file) return;

    try {
      const assetUrl = await this.assetService.saveAsset(file, 'projects');
      this.projectForm.patchValue({ image: assetUrl });
      this.notification.success('Image uploaded successfully');
    } catch (error) {
      this.notification.error('Failed to upload image');
    }

    if (input) input.value = '';
  }

  async onMultipleImageUpload(ev: Event): Promise<void> {
    const input = ev.target as HTMLInputElement | null;
    const files = input?.files;
    if (!files || files.length === 0) return;

    try {
      const newImages = await this.assetService.saveMultipleAssets(files, 'projects');
      
      // Add new images to existing ones
      const currentImages = this.currentProjectImages();
      this.currentProjectImages.set([...currentImages, ...newImages]);
      this.projectForm.patchValue({ images: this.currentProjectImages() });
      
      this.notification.success(`${files.length} images uploaded successfully`);
    } catch (error) {
      this.notification.error('Failed to upload images');
    }

    if (input) input.value = '';
  }

  removeProjectImage(index: number): void {
    const currentImages = this.currentProjectImages();
    const newImages = currentImages.filter((_, i) => i !== index);
    this.currentProjectImages.set(newImages);
    this.projectForm.patchValue({ images: newImages });
  }

  private async load(): Promise<void> {
    const data = await this.content.getModeContent(this.mode());
    this.projects.set(data.projects);

    this.aboutForm.reset({
      heading: data.about.heading,
      intro: data.about.intro,
      tags: data.about.tags.join(', '),
      avatar: data.about.avatar,
    });

    this.contactForm.reset({
      email: data.contact.email,
      socials: data.contact.socials.map((s) => `${s.label}|${s.url}`).join('\n'),
    });
  }

  }

