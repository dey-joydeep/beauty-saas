import { Component, OnInit, OnDestroy, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatBadgeModule } from '@angular/material/badge';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Subscription, of, timer, Subject } from 'rxjs';
import { map, switchMap, takeUntil, tap, catchError } from 'rxjs/operators';

// Import interfaces from shared models
import { User } from '../../shared/models/user.model';
import { Notification } from '../../shared/models/notification.model';
import { City, Language } from '../../shared/models/location.model';

// Import services
import { CurrentUserService } from '../../core/auth/current-user.service';
import { NotificationService } from '../../core/services/notification.service';
import { AuthService } from '../../core/auth/auth.service';

interface Language {
  code: string;
  name: string;
  rtl?: boolean;
}

interface City {
  id: string;
  name: string;
  country?: string;
}

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatSelectModule,
    MatFormFieldModule,
    MatInputModule,
    MatBadgeModule,
    MatCardModule,
    MatDividerModule,
    MatSnackBarModule,
    FormsModule,
    TranslateModule,
  ],
  templateUrl: './header.component.html',
  styleUrls: [], // Using inline styles for now
})
export class HeaderComponent implements OnInit, OnDestroy {
  // Services
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);
  private translate = inject(TranslateService);
  // Services
  private currentUserService = inject(CurrentUserService);
  private notificationService = inject(NotificationService);
  private authService = inject(AuthService);
  private cdr = inject(ChangeDetectorRef);
  private destroy$ = new Subject<void>();

  // State
  user: User | null = null;
  isLoggedIn = false;
  isMobile = false;
  isLoading = false;
  showMobileSearch = false;
  showNotifications = false;
  showUserMenu = false;
  notifications: Notification[] = [];
  unreadCount = 0;
  searchQuery = '';
  selectedLanguage = 'en';
  selectedCity = '1';

  // Constants
  readonly languages: Language[] = [
    { code: 'en', name: 'English' },
    { code: 'hi', name: 'हिंदी' },
    { code: 'bn', name: 'বাংলা', rtl: true },
    { code: 'ta', name: 'தமிழ்' },
    { code: 'te', name: 'తెలుగు' },
    { code: 'mr', name: 'मराठी' },
    { code: 'gu', name: 'ગુજરાતી' },
    { code: 'kn', name: 'ಕನ್ನಡ' },
    { code: 'ml', name: 'മലയാളം' },
    { code: 'pa', name: 'ਪੰਜਾਬੀ' },
  ];

  readonly cities: City[] = [
    { id: 'mumbai', name: 'Mumbai', country: 'India' },
    { id: 'delhi', name: 'Delhi', country: 'India' },
    { id: 'bangalore', name: 'Bangalore', country: 'India' },
    { id: 'hyderabad', name: 'Hyderabad', country: 'India' },
    { id: 'chennai', name: 'Chennai', country: 'India' },
    { id: 'kolkata', name: 'Kolkata', country: 'India' },
    { id: 'pune', name: 'Pune', country: 'India' },
    { id: 'ahmedabad', name: 'Ahmedabad', country: 'India' },
    { id: 'jaipur', name: 'Jaipur', country: 'India' },
    { id: 'surat', name: 'Surat', country: 'India' },
  ];

  // Private state
  private subscriptions = new Subscription();
  private onResize = () => {
    this.checkIfMobile();
  };

  ngOnInit() {
    this.checkIfMobile();
    if (typeof window !== 'undefined') {
      window.addEventListener('resize', this.onResize);
    }

    // Load saved preferences
    let savedLanguage = 'en';
    let savedCity = 'mumbai';
    if (typeof localStorage !== 'undefined') {
      savedLanguage = localStorage.getItem('userLanguage') || 'en';
      savedCity = localStorage.getItem('userCity') || 'mumbai';
    }
    this.selectedLanguage = savedLanguage;
    this.translate.use(savedLanguage);
    this.selectedCity = savedCity;

    // Subscribe to authentication state
    this.subscriptions.add(
      this.currentUserService.currentUser$.subscribe((user) => {
        this.user = user;
        this.isLoggedIn = !!user;
        this.cdr.markForCheck();

        if (this.isLoggedIn) {
          this.loadNotifications();
        } else {
          this.notifications = [];
          this.unreadCount = 0;
        }
      }),
    );

    // Set up notification polling
    this.setupNotificationPolling();
  }

  ngOnDestroy() {
    // Clean up subscriptions and event listeners
    this.subscriptions.unsubscribe();
    if (typeof window !== 'undefined') {
      window.removeEventListener('resize', this.onResize);
    }
    this.destroy$.next();
    this.destroy$.complete();
  }

  private checkIfMobile() {
    this.isMobile = typeof window !== 'undefined' ? window.innerWidth < 768 : false;
  }

  private loadNotifications(): void {
    if (!this.isLoggedIn) return;

    this.isLoading = true;
    this.subscriptions.add(
      this.notificationService.getNotifications().subscribe({
        next: (notifications) => {
          this.notifications = notifications;
          this.isLoading = false;
          this.cdr.markForCheck();
        },
        error: (error) => {
          console.error('Failed to load notifications', error);
          this.isLoading = false;
          this.cdr.markForCheck();
        },
      }),
    );

    this.subscriptions.add(
      this.notificationService.getUnreadCount().subscribe((count) => {
        this.unreadCount = count;
        this.cdr.markForCheck();
      }),
    );
  }

  private setupNotificationPolling(): void {
    // Poll for new notifications every 5 minutes
    timer(0, 5 * 60 * 1000)
      .pipe(
        takeUntil(this.destroy$),
        switchMap(() => (this.isLoggedIn ? this.notificationService.getUnreadCount() : of(0))),
        tap((count) => {
          if (count > this.unreadCount && this.unreadCount > 0) {
            // Show a subtle notification that new notifications are available
            this.snackBar
              .open(
                this.translate.instant('NOTIFICATIONS.NEW_NOTIFICATIONS', { count: count - this.unreadCount }),
                this.translate.instant('COMMON.VIEW'),
                { duration: 5000 },
              )
              .onAction()
              .subscribe(() => {
                this.showNotifications = true;
              });
          }
          this.unreadCount = count;
          this.cdr.markForCheck();
        }),
        catchError((error) => {
          console.error('Error polling notifications', error);
          return of(0);
        }),
      )
      .subscribe();
  }

  onToggleNotifications(): void {
    this.showNotifications = !this.showNotifications;
    if (this.showNotifications) {
      this.markAllAsRead();
    }
  }

  onToggleUserMenu(): void {
    this.showUserMenu = !this.showUserMenu;
  }

  onLanguageChange(languageCode: string): void {
    this.selectedLanguage = languageCode;
    this.translate.use(languageCode);
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('userLanguage', languageCode);
    }

    // Update document direction for RTL languages
    const selectedLang = this.languages.find((lang) => lang.code === languageCode);
    if (typeof document !== 'undefined' && document.documentElement) {
      document.documentElement.dir = selectedLang?.rtl ? 'rtl' : 'ltr';
      document.documentElement.lang = languageCode;
    }

    // Close any open menus
    this.showNotifications = false;
    this.showUserMenu = false;

    // Notify the app about language change
    if (typeof document !== 'undefined') {
      document.dispatchEvent(new CustomEvent('languageChange', { detail: languageCode }));
    }
  }

  onCityChange(cityId: string): void {
    this.selectedCity = cityId;
    // In a real app, this would update a service or emit an event
    console.log('Selected city:', this.cities.find((c) => c.id === cityId)?.name);
    // Close any open menus
    this.showNotifications = false;
    this.showUserMenu = false;
  }

  onSearch(): void {
    const query = this.searchQuery.trim();
    if (query) {
      // In a real app, this would navigate to search results
      console.log('Searching for:', query);
      this.router.navigate(['/search'], { queryParams: { q: query } });
      // Close mobile search if open
      if (this.isMobile) {
        this.showMobileSearch = false;
      }
    }
  }

  onClearSearch(): void {
    this.searchQuery = '';
  }

  onNotificationClick(notification: Notification): void {
    if (!notification.read) {
      this.notificationService.markAsRead(notification.id).subscribe({
        next: () => {
          // Notification marked as read, the service will update the count
          if (notification.action?.url) {
            this.router.navigateByUrl(notification.action.url);
          } else if (notification.action?.handler) {
            notification.action.handler();
          }
          this.showNotifications = false;
        },
        error: (error) => {
          console.error('Failed to mark notification as read', error);
        },
      });
    } else if (notification.action?.url) {
      this.router.navigateByUrl(notification.action.url);
      this.showNotifications = false;
    } else if (notification.action?.handler) {
      notification.action.handler();
      this.showNotifications = false;
    }
  }

  markAllAsRead(): void {
    if (this.unreadCount === 0) return;

    this.notificationService.markAllAsRead().subscribe({
      next: () => {
        // The service will update the notifications and count
        this.snackBar.open(this.translate.instant('NOTIFICATIONS.MARKED_ALL_READ'), this.translate.instant('COMMON.OK'), {
          duration: 3000,
        });
      },
      error: (error) => {
        console.error('Failed to mark all notifications as read', error);
        this.snackBar.open(this.translate.instant('NOTIFICATIONS.MARK_READ_ERROR'), this.translate.instant('COMMON.CLOSE'), {
          duration: 5000,
          panelClass: ['error-snackbar'],
        });
      },
    });
  }

  onLogout(): void {
    this.isLoading = true;
    this.authService
      .logout()
      .pipe(
        tap(() => {
          this.currentUserService.clearCurrentUser();
          this.router.navigate(['/auth/login']);
          this.snackBar.open(this.translate.instant('AUTH.LOGOUT_SUCCESS'), this.translate.instant('COMMON.CLOSE'), {
            duration: 3000,
            panelClass: ['success-snackbar'],
          });
        }),
        catchError((error: Error) => {
          console.error('Logout failed', error);
          this.snackBar.open(this.translate.instant('AUTH.LOGOUT_ERROR'), this.translate.instant('COMMON.CLOSE'), {
            duration: 5000,
            panelClass: ['error-snackbar'],
          });
          return of(null);
        }),
        finalize(() => {
          this.isLoading = false;
        }),
      )
      .subscribe();
  }

  onProfileClick(): void {
    if (this.user) {
      this.router.navigate(['/profile']);
      this.showUserMenu = false;
    }
  }

  onSettingsClick(): void {
    this.router.navigate(['/settings']);
    this.showUserMenu = false;
  }
}
