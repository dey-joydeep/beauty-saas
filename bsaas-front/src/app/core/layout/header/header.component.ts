import { Component, OnInit, OnDestroy, inject, ChangeDetectorRef, HostListener } from '@angular/core';
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
import { map, switchMap, takeUntil, tap, catchError, finalize } from 'rxjs/operators';

// Models
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

interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

interface Notification {
  id: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: Date;
  link?: string;
  icon?: string;
  time?: Date;
  action?: {
    type?: string;
    label?: string;
    url?: string;
    method?: string;
    payload?: any;
    handler?: () => void;
  };
}



// Mock services - these should be replaced with actual service implementations
class CurrentUserService {
  currentUser$ = of<User | null>(null);
  
  getCurrentUser() {
    return of<User | null>(null);
  }
  
  clearCurrentUser() {
    return of({});
  }
}

class NotificationService {
  getNotifications() {
    return of<Notification[]>([]);
  }
  
  getUnreadCount() {
    return of(0);
  }
  
  markAsRead(notificationId: string) {
    return of({ success: true });
  }
  
  markAllAsRead() {
    return of({ success: true });
  }
  
  // Process notification to ensure it has required properties
  static processNotification(notification: any): Notification {
    return {
      ...notification,
      action: notification.action || {}
    };
  }
}

class AuthService {
  logout() {
    return of({ success: true });
  }
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

  // State properties
  user: User | null = null;
  isLoggedIn = false;
  
  // Header visibility and scroll state
  isVisible = true;
  lastScrollPosition = 0;
  
  // User authentication state
  isAuthenticated = false;
  currentUser: User | null = null;
  
  // UI state
  isMobile = false;
  isLoading = false;
  isMobileSearchVisible = false;
  showCityPopup = false;
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
  
  // Private properties
  private subscriptions = new Subscription();
  
  // Handle window resize
  @HostListener('window:resize')
  private onResize() {
    this.checkIfMobile();
  }

  ngOnInit() {
    this.checkIfMobile();
    window.addEventListener('resize', this.onResize);
    
    // Initialize scroll handling
    this.handleScroll();
    
    // Subscribe to authentication state changes
    this.subscriptions.add(
      this.currentUserService.getCurrentUser().subscribe({
        next: (user) => {
          this.user = user;
          this.isLoggedIn = !!user;
          this.isAuthenticated = !!user;
          this.currentUser = user;
          
          if (user) {
            this.loadNotifications();
          }
        },
        error: (error) => {
          console.error('Error loading user:', error);
        }
      })
    );
    
    // Set up notification polling
    this.setupNotificationPolling();
  }

  ngOnDestroy() {
    window.removeEventListener('resize', this.onResize);
    this.subscriptions.unsubscribe();
    this.destroy$.next();
    this.destroy$.complete();
  }
  
  // Handle scroll events for header visibility
  @HostListener('window:scroll')
  private handleScroll() {
    const currentScrollPosition = window.pageYOffset || document.documentElement.scrollTop;
    this.isVisible = currentScrollPosition < this.lastScrollPosition || currentScrollPosition < 10;
    this.lastScrollPosition = currentScrollPosition;
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

  // Handle language change
  onLanguageChange(languageCode: string): void {
    this.selectedLanguage = languageCode;
    this.translate.use(languageCode);
    
    // Save language preference
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

  // Handle city selection change
  onCityChange(cityId: string): void {
    this.selectedCity = cityId;
    this.showCityPopup = false;
    // Save city preference
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('userCity', cityId);
    }
  }
  
  // Toggle city selection popup
  toggleCityPopup(show?: boolean): void {
    this.showCityPopup = show !== undefined ? show : !this.showCityPopup;
  }
  
  // Handle city confirmation
  confirmCity(cityId?: string): void {
    if (cityId) {
      this.selectedCity = cityId;
      // Save city preference
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('userCity', cityId);
      }
    }
    this.showCityPopup = false;
  }
  
  // Toggle mobile search
  toggleMobileSearch(show?: boolean): void {
    this.isMobileSearchVisible = show !== undefined ? show : !this.isMobileSearchVisible;
  }
  
  // Alias for template compatibility
  get logout() {
    return this.onLogout.bind(this);
  }

  onSearch(query?: string): void {
    const searchQuery = query || this.searchQuery;
    if (searchQuery && searchQuery.trim()) {
      this.router.navigate(['/search'], { queryParams: { q: searchQuery.trim() } });
      this.searchQuery = '';
      this.isMobileSearchVisible = false;
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

  // Handle logout
  onLogout(): void {
    this.isLoading = true;
    this.authService.logout().subscribe({
      next: () => {
        this.router.navigate(['/login']);
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Logout error:', error);
        this.isLoading = false;
        this.snackBar.open(
          this.translate.instant('AUTH.LOGOUT_ERROR'),
          this.translate.instant('COMMON.CLOSE'),
          { duration: 5000, panelClass: ['error-snackbar'] }
        );
      }
    });
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
