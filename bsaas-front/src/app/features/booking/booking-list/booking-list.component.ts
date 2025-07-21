import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Booking } from '../../../models/booking.model';
import { BookingStatus } from '../../../models/enums';

@Component({
  selector: 'app-booking-list',
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
  templateUrl: './booking-list.component.html',
  styleUrls: ['./booking-list.component.scss'],
})
export class BookingListComponent implements OnInit {
  displayedColumns: string[] = ['service', 'date', 'status', 'price', 'actions'];
  dataSource: Booking[] = [];
  isLoading = false;
  totalItems = 0;
  pageSize = 10;
  pageIndex = 0;

  constructor(
    private snackBar: MatSnackBar,
    private translate: TranslateService,
  ) {}

  ngOnInit(): void {
    this.loadBookings();
  }

  loadBookings(): void {
    this.isLoading = true;

    // Simulate API call
    setTimeout(() => {
      this.dataSource = this.getMockBookings();
      this.totalItems = 25; // Mock total items
      this.isLoading = false;
    }, 1000);
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadBookings();
  }

  onCancelBooking(booking: Booking): void {
    // Simulate API call
    setTimeout(() => {
      this.snackBar.open(this.translate.instant('BOOKING.CANCEL_SUCCESS', { id: booking.id }), this.translate.instant('COMMON.CLOSE'), {
        duration: 3000,
      });
      this.loadBookings();
    }, 500);
  }

  onReschedule(booking: Booking): void {
    // Implementation for reschedule
    this.snackBar.open(this.translate.instant('BOOKING.RESCHEDULE_MESSAGE'), this.translate.instant('COMMON.CLOSE'), { duration: 3000 });
  }

  getStatusChipClass(status: BookingStatus): string {
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

  private getMockBookings(): Booking[] {
    const statuses: BookingStatus[] = [BookingStatus.BOOKED, BookingStatus.COMPLETED, BookingStatus.CANCELLED];
    const services = [
      'Haircut',
      'Hair Color',
      'Manicure',
      'Pedicure',
      'Facial',
      'Massage',
      'Waxing',
      'Makeup',
      'Eyebrows',
      'Hair Treatment',
    ];
    const now = new Date();

    return Array.from({ length: 10 }, (_, i) => ({
      id: `B${1000 + i}`,
      salonId: `salon-${(i % 3) + 1}`,
      userId: 'current-user-id',
      staffId: `staff-${(i % 5) + 1}`,
      serviceId: `service-${(i % services.length) + 1}`,
      date: new Date(now.getFullYear(), now.getMonth(), now.getDate() + i).toISOString().split('T')[0],
      time: `${10 + (i % 8)}:00`,
      status: statuses[i % statuses.length],
      notes: i % 3 === 0 ? 'Special instructions here' : undefined,
    }));
  }
}
