import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSortModule, Sort } from '@angular/material/sort';
import { MatMenuModule } from '@angular/material/menu';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTabsModule } from '@angular/material/tabs';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatListModule } from '@angular/material/list';
import { MatDialogModule } from '@angular/material/dialog';
import { RouterTestingModule } from '@angular/router/testing';
import { of, throwError } from 'rxjs';

import { AppointmentsOverviewWidgetComponent } from './appointments-overview-widget.component';
import { DashboardService } from '../../services/dashboard.service';
import { AppointmentsOverview, Appointment, AppointmentStatus } from '../../models/appointment.model';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

describe('AppointmentsOverviewWidgetComponent', () => {
  let component: AppointmentsOverviewWidgetComponent;
  let fixture: ComponentFixture<AppointmentsOverviewWidgetComponent>;
  let dashboardService: jasmine.SpyObj<DashboardService>;
  let translateService: jasmine.SpyObj<TranslateService>;
  let snackBar: jasmine.SpyObj<MatSnackBar>;

  const mockAppointment: Appointment = {
    id: '1',
    title: 'Haircut',
    startTime: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
    endTime: new Date(Date.now() + 86400000 + 3600000).toISOString(), // 1 hour later
    status: AppointmentStatus.CONFIRMED,
    customerId: 'cust1',
    customerName: 'John Doe',
    customerEmail: 'john@example.com',
    staffId: 'staff1',
    staffName: 'Jane Smith',
    serviceId: 'svc1',
    serviceName: 'Haircut',
    duration: 60,
    price: 50,
    salonId: 'salon1',
    salonName: 'Beauty Salon',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  const mockOverview: AppointmentsOverview = {
    totalAppointments: 10,
    pendingAppointments: 2,
    confirmedAppointments: 5,
    completedAppointments: 3,
    cancelledAppointments: 0,
    noShowAppointments: 0,
    totalRevenue: 500,
    averageDuration: 45,
    upcomingAppointments: [mockAppointment],
    recentAppointments: [{
      ...mockAppointment,
      id: '2',
      status: AppointmentStatus.COMPLETED,
      startTime: new Date(Date.now() - 86400000).toISOString(), // Yesterday
      endTime: new Date(Date.now() - 86400000 + 3600000).toISOString() // 1 hour later
    }],
    statusDistribution: {
      [AppointmentStatus.PENDING]: 2,
      [AppointmentStatus.CONFIRMED]: 5,
      [AppointmentStatus.COMPLETED]: 3
    },
    dailyAppointments: {
      [new Date().toISOString().split('T')[0]]: 3,
      [new Date(Date.now() - 86400000).toISOString().split('T')[0]]: 2
    }
  };

  beforeEach(async () => {
    const dashboardServiceSpy = jasmine.createSpyObj('DashboardService', [
      'getAppointmentsOverview',
      'updateAppointmentStatus'
    ]);

    const snackBarSpy = jasmine.createSpyObj('MatSnackBar', ['open']);

    const translateServiceSpy = jasmine.createSpyObj('TranslateService', [
      'instant',
      'get',
      'use',
      'setTranslation',
      'setDefaultLang',
      'addLangs',
      'getBrowserLang',
      'getBrowserCultureLang',
      'getLangs',
      'getParser',
      'getTranslation',
      'reloadLang',
      'resetLang',
      'setTranslation',
      'stream',
      'onLangChange',
      'onTranslationChange',
      'onDefaultLangChange'
    ]);

    await TestBed.configureTestingModule({
      declarations: [AppointmentsOverviewWidgetComponent],
      imports: [
        NoopAnimationsModule,
        HttpClientTestingModule,
        RouterTestingModule,
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
        TranslateModule.forRoot()
      ],
      providers: [
        { provide: DashboardService, useValue: dashboardServiceSpy },
        { provide: TranslateService, useValue: translateServiceSpy },
        { provide: MatSnackBar, useValue: snackBarSpy }
      ]
    })
    .compileComponents();

    dashboardService = TestBed.inject(DashboardService) as jasmine.SpyObj<DashboardService>;
    translateService = TestBed.inject(TranslateService) as jasmine.SpyObj<TranslateService>;
    snackBar = TestBed.inject(MatSnackBar) as jasmine.SpyObj<MatSnackBar>;
    
    // Setup mock responses
    dashboardService.getAppointmentsOverview.and.returnValue(of(mockOverview));
    dashboardService.updateAppointmentStatus.and.returnValue(of({ ...mockAppointment, status: AppointmentStatus.COMPLETED }));
    
    // Setup translate service mock
    translateService.instant.and.callFake((key: string) => key);
    translateService.get.and.returnValue(of('translated'));
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AppointmentsOverviewWidgetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load appointments overview on init', () => {
    expect(dashboardService.getAppointmentsOverview).toHaveBeenCalled();
    expect(component.overview).toEqual(mockOverview);
    expect(component.dataSource.data).toEqual(mockOverview.upcomingAppointments);
    expect(component.isLoading).toBeFalse();
  });

  it('should handle error when loading appointments overview', () => {
    const error = new Error('Failed to load');
    dashboardService.getAppointmentsOverview.and.returnValue(throwError(() => error));
    
    component.ngOnInit();
    fixture.detectChanges();
    
    expect(component.error).toBe('DASHBOARD.APPOINTMENTS.ERROR_LOADING');
    expect(component.isLoading).toBeFalse();
    
    const errorElement = fixture.nativeElement.querySelector('.error-container');
    expect(errorElement).toBeTruthy();
    expect(errorElement.textContent).toContain('DASHBOARD.APPOINTMENTS.ERROR_LOADING');
  });

  it('should filter appointments by status', () => {
    const status = AppointmentStatus.PENDING;
    component.statusFilter.setValue(status);
    
    expect(component.filters.status).toBe(status);
    expect(dashboardService.getAppointmentsOverview).toHaveBeenCalledWith({ status });
  });

  it('should filter appointments by date range', fakeAsync(() => {
    const startDate = new Date();
    const endDate = new Date(Date.now() + 7 * 86400000); // 7 days later
    
    component.dateRange.setValue({ start: startDate, end: endDate });
    tick(300); // Debounce time
    
    expect(component.filters.startDate).toBe(startDate.toISOString().split('T')[0]);
    expect(component.filters.endDate).toBe(endDate.toISOString().split('T')[0]);
    expect(dashboardService.getAppointmentsOverview).toHaveBeenCalledWith({
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0]
    });
  }));

  it('should change appointment status', () => {
    const appointment = mockAppointment;
    const newStatus = AppointmentStatus.COMPLETED;
    
    component.changeStatus(appointment, newStatus);
    
    expect(dashboardService.updateAppointmentStatus).toHaveBeenCalledWith(appointment.id, newStatus);
    expect(dashboardService.getAppointmentsOverview).toHaveBeenCalled();
  });

  it('should handle error when updating appointment status', () => {
    const error = new Error('Failed to update');
    dashboardService.updateAppointmentStatus.and.returnValue(throwError(() => error));
    
    component.changeStatus(mockAppointment, AppointmentStatus.COMPLETED);
    
    expect(snackBar.open).toHaveBeenCalledWith(
      'DASHBOARD.APPOINTMENTS.STATUS_UPDATE_ERROR',
      'COMMON.CLOSE',
      { duration: 5000, panelClass: ['error-snackbar'] }
    );
  });

  it('should format duration correctly', () => {
    expect(component.formatDuration(30)).toBe('30m');
    expect(component.formatDuration(90)).toBe('1h 30m');
    expect(component.formatDuration(120)).toBe('2h 0m');
  });

  it('should check if date is today', () => {
    const today = new Date().toISOString();
    const yesterday = new Date(Date.now() - 86400000).toISOString();
    
    expect(component.isToday(today)).toBeTrue();
    expect(component.isToday(yesterday)).toBeFalse();
  });

  it('should check if date is in the past', () => {
    const yesterday = new Date(Date.now() - 86400000).toISOString();
    const tomorrow = new Date(Date.now() + 86400000).toISOString();
    
    expect(component.isPast(yesterday)).toBeTrue();
    expect(component.isPast(tomorrow)).toBeFalse();
  });

  it('should get correct status badge configuration', () => {
    const pendingBadge = component.getStatusBadge(AppointmentStatus.PENDING);
    const confirmedBadge = component.getStatusBadge(AppointmentStatus.CONFIRMED);
    const completedBadge = component.getStatusBadge(AppointmentStatus.COMPLETED);
    const cancelledBadge = component.getStatusBadge(AppointmentStatus.CANCELLED);
    const noshowBadge = component.getStatusBadge(AppointmentStatus.NOSHOW);
    const unknownBadge = component.getStatusBadge('UNKNOWN' as any);
    
    expect(pendingBadge.text).toBe('STATUS.PENDING');
    expect(confirmedBadge.text).toBe('STATUS.CONFIRMED');
    expect(completedBadge.text).toBe('STATUS.COMPLETED');
    expect(cancelledBadge.text).toBe('STATUS.CANCELLED');
    expect(noshowBadge.text).toBe('STATUS.NO_SHOW');
    expect(unknownBadge.text).toBe('UNKNOWN');
  });

  it('should get correct appointment icon based on status and date', () => {
    const pastAppointment = { ...mockAppointment, startTime: new Date(Date.now() - 86400000).toISOString() };
    const todayAppointment = { ...mockAppointment, startTime: new Date().toISOString() };
    
    // Past appointment that's not completed or cancelled
    expect(component.getAppointmentIcon({ ...pastAppointment, status: AppointmentStatus.CONFIRMED })).toBe('warning');
    
    // Today's appointment
    expect(component.getAppointmentIcon(todayAppointment)).toBe('today');
    
    // Status-based icons
    expect(component.getAppointmentIcon({ ...mockAppointment, status: AppointmentStatus.PENDING })).toBe('schedule');
    expect(component.getAppointmentIcon({ ...mockAppointment, status: AppointmentStatus.CONFIRMED })).toBe('event_available');
    expect(component.getAppointmentIcon({ ...mockAppointment, status: AppointmentStatus.COMPLETED })).toBe('done_all');
    expect(component.getAppointmentIcon({ ...mockAppointment, status: AppointmentStatus.CANCELLED })).toBe('cancel');
    expect(component.getAppointmentIcon({ ...mockAppointment, status: AppointmentStatus.NOSHOW })).toBe('no_accounts');
    expect(component.getAppointmentIcon({ ...mockAppointment, status: 'UNKNOWN' as any })).toBe('event');
  });

  it('should refresh data', () => {
    const initialCalls = dashboardService.getAppointmentsOverview.calls.count();
    component.refresh();
    expect(dashboardService.getAppointmentsOverview.calls.count()).toBe(initialCalls + 1);
  });

  it('should handle page change', () => {
    const pageEvent = new PageEvent();
    pageEvent.pageIndex = 1;
    pageEvent.pageSize = 20;
    
    component.onPageChange(pageEvent);
    
    expect(component.pageIndex).toBe(1);
    expect(component.pageSize).toBe(20);
    expect(dashboardService.getAppointmentsOverview).toHaveBeenCalledWith({
      page: 2, // pageIndex + 1
      pageSize: 20,
      sortField: 'saleDate',
      sortDirection: 'desc'
    });
  });

  it('should handle sort change', () => {
    const sortEvent: Sort = {
      active: 'customerName',
      direction: 'asc'
    };
    
    component.onSortChange(sortEvent);
    
    expect(component.filters.sortField).toBe('customerName');
    expect(component.filters.sortDirection).toBe('asc');
    expect(dashboardService.getAppointmentsOverview).toHaveBeenCalledWith({
      sortField: 'customerName',
      sortDirection: 'asc'
    });
  });
});
