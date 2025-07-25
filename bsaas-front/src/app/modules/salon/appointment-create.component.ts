import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { ReactiveFormsModule } from '@angular/forms';
import { CreateAppointmentParams } from '../../models/appointment-params.model';
import { AppointmentStatus } from '../../models/appointment.model';
import { CurrentUserService } from '../../shared/current-user.service';

@Component({
  selector: 'app-appointment-create',
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatProgressBarModule,
    ReactiveFormsModule,
  ],
  templateUrl: './appointment-create.component.html',
  styleUrls: ['./appointment-create.component.scss'],
})
export class AppointmentCreateComponent implements OnInit {
  appointmentForm: FormGroup;
  salons: any[] = [];
  services: any[] = [];
  staffs: any[] = [];
  availableTimes: string[] = [];
  loading = false;
  error: string | null = null;
  success: string | null = null;
  userId: string | null = null;

  constructor(
    private http: HttpClient,
    private fb: FormBuilder,
    private router: Router,
    private currentUserService: CurrentUserService,
  ) {
    this.appointmentForm = this.fb.group({
      salonId: ['', Validators.required],
      serviceId: ['', Validators.required],
      staffId: [''],
      startTime: ['', Validators.required],
      endTime: [''],
      notes: [''],
      status: ['pending'],
    });
  }

  ngOnInit() {
    this.fetchSalons();
    this.currentUserService.loadCurrentUser();
    const user = this.currentUserService.currentUser;
    this.userId = user ? user.id : null;
  }

  fetchSalons() {
    this.http.get<any[]>('/api/salons').subscribe({
      next: (res) => {
        this.salons = res;
      },
      error: (err) => {
        this.error = err.error?.userMessage || err.error?.error || 'Failed to load salons.';
      },
    });
  }

  onSalonChange() {
    const salonId = this.appointmentForm.get('salonId')?.value;
    if (salonId) {
      this.http.get<any[]>(`/api/salons/${salonId}/services`).subscribe({
        next: (res) => {
          this.services = res;
        },
        error: (err) => {
          this.error = err.error?.userMessage || err.error?.error || 'Failed to load services.';
        },
      });
      this.http.get<any[]>(`/api/salons/${salonId}/staffs`).subscribe({
        next: (res) => {
          this.staffs = res;
        },
        error: (err) => {
          this.error = err.error?.userMessage || err.error?.error || 'Failed to load staffs.';
        },
      });
    }
  }

  onServiceChange() {
    const salonId = this.appointmentForm.get('salonId')?.value;
    const serviceId = this.appointmentForm.get('serviceId')?.value;
    if (salonId && serviceId) {
      this.http.get<string[]>(`/api/salons/${salonId}/services/${serviceId}/available-times`).subscribe({
        next: (res) => {
          this.availableTimes = res;
        },
        error: (err) => {
          this.error = err.error?.userMessage || err.error?.error || 'Failed to load available times.';
        },
      });
    }
  }

  submit() {
    if (this.appointmentForm.invalid || !this.userId) return;
    this.loading = true;
    this.error = null;
    const { salonId, serviceId, staffId, startTime, notes, status } = this.appointmentForm.value;
    if (!salonId || !serviceId || !startTime) {
      this.loading = false;
      this.error = 'Salon, service, and start time are required.';
      return;
    }
    // Calculate end time (assuming 1 hour duration for now)
    const endTime = new Date(new Date(startTime).getTime() + 60 * 60 * 1000).toISOString();
    
    const appointment: CreateAppointmentParams = {
      customerId: this.userId,
      salonId: salonId as string,
      serviceId: serviceId as string,
      staffId: staffId as string,
      startTime: new Date(startTime).toISOString(),
      endTime: endTime,
      status: status as AppointmentStatus,
      notes: notes as string | undefined,
    };
    this.http.post('/api/appointments', appointment).subscribe({
      next: () => {
        this.loading = false;
        this.success = 'Appointment created!';
        this.router.navigate(['/user/appointments']);
      },
      error: (err) => {
        this.loading = false;
        this.error = err.error?.userMessage || err.error?.error || 'Failed to create appointment.';
      },
    });
  }
}
