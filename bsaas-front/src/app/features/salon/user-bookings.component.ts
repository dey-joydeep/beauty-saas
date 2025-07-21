import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { TranslateModule } from '@ngx-translate/core';
import { CurrentUserService } from '../../shared/current-user.service';

@Component({
  selector: 'app-user-bookings',
  standalone: true,
  imports: [CommonModule, RouterModule, DatePipe, TranslateModule],
  templateUrl: './user-bookings.component.html',
  styleUrls: ['./user-bookings.component.scss'],
})
export class UserBookingsComponent implements OnInit {
  bookings: any[] = [];
  loading = true;
  error: string | null = null;
  userId: string | null = null;

  constructor(
    private http: HttpClient,
    private currentUserService: CurrentUserService,
  ) {}

  ngOnInit(): void {
    this.currentUserService.loadCurrentUser();
    const user = this.currentUserService.currentUser;
    this.userId = user ? user.id : null;
    if (!this.userId) {
      this.error = 'You must be logged in.';
      this.loading = false;
      return;
    }
    this.http.get(`/api/user/${this.userId}/bookings`).subscribe({
      next: (data: any) => {
        this.bookings = data;
        this.loading = false;
      },
      error: (err: any) => {
        this.error = err.error?.error || 'Failed to load bookings';
        this.loading = false;
      },
    });
  }
}
