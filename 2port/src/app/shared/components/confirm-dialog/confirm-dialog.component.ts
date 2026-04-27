import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface ConfirmDialogData {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info';
}

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="confirm-dialog-overlay" [class.active]="visible()" (click)="onOverlayClick($event)">
      <div class="confirm-dialog" [class.active]="visible()" [class]="type()">
        <div class="confirm-dialog-header">
          <h3 class="confirm-dialog-title">{{ data().title }}</h3>
          <button class="confirm-dialog-close" (click)="cancel()" aria-label="Close">
            <span>×</span>
          </button>
        </div>
        
        <div class="confirm-dialog-body">
          <p class="confirm-dialog-message">{{ data().message }}</p>
        </div>
        
        <div class="confirm-dialog-footer">
          <button class="btn btn-outline-secondary" (click)="cancel()">
            {{ data().cancelText || 'Cancel' }}
          </button>
          <button 
            class="btn" 
            [class]="'btn-' + (type() === 'danger' ? 'danger' : type() === 'warning' ? 'warning' : 'primary')"
            (click)="confirm()"
          >
            {{ data().confirmText || 'Confirm' }}
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .confirm-dialog-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 9999;
      opacity: 0;
      visibility: hidden;
      transition: all 0.3s ease;
      backdrop-filter: blur(4px);
    }
    
    .confirm-dialog-overlay.active {
      opacity: 1;
      visibility: visible;
    }
    
    .confirm-dialog {
      background: white;
      border-radius: 12px;
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
      max-width: 500px;
      width: 90%;
      max-height: 90vh;
      overflow: hidden;
      transform: scale(0.9) translateY(20px);
      transition: all 0.3s ease;
      border: 1px solid rgba(0, 0, 0, 0.1);
    }
    
    .confirm-dialog.active {
      transform: scale(1) translateY(0);
    }
    
    .confirm-dialog.danger {
      border-top: 4px solid #dc3545;
    }
    
    .confirm-dialog.warning {
      border-top: 4px solid #ffc107;
    }
    
    .confirm-dialog.info {
      border-top: 4px solid #0dcaf0;
    }
    
    .confirm-dialog-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 1.5rem 1.5rem 1rem;
      border-bottom: 1px solid #e9ecef;
    }
    
    .confirm-dialog-title {
      margin: 0;
      font-size: 1.25rem;
      font-weight: 600;
      color: #212529;
    }
    
    .confirm-dialog-close {
      background: none;
      border: none;
      font-size: 1.5rem;
      color: #6c757d;
      cursor: pointer;
      padding: 0;
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 6px;
      transition: all 0.2s ease;
    }
    
    .confirm-dialog-close:hover {
      background: #f8f9fa;
      color: #495057;
    }
    
    .confirm-dialog-body {
      padding: 1rem 1.5rem;
    }
    
    .confirm-dialog-message {
      margin: 0;
      color: #495057;
      line-height: 1.5;
    }
    
    .confirm-dialog-footer {
      display: flex;
      gap: 0.75rem;
      justify-content: flex-end;
      padding: 1rem 1.5rem 1.5rem;
      border-top: 1px solid #e9ecef;
    }
    
    @media (max-width: 576px) {
      .confirm-dialog {
        width: 95%;
        margin: 1rem;
      }
      
      .confirm-dialog-footer {
        flex-direction: column;
      }
      
      .confirm-dialog-footer .btn {
        width: 100%;
      }
    }
  `]
})
export class ConfirmDialogComponent {
  visible = signal(false);
  data = signal<ConfirmDialogData>({
    title: 'Confirm Action',
    message: 'Are you sure you want to proceed?',
    type: 'info'
  });
  
  type = signal<'danger' | 'warning' | 'info'>('info');
  
  private resolvePromise: ((value: boolean) => void) | null = null;
  
  show(data: ConfirmDialogData): Promise<boolean> {
    this.data.set({ ...data, type: data.type || 'info' });
    this.type.set(data.type || 'info');
    this.visible.set(true);
    
    return new Promise<boolean>((resolve) => {
      this.resolvePromise = resolve;
    });
  }
  
  confirm(): void {
    this.visible.set(false);
    if (this.resolvePromise) {
      this.resolvePromise(true);
      this.resolvePromise = null;
    }
  }
  
  cancel(): void {
    this.visible.set(false);
    if (this.resolvePromise) {
      this.resolvePromise(false);
      this.resolvePromise = null;
    }
  }
  
  onOverlayClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.cancel();
    }
  }
}
