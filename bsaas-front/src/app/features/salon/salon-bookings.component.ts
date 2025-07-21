import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { TranslateModule } from '@ngx-translate/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-salon-bookings',
  standalone: true,
  imports: [CommonModule, TranslateModule, RouterModule],
  templateUrl: './salon-bookings.component.html',
  styleUrls: ['./salon-bookings.component.scss'],
})
export class SalonBookingsComponent {
  @Input() salonId?: string;
  bookings: any[] = [];
  loading = true;
  error: string | null = null;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    if (!this.salonId) {
      this.error = 'Salon ID is required.';
      this.loading = false;
      return;
    }
    this.http.get(`/api/salon/${this.salonId}/bookings`).subscribe({
      next: (data: any) => {
        this.bookings = data;
        this.loading = false;
      },
      error: (err) => {
        this.error = err.error?.userMessage || err.error?.error || 'Failed to load bookings';
        this.loading = false;
      },
    });
  }
}
