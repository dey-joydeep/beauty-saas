import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Booking, BookingStatus } from '../../../models/booking.model';
import { BookingCancelDialogComponent } from '../booking-cancel-dialog/booking-cancel-dialog.component';

@Component({
  selector: 'app-booking-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    MatProgressSpinnerModule,
    MatDialogModule,
    MatSnackBarModule,
    TranslateModule,
  ],
  templateUrl: './booking-detail.component.html',
  styleUrls: ['./booking-detail.component.scss'],
})
export class BookingDetailComponent implements OnInit {
  booking: Booking | null = null;
  isLoading = true;
  isUpdating = false;
  BookingStatus = BookingStatus;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private translate: TranslateService,
  ) {}

  ngOnInit(): void {
    // Simulate API call to get booking details
    setTimeout(() => {
      const bookingId = this.route.snapshot.paramMap.get('id');
      this.booking = this.getMockBooking(bookingId || '1');
      this.isLoading = false;
    }, 1000);
  }

  onCancelBooking(): void {
    if (!this.booking) return;

    const dialogRef = this.dialog.open(BookingCancelDialogComponent, {
      width: '450px',
      data: { booking: this.booking },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result === 'confirm' && this.booking) {
        this.cancelBooking(this.booking.id);
      }
    });
  }

  onReschedule(): void {
    if (this.booking) {
      this.router.navigate(['/bookings', this.booking.id, 'reschedule']);
    }
  }

  private cancelBooking(bookingId: string): void {
    this.isUpdating = true;

    // Simulate API call to cancel booking
    setTimeout(() => {
      if (this.booking) {
        this.booking.status = BookingStatus.CANCELLED;
        this.snackBar.open(this.translate.instant('BOOKING.CANCELLATION_SUCCESS'), this.translate.instant('COMMON.CLOSE'), {
          duration: 5000,
        });
      }
      this.isUpdating = false;
    }, 1000);
  }

  private getMockBooking(id: string): Booking {
    // In a real app, this would come from an API
    const mockBookings: Booking[] = [
      {
        id: '1',
        salonId: 'salon-1',
        userId: 'user-1',
        staffId: 'staff-1',
        serviceId: 'haircut',
        date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        time: '14:30',
        status: BookingStatus.BOOKED,
        notes: 'Please trim the sides shorter than the top.',
      },
      {
        id: '2',
        salonId: 'salon-2',
        userId: 'user-1',
        staffId: 'staff-3',
        serviceId: 'facial',
        date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        time: '11:00',
        status: BookingStatus.BOOKED,
        notes: 'Sensitive skin - please use gentle products.',
      },
    ];

    const booking = mockBookings.find((b) => b.id === id);
    return booking || mockBookings[0];
  }

  getServiceName(serviceId: string): string {
    // In a real app, this would come from a service
    const services: { [key: string]: string } = {
      haircut: 'Haircut',
      'hair-color': 'Hair Coloring',
      manicure: 'Manicure',
      pedicure: 'Pedicure',
      facial: 'Facial Treatment',
    };
    return services[serviceId] || 'Service';
  }

  getStaffName(staffId: string): string {
    // In a real app, this would come from a service
    const staff: { [key: string]: string } = {
      'staff-1': 'Alex Johnson',
      'staff-2': 'Maria Garcia',
      'staff-3': 'James Smith',
    };
    return staff[staffId] || 'Staff Member';
  }

  getSalonName(salonId: string): string {
    // In a real app, this would come from a service
    const salons: { [key: string]: string } = {
      'salon-1': 'Elegant Beauty Salon',
      'salon-2': 'Modern Spa & Wellness',
    };
    return salons[salonId] || 'Salon';
  }

  getStatusText(status: BookingStatus): string {
    switch (status) {
      case BookingStatus.BOOKED:
        return 'Confirmed';
      case BookingStatus.COMPLETED:
        return 'Completed';
      case BookingStatus.CANCELLED:
        return 'Cancelled';
      default:
        return 'Unknown';
    }
  }

  getStatusClass(status: BookingStatus): string {
    switch (status) {
      case BookingStatus.BOOKED:
        return 'status-confirmed';
      case BookingStatus.COMPLETED:
        return 'status-completed';
      case BookingStatus.CANCELLED:
        return 'status-cancelled';
      default:
        return '';
    }
  }
}
