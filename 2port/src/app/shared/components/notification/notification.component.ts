import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface NotificationData {
  message: string;
  type?: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
}

@Component({
  selector: 'app-notification',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="notification-container">
      @for (notification of notifications(); track notification.id) {
        <div 
          class="notification" 
          [class]="notification.type"
          [class.active]="notification.visible"
          (click)="removeNotification(notification.id)"
        >
          <div class="notification-icon">
            @switch (notification.type) {
              @case ('success') { <span>✓</span> }
              @case ('error') { <span>✕</span> }
              @case ('warning') { <span>!</span> }
              @default { <span>i</span> }
            }
          </div>
          <div class="notification-content">
            <div class="notification-message">{{ notification.message }}</div>
          </div>
          <button class="notification-close" (click)="removeNotification(notification.id)">
            <span>×</span>
          </button>
        </div>
      }
    </div>
  `,
  styles: [`
    .notification-container {
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 10000;
      display: flex;
      flex-direction: column;
      gap: 10px;
      pointer-events: none;
    }
    
    .notification {
      background: white;
      border-radius: 8px;
      box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
      padding: 16px;
      min-width: 300px;
      max-width: 400px;
      display: flex;
      align-items: center;
      gap: 12px;
      pointer-events: all;
      transform: translateX(100%);
      opacity: 0;
      transition: all 0.3s ease;
      border-left: 4px solid #e9ecef;
      position: relative;
      overflow: hidden;
    }
    
    .notification.active {
      transform: translateX(0);
      opacity: 1;
    }
    
    .notification.success {
      border-left-color: #28a745;
      background: linear-gradient(135deg, #f8fff9 0%, #ffffff 100%);
    }
    
    .notification.error {
      border-left-color: #dc3545;
      background: linear-gradient(135deg, #fff8f8 0%, #ffffff 100%);
    }
    
    .notification.warning {
      border-left-color: #ffc107;
      background: linear-gradient(135deg, #fffdf7 0%, #ffffff 100%);
    }
    
    .notification.info {
      border-left-color: #17a2b8;
      background: linear-gradient(135deg, #f8fdff 0%, #ffffff 100%);
    }
    
    .notification-icon {
      width: 24px;
      height: 24px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
      font-size: 14px;
      flex-shrink: 0;
    }
    
    .notification.success .notification-icon {
      background: #28a745;
      color: white;
    }
    
    .notification.error .notification-icon {
      background: #dc3545;
      color: white;
    }
    
    .notification.warning .notification-icon {
      background: #ffc107;
      color: #212529;
    }
    
    .notification.info .notification-icon {
      background: #17a2b8;
      color: white;
    }
    
    .notification-content {
      flex: 1;
      min-width: 0;
    }
    
    .notification-message {
      margin: 0;
      font-size: 14px;
      line-height: 1.4;
      color: #495057;
      font-weight: 500;
    }
    
    .notification-close {
      background: none;
      border: none;
      color: #6c757d;
      cursor: pointer;
      padding: 4px;
      border-radius: 4px;
      font-size: 18px;
      line-height: 1;
      opacity: 0.7;
      transition: all 0.2s ease;
      flex-shrink: 0;
    }
    
    .notification-close:hover {
      opacity: 1;
      background: rgba(0, 0, 0, 0.05);
    }
    
    @media (max-width: 576px) {
      .notification-container {
        top: 10px;
        right: 10px;
        left: 10px;
      }
      
      .notification {
        min-width: auto;
        max-width: none;
      }
    }
  `]
})
export class NotificationComponent {
  notifications = signal<Array<{
    id: string;
    message: string;
    type: 'success' | 'error' | 'warning' | 'info';
    visible: boolean;
    timeoutId?: number;
  }>>([]);
  
  show(data: NotificationData): void {
    const id = Date.now().toString();
    const notification = {
      id,
      message: data.message,
      type: data.type || 'info',
      visible: false
    };
    
    this.notifications.update(notifications => [...notifications, notification]);
    
    // Trigger animation
    setTimeout(() => {
      this.notifications.update(notifications => 
        notifications.map(n => n.id === id ? { ...n, visible: true } : n)
      );
    }, 50);
    
    // Auto remove
    const duration = data.duration || 4000;
    const timeoutId = window.setTimeout(() => {
      this.removeNotification(id);
    }, duration);
    
    this.notifications.update(notifications => 
      notifications.map(n => n.id === id ? { ...n, timeoutId } : n)
    );
  }
  
  removeNotification(id: string): void {
    const notification = this.notifications().find(n => n.id === id);
    if (notification?.timeoutId) {
      clearTimeout(notification.timeoutId);
    }
    
    this.notifications.update(notifications => 
      notifications.map(n => n.id === id ? { ...n, visible: false } : n)
    );
    
    setTimeout(() => {
      this.notifications.update(notifications => notifications.filter(n => n.id !== id));
    }, 300);
  }
  
  success(message: string, duration?: number): void {
    this.show({ message, type: 'success', duration });
  }
  
  error(message: string, duration?: number): void {
    this.show({ message, type: 'error', duration });
  }
  
  warning(message: string, duration?: number): void {
    this.show({ message, type: 'warning', duration });
  }
  
  info(message: string, duration?: number): void {
    this.show({ message, type: 'info', duration });
  }
}
