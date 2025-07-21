import { Inject, Injectable, OnDestroy, PLATFORM_ID } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, Observable, of, Subject, throwError, timer } from 'rxjs';
import { catchError, filter, finalize, map, switchMap, takeUntil, tap } from 'rxjs/operators';
import { MatSnackBar, MatSnackBarConfig, MatSnackBarRef, SimpleSnackBar } from '@angular/material/snack-bar';
import { TranslateService } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';

// Models
import { Notification, NotificationType } from '../../shared/models/notification.model';

// Constants
const NOTIFICATION_POLLING_INTERVAL = 5 * 60 * 1000; // 5 minutes
const DEFAULT_SNACKBAR_DURATION = 5000; // 5 seconds

type NotificationAction = (notification: Notification) => void;

@Injectable({
    providedIn: 'root'
})
export class NotificationService implements OnDestroy {
    private readonly apiUrl = '/api/notifications';
    private notificationsSubject = new BehaviorSubject<Notification[]>([]);
    private unreadCountSubject = new BehaviorSubject<number>(0);
    private loadingSubject = new BehaviorSubject<boolean>(false);
    private destroy$ = new Subject<void>();
    private snackBarRef: MatSnackBarRef<SimpleSnackBar> | null = null;

    // Public observables
    public readonly notifications$ = this.notificationsSubject.asObservable();
    public readonly unreadCount$ = this.unreadCountSubject.asObservable();
    public readonly loading$ = this.loadingSubject.asObservable();
    public readonly hasUnread$ = this.unreadCount$.pipe(map(count => count > 0));

    // Private state
    private isPolling = false;
    private pollingSubscription: any;
    private isBrowser: boolean;

    constructor(
        private http: HttpClient,
        @Inject(PLATFORM_ID) platformId: Object,
        private snackBar: MatSnackBar,
        private translate: TranslateService,
        private router: Router
    ) {
        this.isBrowser = isPlatformBrowser(platformId);
        if (this.isBrowser) {
            this.startPolling();
        }
    }

    ngOnDestroy(): void {
        this.stopPolling();
        this.destroy$.next();
        this.destroy$.complete();
    }

    // ========== NOTIFICATION FETCHING ==========

    /**
     * Fetch all notifications for the current user
     */
    getNotifications(): Observable<Notification[]> {
        this.loadingSubject.next(true);

        return this.http.get<Notification[]>(this.apiUrl).pipe(
            tap({
                next: notifications => {
                    this.notificationsSubject.next(notifications);
                    this.updateUnreadCount(notifications);
                },
                error: error => this.handleError('Failed to fetch notifications', error)
            }),
            finalize(() => this.loadingSubject.next(false))
        );
    }

    /**
     * Get a specific notification by ID
     */
    getNotificationById(id: string): Observable<Notification | undefined> {
        return this.notifications$.pipe(
            map(notifications => notifications.find(n => n.id === id)),
            switchMap(notification => {
                if (notification) {
                    return of(notification);
                }
                return this.http.get<Notification>(`${this.apiUrl}/${id}`);
            })
        );
    }

    // ========== NOTIFICATION ACTIONS ==========

    /**
     * Mark a notification as read
     */
    markAsRead(notificationId: string): Observable<Notification> {
        this.loadingSubject.next(true);

        return this.http.patch<Notification>(`${this.apiUrl}/${notificationId}/read`, {}).pipe(
            tap({
                next: updatedNotification => {
                    const notifications = this.notificationsSubject.value.map(n =>
                        n.id === notificationId ? updatedNotification : n
                    );
                    this.notificationsSubject.next(notifications);
                    this.updateUnreadCount(notifications);

                    // Execute action if defined
                    if (updatedNotification.action?.handler) {
                        updatedNotification.action.handler();
                    }
                },
                error: error => this.handleError('Failed to mark notification as read', error)
            }),
            finalize(() => this.loadingSubject.next(false))
        );
    }

    /**
     * Mark all notifications as read
     * @param silent If true, suppresses success/error messages
     */
    markAllAsRead(silent: boolean = false): Observable<void> {
        this.loadingSubject.next(true);

        return this.http.patch<void>(`${this.apiUrl}/mark-all-read`, {}).pipe(
            tap({
                next: () => {
                    const notifications = this.notificationsSubject.value.map(n => ({
                        ...n,
                        isRead: true
                    }));
                    this.notificationsSubject.next(notifications);
                    this.unreadCountSubject.next(0);
                    
                    if (!silent) {
                        this.showSuccess('All notifications marked as read');
                    }
                },
                error: error => {
                    if (!silent) {
                        this.handleError('Failed to mark notifications as read', error);
                    }
                }
            }),
            catchError(error => {
                console.error('Error marking notifications as read:', error);
                return throwError(() => error);
            }),
            finalize(() => this.loadingSubject.next(false))
        );
    }

    /**
     * Delete a notification
     */
    deleteNotification(notificationId: string, silent: boolean = false): Observable<void> {
        if (!notificationId) {
            const error = new Error('Notification ID is required');
            if (!silent) {
                this.showError('Invalid notification ID');
            }
            return throwError(() => error);
        }

        this.loadingSubject.next(true);

        return this.http.delete<void>(`${this.apiUrl}/${notificationId}`).pipe(
            tap({
                next: () => {
                    const notifications = this.notificationsSubject.value.filter(
                        n => n.id !== notificationId
                    );
                    this.notificationsSubject.next(notifications);
                    this.updateUnreadCount(notifications);
                    
                    if (!silent) {
                        this.showSuccess('Notification deleted');
                    }
                },
                error: error => {
                    if (!silent) {
                        this.handleError('Failed to delete notification', error);
                    }
                }
            }),
            catchError(error => {
                console.error('Error deleting notification:', error);
                return throwError(() => error);
            }),
            finalize(() => this.loadingSubject.next(false))
        );
    }
    
    /**
     * Delete all notifications for the current user
     * @param silent If true, suppresses success/error messages
     */
    deleteAllNotifications(silent: boolean = false): Observable<void> {
        this.loadingSubject.next(true);

        return this.http.delete<void>(`${this.apiUrl}/clear`).pipe(
            tap({
                next: () => {
                    this.notificationsSubject.next([]);
                    this.unreadCountSubject.next(0);
                    if (!silent) {
                        this.showSuccess('All notifications deleted');
                    }
                },
                error: error => {
                    if (!silent) {
                        this.handleError('Failed to delete notifications', error);
                    }
                }
            }),
            catchError(error => {
                console.error('Error deleting all notifications:', error);
                return throwError(() => error);
            }),
            finalize(() => this.loadingSubject.next(false))
        );
    }

    /**
     * Clear all notifications
     */
    clearAll(): Observable<void> {
        this.loadingSubject.next(true);

        return this.http.delete<void>(`${this.apiUrl}/clear`).pipe(
            tap({
                next: () => {
                    this.notificationsSubject.next([]);
                    this.unreadCountSubject.next(0);
                    this.showSuccess('All notifications cleared');
                },
                error: error => this.handleError('Failed to clear notifications', error)
            }),
            finalize(() => this.loadingSubject.next(false))
        );
    }

    // ========== SNACKBAR NOTIFICATIONS ==========

    /**
     * Show a snackbar notification
     */
    showNotification(
        message: string,
        action: string | null = 'OK',
        config: MatSnackBarConfig = {}
    ): MatSnackBarRef<SimpleSnackBar> | null {
        if (!this.isBrowser) {
            console.log('[Server] Notification:', message);
            return null;
        }

        try {
            // Dismiss any existing snackbar
            if ((this as any).snackBarRef) {
                (this as any).snackBarRef.dismiss();
            }

            // Set default config
            const defaultConfig: MatSnackBarConfig = {
                duration: DEFAULT_SNACKBAR_DURATION,
                horizontalPosition: 'right',
                verticalPosition: 'top',
                panelClass: ['notification-snackbar'],
                ...config
            };

            // Show the snackbar
            const snackBarRef = this.snackBar.open(
                this.translate.instant(message),
                action ? this.translate.instant(action) : undefined,
                defaultConfig
            );

            // Store the reference
            (this as any).snackBarRef = snackBarRef;

            // Handle action click
            if (action) {
                snackBarRef.onAction().subscribe({
                    next: () => {
                        snackBarRef.dismiss();
                        (this as any).snackBarRef = null;
                    },
                    error: (err) => console.error('Error in snackbar action', err)
                });
            }

            // Handle dismissal
            snackBarRef.afterDismissed().subscribe(() => {
                if ((this as any).snackBarRef === snackBarRef) {
                    (this as any).snackBarRef = null;
                }
            });

            return snackBarRef;
        } catch (error) {
            console.error('Error showing snackbar', error);
            return null;
        }
    }

    /**
     * Show an error notification
     */
    showError(message: string, action: string | null = 'Dismiss'): MatSnackBarRef<SimpleSnackBar> | null {
        const ref = this.showNotification(message, action, {
            panelClass: ['error-snackbar'],
            duration: 10000 // Longer duration for errors
        });
        return ref || null;
    }

    /**
     * Show a success notification
     */
    showSuccess(message: string, action: string | null = 'OK'): MatSnackBarRef<SimpleSnackBar> | null {
        const ref = this.showNotification(message, action, {
            panelClass: ['success-snackbar']
        });
        return ref || null;
    }

    /**
     * Show a warning notification
     */
    showWarning(message: string, action: string | null = 'OK'): MatSnackBarRef<SimpleSnackBar> | null {
        const ref = this.showNotification(message, action, {
            panelClass: ['warning-snackbar']
        });
        return ref || null;
    }

    /**
     * Show an info notification
     */
    showInfo(message: string, action: string | null = 'OK'): MatSnackBarRef<SimpleSnackBar> | null {
        const ref = this.showNotification(message, action, {
            panelClass: ['info-snackbar']
        });
        return ref || null;
    }

    // ========== POLLING ==========

    /**
     * Start polling for new notifications
     */
    startPolling(intervalMs: number = NOTIFICATION_POLLING_INTERVAL): void {
        if (this.isPolling) {
            console.warn('Notification polling is already active');
            return;
        }

        this.isPolling = true;

        // Initial fetch
        this.getNotifications().subscribe();

        // Set up polling
        this.pollingSubscription = timer(intervalMs, intervalMs).pipe(
            takeUntil(this.destroy$),
            switchMap(() => this.getNotifications())
        ).subscribe();
    }

    /**
     * Stop polling for notifications
     */
    stopPolling(): void {
        if (this.pollingSubscription) {
            this.pollingSubscription.unsubscribe();
            this.pollingSubscription = null;
        }
        this.isPolling = false;
    }

    /**
     * Update the polling interval
     */
    setPollingInterval(intervalMs: number): void {
        if (this.isPolling) {
            this.stopPolling();
            this.startPolling(intervalMs);
        }
    }

    // ========== PRIVATE METHODS ==========

    /**
     * Update the unread count based on notifications
     */
    private updateUnreadCount(notifications: Notification[]): void {
        const unreadCount = notifications.filter(n => !n.read).length;
        this.unreadCountSubject.next(unreadCount);
    }

    /**
     * Handle API errors
     */
    private handleError(context: string, error: HttpErrorResponse): Observable<never> {
        console.error(`${context}:`, error);

        let errorMessage = 'An error occurred';
        if (error.error?.message) {
            errorMessage = error.error.message;
        } else if (error.message) {
            errorMessage = error.message;
        }

        this.showError(`${context}: ${errorMessage}`);
        return throwError(() => error);
    }

    // ========== HELPER METHODS ==========

    /**
     * Get unread notifications
     */
    getUnreadNotifications(): Observable<Notification[]> {
        return this.notifications$.pipe(
            map(notifications => notifications.filter(n => !n.read))
        );
    }

    /**
     * Get notifications by type
     */
    getNotificationsByType(type: NotificationType): Observable<Notification[]> {
        return this.notifications$.pipe(
            map(notifications => notifications.filter(n => n.type === type))
        );
    }

    /**
     * Get the most recent notifications
     * @param limit Maximum number of notifications to return
     */
    getRecentNotifications(limit: number = 5): Observable<Notification[]> {
        return this.notifications$.pipe(
            map(notifications => {
                // Sort by creation date (newest first)
                const sorted = [...notifications].sort((a, b) =>
                    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
                );

                // Return limited results
                return sorted.slice(0, limit);
            })
        );
    }
}
