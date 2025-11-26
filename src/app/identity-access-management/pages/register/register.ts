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
import { MunicipalityService, Municipality } from '../../../municipality-management/services/municipality.service';

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
  municipalities: Municipality[] = [];
  loadingMunicipalities = false;
  accountType: 'citizen' | 'municipality' | null = null;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private notificationService: NotificationService,
    private loadingService: LoadingService,
    private municipalityService: MunicipalityService,
    private router: Router
  ) {
    this.registerForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      address: ['', [Validators.required, Validators.minLength(5)]],
      municipalityId: [{value: '', disabled: false}, [Validators.required]], // Use FormControl disabled property instead of HTML attribute
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
  }

  ngOnInit(): void {
    // Subscribe to loading state
    this.loadingService.loading$.subscribe(loading => {
      this.isLoading = loading;
    });
  }

  loadMunicipalities(): void {
    // Start loading immediately but don't block form display
    this.loadingMunicipalities = true;
    this.municipalities = []; // Clear previous data
    
    // Disable the control while loading
    this.registerForm.get('municipalityId')?.disable();
    
    this.municipalityService.getMunicipalities().subscribe({
      next: (municipalities) => {
        this.municipalities = municipalities.filter(m => m.isActive);
        this.loadingMunicipalities = false;
        // Re-enable the control after loading
        this.registerForm.get('municipalityId')?.enable();
      },
      error: (error) => {
        console.error('Error loading municipalities:', error);
        // Don't show error immediately, let user see the form
        // They can retry by selecting municipality field
        this.loadingMunicipalities = false;
        this.municipalities = [];
        // Re-enable the control even on error
        this.registerForm.get('municipalityId')?.enable();
      }
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
      // Use getRawValue() to get all values including disabled controls
      const formValue = this.registerForm.getRawValue();
      const { confirmPassword, ...registerData } = formValue;
      
      this.loadingService.show();
      
      const registerRequest: RegisterRequest = {
        email: registerData.email,
        password: registerData.password,
        firstName: registerData.firstName,
        lastName: registerData.lastName,
        role: 'CITIZEN', // Always register as CITIZEN
        address: registerData.address,
        municipalityId: registerData.municipalityId ? parseInt(registerData.municipalityId) : undefined
      };
      
      this.authService.register(registerRequest).subscribe({
        next: (response) => {
          this.loadingService.hide();
          this.notificationService.showSuccess('Registration successful! Welcome to Metalix!');
          // Navigate to dashboard after successful registration (user is already logged in)
          this.router.navigate(['/dashboard']);
        },
        error: (error) => {
          this.loadingService.hide();
          console.error('Registration error:', error);
          console.error('Error details:', {
            status: error.status,
            statusText: error.statusText,
            error: error.error,
            request: registerRequest
          });
          
          // Extract detailed error message
          let errorMessage = 'Registration failed. Please try again.';
          if (error.error?.message) {
            errorMessage = error.error.message;
          } else if (error.error?.error) {
            errorMessage = error.error.error;
          } else if (Array.isArray(error.error)) {
            errorMessage = error.error.map((e: any) => e.message || e).join(', ');
          } else if (typeof error.error === 'string') {
            errorMessage = error.error;
          }
          
          this.notificationService.showError(errorMessage);
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
    if (control?.hasError('pattern')) {
      return `${fieldName} format is invalid`;
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

  selectAccountType(type: 'citizen' | 'municipality'): void {
    this.accountType = type;
    if (type === 'citizen') {
      // Show form immediately and load municipalities in background
      this.loadMunicipalities();
    } else if (type === 'municipality') {
      // Navigate directly to municipality registration
      this.router.navigate(['/auth/register-municipality']);
    }
  }

  goBackToSelection(): void {
    this.accountType = null;
    this.registerForm.reset();
  }

  navigateToMunicipalityRegister(): void {
    this.router.navigate(['/auth/register-municipality']);
  }
}
