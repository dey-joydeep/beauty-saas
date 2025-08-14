import { isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, Observable, Subject, throwError } from 'rxjs';
import { catchError, finalize, map, tap } from 'rxjs/operators';
import { Notification } from '../models/notification.model';

@Injectable({
  providedIn: 'root'
})
export class NotificationService implements OnDestroy {
  private readonly apiUrl = '/api/notifications';
  private notificationsSubject = new BehaviorSubject<Notification[]>([]);
  private unreadCountSubject = new BehaviorSubject<number>(0);
  private loadingSubject = new BehaviorSubject<boolean>(false);
  private destroy$ = new Subject<void>();
  private isBrowser: boolean;

  // Public observables
  public readonly notifications$ = this.notificationsSubject.asObservable();
  public readonly unreadCount$ = this.unreadCountSubject.asObservable();
  public readonly loading$ = this.loadingSubject.asObservable();
  public readonly hasUnread$ = this.unreadCount$.pipe(map(count => count > 0));

  private readonly platformId: Object;

  constructor(
    platformId: Object,
    private http: HttpClient
  ) {
    this.platformId = platformId;
    this.isBrowser = isPlatformBrowser(platformId);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // Core notification methods
  public getNotifications(): Observable<Notification[]> {
    this.loadingSubject.next(true);
    
    return this.http.get<Notification[]>(this.apiUrl).pipe(
      tap(notifications => {
        this.notificationsSubject.next(notifications);
        this.updateUnreadCount(notifications);
      }),
      catchError(this.handleError),
      finalize(() => this.loadingSubject.next(false))
    );
  }

  public markAsRead(notificationId: string): Observable<Notification> {
    return this.http.patch<Notification>(`${this.apiUrl}/${notificationId}/read`, {}).pipe(
      tap(updatedNotification => {
        const notifications = this.notificationsSubject.value.map(n => 
          n.id === notificationId ? updatedNotification : n
        );
        this.notificationsSubject.next(notifications);
        this.updateUnreadCount(notifications);
      }),
      catchError(this.handleError)
    );
  }

  public markAllAsRead(): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/read-all`, {}).pipe(
      tap(() => {
        const notifications = this.notificationsSubject.value.map(n => ({
          ...n,
          read: true
        }));
        this.notificationsSubject.next(notifications);
        this.updateUnreadCount(notifications);
      }),
      catchError(this.handleError)
    );
  }

  public addNotification(notification: Partial<Notification>): void {
    const newNotification: Notification = {
      id: Math.random().toString(36).substr(2, 9),
      title: notification.title || '',
      message: notification.message || '',
      type: notification.type || 'info',
      read: false,
      createdAt: new Date(),
      ...notification
    };

    const currentNotifications = this.notificationsSubject.value;
    this.notificationsSubject.next([newNotification, ...currentNotifications]);
    this.updateUnreadCount([newNotification, ...currentNotifications]);
  }

  // Helper methods
  private updateUnreadCount(notifications: Notification[]): void {
    const unreadCount = notifications.filter(n => !n.read).length;
    this.unreadCountSubject.next(unreadCount);
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    console.error('NotificationService error:', error);
    return throwError(() => new Error('Something went wrong with notifications. Please try again later.'));
  }

  /**
   * Show an error notification
   * @param message The error message to display
   * @param title Optional title for the notification (defaults to 'Error')
   */
  public showError(message: string, title: string = 'Error'): void {
    this.addNotification({
      title,
      message,
      type: 'error'
    });
  }
}
