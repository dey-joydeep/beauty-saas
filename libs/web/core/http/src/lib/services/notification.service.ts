import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface NotificationItem {
  readonly id: string;
  readonly title: string;
  readonly message: string;
  readonly type: 'info' | 'success' | 'warning' | 'error';
  readonly createdAt: Date;
  readonly read: boolean;
}

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private items: NotificationItem[] = [];
  private readonly items$ = new BehaviorSubject<NotificationItem[]>([]);

  readonly notifications$ = this.items$.asObservable();

  add(notification: Partial<NotificationItem>): NotificationItem {
    const item: NotificationItem = {
      id: Math.random().toString(36).substring(2, 9),
      title: notification.title ?? '',
      message: notification.message ?? '',
      type: notification.type ?? 'info',
      createdAt: new Date(),
      read: false,
    };
    this.items = [item, ...this.items];
    this.items$.next([...this.items]);
    return item;
  }

  showError(message: string, title: string = 'Error'): void {
    this.add({ title, message, type: 'error' });
  }

  showSuccess(message: string, title: string = 'Success'): void {
    this.add({ title, message, type: 'success' });
  }
}
