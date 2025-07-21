import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { StaffRequestService, CreateLeaveRequestPayload } from './staff-request.service';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { BaseComponent } from '../../core/base.component';
import { ErrorService } from '../../core/error.service';

@Component({
  selector: 'app-staff-request-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './staff-request-form.component.html',
})
export class StaffRequestFormComponent extends BaseComponent {
  @Input() staffId: string = '';
  @Output() requestCreated = new EventEmitter<void>();

  form: FormGroup;
  submitting = false;

  constructor(
    private fb: FormBuilder,
    private staffRequestService: StaffRequestService,
    protected override errorService: ErrorService,
  ) {
    super(errorService);
    this.form = this.fb.group({
      leaveFrom: ['', Validators.required],
      leaveTo: ['', Validators.required],
      reason: [''],
    });
  }

  submit() {
    if (this.form.invalid) return;
    this.submitting = true;
    this.error = null;
    const payload: CreateLeaveRequestPayload = {
      staffId: this.staffId,
      leaveFrom: this.form.value.leaveFrom,
      leaveTo: this.form.value.leaveTo,
      reason: this.form.value.reason,
    };
    this.staffRequestService.createLeaveRequest(payload).subscribe({
      next: () => {
        this.submitting = false;
        this.form.reset();
        this.requestCreated.emit();
      },
      error: (err) => {
        this.submitting = false;
        this.error = err.error?.error || 'Request failed.';
      },
    });
  }
}
