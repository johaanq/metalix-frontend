import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { MatSelectModule } from '@angular/material/select';
import { MatStepperModule } from '@angular/material/stepper';
import { AuthService, RegisterRequest } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';
import { LoadingService } from '../../../core/services/loading.service';
import { UserRole } from '../../../shared/models';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatDividerModule,
    MatSelectModule,
    MatStepperModule
  ],
  templateUrl: './register.html',
  styleUrl: './register.css'
})
export class RegisterComponent implements OnInit {
  registerForm: FormGroup;
  isLoading = false;
  hidePassword = true;
  hideConfirmPassword = true;
  selectedRole: UserRole = UserRole.CITIZEN;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private notificationService: NotificationService,
    private loadingService: LoadingService,
    private router: Router
  ) {
    this.registerForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]],
      role: [UserRole.CITIZEN, [Validators.required]],
      municipalityId: ['']
    }, { validators: this.passwordMatchValidator });
  }

  ngOnInit(): void {
    // Subscribe to loading state
    this.loadingService.loading$.subscribe(loading => {
      this.isLoading = loading;
    });

    // Watch role changes to show/hide municipality field
    this.registerForm.get('role')?.valueChanges.subscribe(role => {
      this.selectedRole = role;
      const municipalityControl = this.registerForm.get('municipalityId');
      if (role === UserRole.MUNICIPALITY_ADMIN) {
        municipalityControl?.setValidators([Validators.required]);
      } else {
        municipalityControl?.clearValidators();
      }
      municipalityControl?.updateValueAndValidity();
    });
  }

  passwordMatchValidator(form: FormGroup) {
    const password = form.get('password');
    const confirmPassword = form.get('confirmPassword');
    
    if (password && confirmPassword && password.value !== confirmPassword.value) {
      confirmPassword.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }
    
    return null;
  }

  onSubmit(): void {
    if (this.registerForm.valid) {
      const formValue = this.registerForm.value;
      const { confirmPassword, ...registerData } = formValue;
      
      this.loadingService.show();
      
      const registerRequest: RegisterRequest = {
        firstName: registerData.firstName,
        lastName: registerData.lastName,
        email: registerData.email,
        password: registerData.password,
        role: registerData.role,
        municipalityId: registerData.municipalityId || undefined
      };
      
      this.authService.register(registerRequest).subscribe({
        next: (user) => {
          this.loadingService.hide();
          this.notificationService.showSuccess('Registration successful! You can now log in.');
          this.router.navigate(['/auth/login']);
        },
        error: (error) => {
          this.loadingService.hide();
          this.notificationService.showError('Registration failed. Please try again.');
          console.error('Registration error:', error);
        }
      });
    } else {
      this.markFormGroupTouched();
    }
  }

  private markFormGroupTouched(): void {
    Object.keys(this.registerForm.controls).forEach(key => {
      const control = this.registerForm.get(key);
      control?.markAsTouched();
    });
  }

  getErrorMessage(fieldName: string): string {
    const control = this.registerForm.get(fieldName);
    if (control?.hasError('required')) {
      return `${fieldName} is required`;
    }
    if (control?.hasError('email')) {
      return 'Please enter a valid email address';
    }
    if (control?.hasError('minlength')) {
      return `${fieldName} must be at least ${control.errors?.['minlength'].requiredLength} characters long`;
    }
    if (control?.hasError('passwordMismatch')) {
      return 'Passwords do not match';
    }
    return '';
  }

  togglePasswordVisibility(): void {
    this.hidePassword = !this.hidePassword;
  }

  toggleConfirmPasswordVisibility(): void {
    this.hideConfirmPassword = !this.hideConfirmPassword;
  }

  navigateToLogin(): void {
    this.router.navigate(['/auth/login']);
  }

  get userRoles() {
    return Object.values(UserRole);
  }

  getRoleDisplayName(role: UserRole): string {
    switch (role) {
      case UserRole.CITIZEN:
        return 'Citizen';
      case UserRole.MUNICIPALITY_ADMIN:
        return 'Municipality Administrator';
      case UserRole.SYSTEM_ADMIN:
        return 'System Administrator';
      default:
        return role;
    }
  }
}
