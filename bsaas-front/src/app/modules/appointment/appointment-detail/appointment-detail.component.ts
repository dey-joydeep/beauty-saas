import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription, finalize } from 'rxjs';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { first } from 'rxjs/operators';

import { Appointment, AppointmentStatus } from '../../../models/appointment.model';
import { AppointmentService } from '../services/appointment.service';
import { AppointmentCancelDialogComponent } from '../appointment-cancel-dialog/appointment-cancel-dialog.component';

@Component({
  selector: 'app-appointment-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatDividerModule,
    MatProgressSpinnerModule,
    MatDialogModule,
    MatSnackBarModule,
    TranslateModule,
  ],
  templateUrl: './appointment-detail.component.html',
  styleUrls: ['./appointment-detail.component.scss'],
})
export class AppointmentDetailComponent implements OnInit, OnDestroy {
  appointment: Appointment | null = null;
  isLoading = true;
  isUpdating = false;
  // Make enum available in template
  readonly AppointmentStatus = AppointmentStatus;
  private subscriptions: Subscription[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private appointmentService: AppointmentService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private translate: TranslateService
  ) {}

  ngOnInit(): void {
    this.loadAppointment();
  }

  ngOnDestroy(): void {
    // Clean up all subscriptions when component is destroyed
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  onCancelAppointment(): void {
    if (!this.appointment) return;

    const dialogRef = this.dialog.open(AppointmentCancelDialogComponent, {
      width: '500px',
      data: { 
        appointment: this.appointment,
        // Pass any additional data needed by the dialog
      },
    });

    const dialogSubscription = dialogRef.afterClosed().subscribe((result: { action: string; reason?: string }) => {
      if (result?.action === 'cancelled') {
        this.loadAppointment();
      } else if (result?.action === 'confirmed' && this.appointment) {
        this.isUpdating = true;
        const cancelSubscription = this.appointmentService.cancelAppointment(
          this.appointment.id,
          result.reason || 'No reason provided'
        ).pipe(
          finalize(() => this.isUpdating = false)
        ).subscribe({
          next: () => {
            this.snackBar.open(
              this.translate.instant('APPOINTMENT.CANCELLATION_SUCCESS'),
              this.translate.instant('COMMON.CLOSE'),
              { duration: 5000 }
            );
            this.loadAppointment();
          },
          error: (error: any) => {
            console.error('Error cancelling appointment:', error);
            this.snackBar.open(
              this.translate.instant('APPOINTMENT.CANCELLATION_ERROR'),
              this.translate.instant('COMMON.CLOSE'),
              { duration: 5000 }
            );
          },
        });
        
        // Store subscription for cleanup
        this.subscriptions.push(cancelSubscription);
      }
    });
    
    // Store dialog subscription for cleanup
    this.subscriptions.push(dialogSubscription);
  }

  onReschedule(): void {
    if (this.appointment) {
      this.router.navigate(['/appointments', this.appointment.id, 'reschedule']);
    }
  }

  private loadAppointment(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.isLoading = false;
      this.snackBar.open(
        this.translate.instant('APPOINTMENT.INVALID_ID'),
        this.translate.instant('COMMON.CLOSE'),
        { duration: 5000 }
      );
      this.router.navigate(['/appointments']);
      return;
    }

    this.isLoading = true;
    const subscription = this.appointmentService.getAppointment(id).pipe(
      finalize(() => this.isLoading = false)
    ).subscribe({
      next: (appointment: Appointment) => {
        // Create a new object with the correct types
        const formattedAppointment: Appointment = {
          ...appointment,
          // Ensure dates are properly formatted
          appointmentDate: new Date(appointment.appointmentDate).toISOString().split('T')[0],
          startTime: appointment.startTime,
          endTime: appointment.endTime,
          // Convert string dates to Date objects for the template
          createdAt: new Date(appointment.createdAt).toISOString(),
          updatedAt: new Date(appointment.updatedAt).toISOString()
        };
        this.appointment = formattedAppointment;
      },
      error: (error: any) => {
        console.error('Error loading appointment:', error);
        this.snackBar.open(
          this.translate.instant('APPOINTMENT.LOAD_ERROR'),
          this.translate.instant('COMMON.CLOSE'),
          { duration: 5000 }
        );
        this.router.navigate(['/appointments']);
      },
    });
    
    // Store subscription for cleanup
    this.subscriptions.push(subscription);
  }

  private getMockAppointment(id: string): Appointment {
    const now = new Date();
    const oneHourLater = new Date(now.getTime() + 3600000); // 1 hour later
    
    return {
      id,
      customerId: '1',
      serviceId: '1',
      staffId: '1',
      salonId: '1',
      appointmentDate: now.toISOString().split('T')[0],
      startTime: now.toTimeString().substring(0, 5), // HH:mm format
      endTime: oneHourLater.toTimeString().substring(0, 5), // HH:mm format
      status: AppointmentStatus.CONFIRMED,
      notes: 'Test appointment',
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    };
  }

  getServiceName(serviceId: string): string {
    // TODO: Implement service name lookup
    return serviceId;
  }

  getSalonName(salonId: string): string {
    // TODO: Implement salon name lookup
    return salonId;
  }

  getStaffName(staffId: string): string {
    // TODO: Implement staff name lookup
    return staffId || 'Any available';
  }

  formatAppointmentDate(date: Date | string | null | undefined): string {
    if (!date) return '';
    try {
      const dateObj = typeof date === 'string' ? new Date(date) : date;
      return dateObj.toLocaleDateString();
    } catch (error) {
      console.error('Error formatting date:', error);
      return '';
    }
  }

  formatAppointmentTime(startTime: string | undefined, endTime: string | undefined): string {
    if (!startTime || !endTime) return '';
    return `${startTime} - ${endTime}`;
  }

  getStatusText(status: AppointmentStatus): string {
    switch (status) {
      case AppointmentStatus.CONFIRMED:
        return 'Confirmed';
      case AppointmentStatus.CANCELLED:
        return 'Cancelled';
      default:
        return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
    }
  }

  getStatusClass(status: AppointmentStatus): string {
    switch (status) {
      case AppointmentStatus.CONFIRMED:
        return 'status-confirmed';
      case AppointmentStatus.CANCELLED:
        return 'status-cancelled';
      default:
        return 'status-pending';
    }
  }
}
