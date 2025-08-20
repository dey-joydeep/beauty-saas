import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ConfirmDialogComponent } from '@beauty-saas/shared/components/confirm-dialog/confirm-dialog.component';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Appointment } from '../models/appointment.model';
import { AppointmentService } from '../services/appointment.service';
import { AppointmentStatus } from '@beauty-saas/shared/enums/appointment-status.enum';

interface DialogResult {
  action: 'confirm' | 'cancel';
  reason?: string;
}

@Component({
  selector: 'app-appointment-list',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatPaginatorModule,
    MatChipsModule,
    MatTooltipModule,
    TranslateModule,
  ],
  templateUrl: './appointment-list.component.html',
  styleUrls: ['./appointment-list.component.scss'],
})
@Component({
  selector: 'app-appointment-list',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatPaginatorModule,
    MatChipsModule,
    MatTooltipModule,
    TranslateModule,
  ],
  templateUrl: './appointment-list.component.html',
  styleUrls: ['./appointment-list.component.scss'],
})
export class AppointmentListComponent implements OnInit {
  displayedColumns: string[] = ['service', 'date', 'status', 'price', 'actions'];
  dataSource: Appointment[] = [];
  isLoading = false;
  totalItems = 0;
  pageSize = 10;
  pageIndex = 0;

  constructor(
    private appointmentService: AppointmentService,
    private snackBar: MatSnackBar,
    private translate: TranslateService,
    private dialog: MatDialog,
  ) {}

  ngOnInit(): void {
    this.loadAppointments();
  }

  loadAppointments(): void {
    this.isLoading = true;

    const params = {
      page: this.pageIndex + 1,
      limit: this.pageSize,
    };

    this.appointmentService.getAppointments(params).subscribe({
      next: (response) => {
        this.dataSource = response.data;
        this.totalItems = response.total;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading appointments:', error);
        this.snackBar.open(this.translate.instant('APPOINTMENT.LIST.LOAD_ERROR'), this.translate.instant('COMMON.CLOSE'), {
          duration: 5000,
        });
        this.isLoading = false;
      },
    });
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadAppointments();
  }

  onCancelAppointment(appointment: Appointment): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: this.translate.instant('APPOINTMENT.CANCEL_CONFIRM_TITLE'),
        message: this.translate.instant('APPOINTMENT.CANCEL_CONFIRM_MESSAGE'),
        confirmText: this.translate.instant('APPOINTMENT.CANCEL'),
        cancelText: this.translate.instant('COMMON.CANCEL'),
        showReason: true,
      },
    });

    dialogRef.afterClosed().subscribe((result: DialogResult) => {
      if (result?.action === 'confirm') {
        this.isLoading = true;
        const reason = result.reason || '';
        this.appointmentService.cancelAppointment(appointment.id, reason).subscribe({
          next: () => {
            this.snackBar.open(this.translate.instant('APPOINTMENT.CANCEL_SUCCESS'), this.translate.instant('COMMON.CLOSE'), {
              duration: 5000,
            });
            this.loadAppointments();
          },
          error: (error) => {
            console.error('Error cancelling appointment:', error);
            this.snackBar.open(this.translate.instant('APPOINTMENT.CANCEL_ERROR'), this.translate.instant('COMMON.CLOSE'), {
              duration: 5000,
            });
            this.isLoading = false;
          },
        });
      }
    });
  }

  onReschedule(appointment: Appointment): void {
    // Implementation for reschedule
    this.snackBar.open(this.translate.instant('APPOINTMENT.RESCHEDULE_MESSAGE'), this.translate.instant('COMMON.CLOSE'), {
      duration: 3000,
    });
  }

  getStatusChipClass(status: AppointmentStatus): string {
    switch (status) {
      case AppointmentStatus.PENDING:
        return 'status-confirmed';
      case AppointmentStatus.CONFIRMED:
        return 'status-completed';
      case AppointmentStatus.CANCELLED:
        return 'status-cancelled';
      default:
        return '';
    }
  }

  private getMockAppointments(): Appointment[] {
    const statuses: AppointmentStatus[] = [
      AppointmentStatus.PENDING,
      AppointmentStatus.CONFIRMED,
      AppointmentStatus.COMPLETED,
      AppointmentStatus.CANCELLED,
      AppointmentStatus.NOSHOW,
    ];
    const services = ['Haircut', 'Coloring', 'Manicure', 'Pedicure', 'Facial', 'Massage', 'Waxing', 'Makeup', 'Eyebrows', 'Hair Treatment'];
    const now = new Date();

    return Array.from({ length: 10 }, (_, i) => {
      const startTime = new Date(now.getFullYear(), now.getMonth(), now.getDate() + i, 10 + (i % 8));
      const endTime = new Date(startTime);
      endTime.setHours(startTime.getHours() + 1);
      const appointmentDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + i);

      return {
        id: `A${1000 + i}`,
        customerId: 'current-user-id',
        serviceId: `service-${(i % services.length) + 1}`,
        staffId: `staff-${(i % 5) + 1}`,
        salonId: `salon-${(i % 3) + 1}`,
        appointmentDate: appointmentDate.toISOString().split('T')[0],
        startTime: startTime.toISOString().split('T')[1].slice(0, 5),
        endTime: endTime.toISOString().split('T')[1].slice(0, 5),
        status: statuses[i % statuses.length],
        notes: i % 3 === 0 ? 'Special instructions here' : undefined,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    });
  }
}
