import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatIconModule } from '@angular/material/icon';
import { TranslateModule } from '@ngx-translate/core';
import { AppointmentService } from './appointment.service';
import { AppointmentStatus } from '../../models/appointment.model';

@Component({
  selector: 'app-appointment-management',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatProgressBarModule,
    MatIconModule,
    TranslateModule,
  ],
  templateUrl: './appointment-management.component.html',
  styleUrls: ['./appointment-management.component.scss'],
})
export class AppointmentManagementComponent {
  appointmentForm;
  loading = false;
  error: string | null = null;
  success: string | null = null;
  statuses = Object.values(AppointmentStatus);

  constructor(
    private fb: FormBuilder,
    private appointmentService: AppointmentService,
  ) {
    this.appointmentForm = this.fb.group({
      customerId: ['', Validators.required],
      serviceId: ['', Validators.required],
      staffId: ['', Validators.required],
      startTime: ['', Validators.required],
      endTime: ['', Validators.required],
      status: [AppointmentStatus.PENDING, Validators.required],
      notes: [''],
    });
  }

  onSubmit() {
    if (this.appointmentForm.invalid) return;
    
    this.loading = true;
    this.error = null;
    this.success = null;
    
    const formValue = this.appointmentForm.value;
    
    // Ensure all required fields are present and not null
    const { customerId, serviceId, staffId, startTime, endTime, status, notes } = formValue;
    
    if (!customerId || !serviceId || !staffId || !startTime || !endTime || !status) {
      this.loading = false;
      this.error = 'All fields are required.';
      return;
    }
    
    const appointmentData = {
      customerId,
      serviceId,
      staffId,
      startTime: new Date(startTime).toISOString(),
      endTime: new Date(endTime).toISOString(),
      status,
      notes: notes || undefined,
    };
    
    this.appointmentService.createAppointment(appointmentData).subscribe({
      next: (res) => {
        this.loading = false;
        if (res.success) {
          this.success = 'Appointment created successfully!';
          this.appointmentForm.reset({
            status: AppointmentStatus.PENDING
          });
        } else {
          this.error = res.message || 'Failed to create appointment.';
        }
      },
      error: (err) => {
        this.loading = false;
        this.error = err.error?.message || 'An error occurred while creating the appointment.';
      },
    });
  }
}
