import { Component, OnInit, OnDestroy, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSortModule, MatSort, Sort } from '@angular/material/sort';
import { MatMenuModule } from '@angular/material/menu';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTabsModule } from '@angular/material/tabs';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatListModule } from '@angular/material/list';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';

import { Observable, Subject, of } from 'rxjs';
import { takeUntil, catchError, finalize } from 'rxjs/operators';

import { DashboardService } from '../../services/dashboard.service';
import { 
  AppointmentsOverview, 
  Appointment, 
  AppointmentsFilter, 
  AppointmentStatus 
} from '../../models/appointment.model';
import { DateRange } from '@angular/material/datepicker';
import { formatDate } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

interface StatusBadgeConfig {
  text: string;
  class: string;
  icon: string;
}

@Component({
  selector: 'app-appointments-overview-widget',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatMenuModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    ReactiveFormsModule,
    MatSnackBarModule,
    MatTabsModule,
    MatChipsModule,
    MatDividerModule,
    MatListModule,
    MatDialogModule,
    TranslateModule
  ],
  templateUrl: './appointments-overview-widget.component.html',
  styleUrls: ['./appointments-overview-widget.component.scss']
})
export class AppointmentsOverviewWidgetComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild(MatSort) sort!: MatSort;
  
  // Data
  overview: AppointmentsOverview | null = null;
  dataSource = new MatTableDataSource<Appointment>([]);
  displayedColumns: string[] = [
    'title', 
    'customerName', 
    'staffName', 
    'serviceName', 
    'startTime', 
    'duration',
    'status',
    'actions'
  ];
  
  // Loading & error states
  isLoading = true;
  error: string | null = null;
  
  // Pagination
  pageIndex = 0;
  pageSize = 10;
  pageSizeOptions = [5, 10, 25, 50];
  totalItems = 0;
  
  // Filters
  filters: AppointmentsFilter = {};
  dateRange = new FormGroup({
    start: new FormControl<Date | null>(null),
    end: new FormControl<Date | null>(null)
  });
  
  // Status filter
  statusFilter = new FormControl<AppointmentStatus | 'ALL'>('ALL');
  statusOptions: {value: AppointmentStatus | 'ALL', label: string}[] = [
    { value: 'ALL', label: 'All Statuses' },
    { value: 'PENDING', label: 'Pending' },
    { value: 'CONFIRMED', label: 'Confirmed' },
    { value: 'COMPLETED', label: 'Completed' },
    { value: 'CANCELLED', label: 'Cancelled' },
    { value: 'NOSHOW', label: 'No Show' }
  ];
  
  // Tabs
  selectedTabIndex = 0;
  
  private destroy$ = new Subject<void>();

  constructor(
    private dashboardService: DashboardService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    private translate: TranslateService
  ) {}

  ngOnInit(): void {
    this.loadData();
    
    // Subscribe to status filter changes
    this.statusFilter.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(status => {
        this.filters.status = status === 'ALL' ? undefined : status as AppointmentStatus;
        this.loadData();
      });
    
    // Subscribe to date range changes with debounce
    this.dateRange.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(range => {
        this.filters = {
          ...this.filters,
          startDate: range.start ? formatDate(range.start, 'yyyy-MM-dd', 'en-US') : undefined,
          endDate: range.end ? formatDate(range.end, 'yyyy-MM-dd', 'en-US') : undefined
        };
        this.loadData();
      });
  }

  ngAfterViewInit(): void {
    this.dataSource.sort = this.sort;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Load appointments overview and data
   */
  loadData(): void {
    this.isLoading = true;
    this.error = null;
    
    // Load overview data
    this.dashboardService.getAppointmentsOverview(this.filters)
      .pipe(
        takeUntil(this.destroy$),
        catchError(error => {
          console.error('Error loading appointments overview:', error);
          this.error = this.translate.instant('DASHBOARD.APPOINTMENTS.ERROR_LOADING');
          return of(null);
        }),
        finalize(() => this.isLoading = false)
      )
      .subscribe(overview => {
        if (overview) {
          this.overview = overview;
          this.dataSource.data = overview.upcomingAppointments;
          this.totalItems = overview.totalAppointments;
        }
      });
  }

  /**
   * Handle page change event
   */
  onPageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadData();
  }

  /**
   * Handle sort change event
   */
  onSortChange(sort: Sort): void {
    this.filters.sortField = sort.active;
    this.filters.sortDirection = sort.direction as 'asc' | 'desc';
    this.loadData();
  }

  /**
   * Refresh the data
   */
  refresh(): void {
    this.loadData();
  }

  /**
   * Get the status badge configuration
   */
  getStatusBadge(status: AppointmentStatus): StatusBadgeConfig {
    const config: Record<AppointmentStatus, StatusBadgeConfig> = {
      PENDING: {
        text: this.translate.instant('STATUS.PENDING'),
        class: 'status-pending',
        icon: 'schedule'
      },
      CONFIRMED: {
        text: this.translate.instant('STATUS.CONFIRMED'),
        class: 'status-confirmed',
        icon: 'check_circle'
      },
      COMPLETED: {
        text: this.translate.instant('STATUS.COMPLETED'),
        class: 'status-completed',
        icon: 'done_all'
      },
      CANCELLED: {
        text: this.translate.instant('STATUS.CANCELLED'),
        class: 'status-cancelled',
        icon: 'cancel'
      },
      NOSHOW: {
        text: this.translate.instant('STATUS.NO_SHOW'),
        class: 'status-noshow',
        icon: 'no_accounts'
      }
    };
    
    return config[status] || {
      text: status,
      class: 'status-unknown',
      icon: 'help'
    };
  }

  /**
   * Format a date string to a readable format
   */
  formatDate(dateString: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleString();
  }

  /**
   * Format duration in minutes to hours and minutes
   */
  formatDuration(minutes: number): string {
    if (!minutes) return '0m';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  }

  /**
   * Change the status of an appointment
   */
  changeStatus(appointment: Appointment, status: AppointmentStatus): void {
    if (appointment.status === status) return;
    
    this.dashboardService.updateAppointmentStatus(appointment.id, status)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.snackBar.open(
            this.translate.instant('DASHBOARD.APPOINTMENTS.STATUS_UPDATED'),
            this.translate.instant('COMMON.CLOSE'),
            { duration: 3000 }
          );
          this.loadData();
        },
        error: (error) => {
          console.error('Error updating appointment status:', error);
          this.snackBar.open(
            this.translate.instant('DASHBOARD.APPOINTMENTS.STATUS_UPDATE_ERROR'),
            this.translate.instant('COMMON.CLOSE'),
            { duration: 5000, panelClass: ['error-snackbar'] }
          );
        }
      });
  }

  /**
   * Check if a date is today
   */
  isToday(dateString: string): boolean {
    if (!dateString) return false;
    const date = new Date(dateString);
    const today = new Date();
    return date.toDateString() === today.toDateString();
  }

  /**
   * Check if a date is in the past
   */
  isPast(dateString: string): boolean {
    if (!dateString) return false;
    const date = new Date(dateString);
    const now = new Date();
    return date < now && !this.isToday(dateString);
  }

  /**
   * Get the appropriate icon for an appointment based on its status and date
   */
  getAppointmentIcon(appointment: Appointment): string {
    if (this.isPast(appointment.endTime) && appointment.status !== 'COMPLETED' && appointment.status !== 'CANCELLED') {
      return 'warning'; // Missed appointment
    }
    
    if (this.isToday(appointment.startTime)) {
      return 'today'; // Today's appointment
    }
    
    // Default icon based on status
    const statusIcons: Record<AppointmentStatus, string> = {
      PENDING: 'schedule',
      CONFIRMED: 'event_available',
      COMPLETED: 'done_all',
      CANCELLED: 'cancel',
      NOSHOW: 'no_accounts'
    };
    
    return statusIcons[appointment.status] || 'event';
  }
}
