import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatStepperModule } from '@angular/material/stepper';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Appointment, AppointmentStatus } from '../../../models/appointment.model';

@Component({
  selector: 'app-appointment-create',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    MatStepperModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    TranslateModule,
  ],
  templateUrl: './appointment-create.component.html',
  styleUrls: ['./appointment-create.component.scss'],
})
export class AppointmentCreateComponent implements OnInit {
  isLinear = true;
  isLoading = false;
  isSubmitting = false;
  selectedDate: Date | null = null;
  availableTimeSlots: string[] = [];

  // Mock data - in a real app, this would come from a service
  services = [
    { id: 'haircut', name: 'Haircut', duration: 30, price: 30 },
    { id: 'hair-color', name: 'Hair Color', duration: 120, price: 80 },
    { id: 'manicure', name: 'Manicure', duration: 45, price: 25 },
    { id: 'pedicure', name: 'Pedicure', duration: 60, price: 35 },
    { id: 'facial', name: 'Facial', duration: 60, price: 50 },
  ];

  staffMembers = [
    { id: 'staff-1', name: 'Alex Johnson', services: ['haircut', 'hair-color'] },
    { id: 'staff-2', name: 'Maria Garcia', services: ['manicure', 'pedicure'] },
    { id: 'staff-3', name: 'James Smith', services: ['facial', 'haircut'] },
  ];

  // Form groups for the stepper
  serviceFormGroup: FormGroup;
  staffFormGroup: FormGroup;
  dateTimeFormGroup: FormGroup;
  detailsFormGroup: FormGroup;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar,
    private translate: TranslateService,
  ) {
    this.serviceFormGroup = this.fb.group({
      service: ['', Validators.required],
    });

    this.staffFormGroup = this.fb.group({
      staff: ['', Validators.required],
    });

    this.dateTimeFormGroup = this.fb.group({
      date: ['', Validators.required],
      time: ['', Validators.required],
    });

    this.detailsFormGroup = this.fb.group({
      notes: [''],
      terms: [false, Validators.requiredTrue],
    });
  }

  ngOnInit(): void {
    // If a service ID is provided in the route, pre-select it
    const serviceId = this.route.snapshot.queryParamMap.get('serviceId');
    if (serviceId) {
      const service = this.services.find((s) => s.id === serviceId);
      if (service) {
        this.serviceFormGroup.patchValue({ service: serviceId });
        this.onServiceSelect();
      }
    }
  }

  onServiceSelect(): void {
    const serviceId = this.serviceFormGroup.get('service')?.value;
    if (serviceId) {
      // Filter staff members who provide this service
      this.staffFormGroup.reset();
    }
  }

  onDateSelect(): void {
    const selectedDate = this.dateTimeFormGroup.get('date')?.value;
    if (selectedDate) {
      this.selectedDate = selectedDate;
      this.generateTimeSlots();
    }
  }

  private generateTimeSlots(): void {
    // In a real app, this would come from an API based on staff availability
    this.availableTimeSlots = [];
    const startHour = 9; // 9 AM
    const endHour = 18; // 6 PM

    for (let hour = startHour; hour < endHour; hour++) {
      this.availableTimeSlots.push(`${hour}:00`, `${hour}:30`);
    }
  }

  onSubmit(): void {
    if (this.detailsFormGroup.invalid) {
      return;
    }

    this.isSubmitting = true;

    // Simulate API call
    setTimeout(() => {
      this.isSubmitting = false;
      this.snackBar.open(this.translate.instant('APPOINTMENT.CREATE_SUCCESS'), this.translate.instant('COMMON.CLOSE'), { duration: 5000 });

      // Navigate to appointment list or confirmation page
      this.router.navigate(['/appointments']);
    }, 2000);
  }

  getSelectedService() {
    const serviceId = this.serviceFormGroup.get('service')?.value;
    return this.services.find((s) => s.id === serviceId);
  }

  getSelectedStaff() {
    const staffId = this.staffFormGroup.get('staff')?.value;
    return this.staffMembers.find((s) => s.id === staffId);
  }
}
