import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ProfileSettingsComponent } from './profile-settings.component';
import { UserService } from './user.service';
import { of, throwError } from 'rxjs';
import { ReactiveFormsModule } from '@angular/forms';

describe('ProfileSettingsComponent', () => {
  let component: ProfileSettingsComponent;
  let fixture: ComponentFixture<ProfileSettingsComponent>;
  let userServiceSpy: jasmine.SpyObj<UserService>;

  beforeEach(async () => {
    userServiceSpy = jasmine.createSpyObj('UserService', ['updateProfile']);
    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule],
      declarations: [ProfileSettingsComponent],
      providers: [{ provide: UserService, useValue: userServiceSpy }],
    }).compileComponents();
    fixture = TestBed.createComponent(ProfileSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should display error on failed profile update', fakeAsync(() => {
    userServiceSpy.updateProfile.and.returnValue(throwError(() => ({ userMessage: 'Failed to update profile.' })));
    component.profileForm.setValue({ name: 'Test', email: 'test@test.com', contact: '123', avatar: null });
    component.onSubmit();
    tick();
    expect(component.error).toBe('Failed to update profile.');
  }));

  it('should display error if required fields missing', () => {
    component.profileForm.setValue({ name: '', email: '', contact: '', avatar: null });
    component.onSubmit();
    expect(component.error).toBe('All fields are required.');
  });

  it('should call updateProfile on valid submit', fakeAsync(() => {
    userServiceSpy.updateProfile.and.returnValue(of({ success: true }));
    component.profileForm.setValue({ name: 'Test', email: 'test@test.com', contact: '123', avatar: null });
    component.onSubmit();
    tick();
    expect(userServiceSpy.updateProfile).toHaveBeenCalled();
  }));
});
