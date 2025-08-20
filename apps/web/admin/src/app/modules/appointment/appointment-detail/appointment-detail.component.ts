import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Subscription, finalize } from 'rxjs';

import { AppointmentCancelDialogComponent } from '../appointment-cancel-dialog/appointment-cancel-dialog.component';
import { AppointmentWithDetails } from '../models/appointment.model';
import { AppointmentService } from '../services/appointment.service';
import { AppointmentStatus } from '@beauty-saas/shared/enums/appointment-status.enum';

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
  // The appointment to display with all details
  appointment: AppointmentWithDetails | null = null;
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
    private translate: TranslateService,
  ) {}

  ngOnInit(): void {
    this.loadAppointment();
  }

  ngOnDestroy(): void {
    // Clean up all subscriptions when component is destroyed
    this.subscriptions.forEach((sub) => sub.unsubscribe());
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
        const cancelSubscription = this.appointmentService
          .cancelAppointment(this.appointment.id, result.reason || 'No reason provided')
          .pipe(finalize(() => (this.isUpdating = false)))
          .subscribe({
            next: () => {
              this.snackBar.open(this.translate.instant('APPOINTMENT.CANCELLATION_SUCCESS'), this.translate.instant('COMMON.CLOSE'), {
                duration: 5000,
              });
              this.loadAppointment();
            },
            error: (error: any) => {
              console.error('Error cancelling appointment:', error);
              this.snackBar.open(this.translate.instant('APPOINTMENT.CANCELLATION_ERROR'), this.translate.instant('COMMON.CLOSE'), {
                duration: 5000,
              });
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
      this.snackBar.open(this.translate.instant('APPOINTMENT.INVALID_ID'), this.translate.instant('COMMON.CLOSE'), { duration: 5000 });
      this.router.navigate(['/appointments']);
      return;
    }

    this.isLoading = true;
    const subscription = this.appointmentService
      .getAppointment(id)
      .pipe(finalize(() => (this.isLoading = false)))
      .subscribe({
        next: (appointment: AppointmentWithDetails) => {
          // Use the appointment as is since the API should return it in the correct format
          this.appointment = appointment;
        },
        error: (error: any) => {
          console.error('Error loading appointment:', error);
          this.snackBar.open(this.translate.instant('APPOINTMENT.LOAD_ERROR'), this.translate.instant('COMMON.CLOSE'), { duration: 5000 });
          this.router.navigate(['/appointments']);
        },
      });

    // Store subscription for cleanup
    this.subscriptions.push(subscription);
  }

  private getMockAppointment(id: string): AppointmentWithDetails {
    const now = new Date();
    const oneHourLater = new Date(now.getTime() + 3600000); // 1 hour later
    const appointmentDate = now.toISOString().split('T')[0]; // Just the date part

    return {
      id,
      customerId: '1',
      customerName: 'Test Customer',
      customerEmail: 'test@example.com',
      customerPhone: '123-456-7890',
      serviceId: '1',
      serviceName: 'Test Service',
      serviceDuration: 60,
      servicePrice: 50,
      staffId: '1',
      staffName: 'Test Staff',
      salonId: '1',
      salonName: 'Test Salon',
      // Required by Appointment interface
      appointmentDate: appointmentDate,
      // Additional details for the view
      startTime: now.toISOString(),
      endTime: oneHourLater.toISOString(),
      status: AppointmentStatus.CONFIRMED,
      notes: 'Test appointment',
      paymentStatus: 'paid',
      amountPaid: 50,
      totalAmount: 50,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
      createdBy: 'system',
      metadata: {},
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

