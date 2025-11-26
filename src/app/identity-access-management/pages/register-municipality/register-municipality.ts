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
import { MatStepperModule } from '@angular/material/stepper';
import { MatSelectModule } from '@angular/material/select';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';
import { LoadingService } from '../../../core/services/loading.service';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

export interface RegisterMunicipalityRequest {
  // Municipality data
  municipalityName: string;
  region: string;
  district: string;
  municipalityAddress: string;
  
  // Admin account (same email for municipality contact and admin login)
  email: string;
  password: string;
}

// Peru regions and districts
export const PERU_REGIONS = [
  'Amazonas', 'Áncash', 'Apurímac', 'Arequipa', 'Ayacucho', 'Cajamarca',
  'Callao', 'Cusco', 'Huancavelica', 'Huánuco', 'Ica', 'Junín', 'La Libertad',
  'Lambayeque', 'Lima', 'Loreto', 'Madre de Dios', 'Moquegua', 'Pasco',
  'Piura', 'Puno', 'San Martín', 'Tacna', 'Tumbes', 'Ucayali'
];

export const PERU_DISTRICTS: { [key: string]: string[] } = {
  'Lima': [
    'Lima', 'Miraflores', 'San Isidro', 'Surco', 'La Molina', 'Barranco',
    'Pueblo Libre', 'Magdalena', 'San Borja', 'Santiago de Surco', 'Chorrillos',
    'San Miguel', 'Callao', 'Ventanilla', 'Carmen de la Legua'
  ],
  'Arequipa': [
    'Arequipa', 'Yanahuara', 'Cayma', 'Cerro Colorado', 'Socabaya', 'Paucarpata'
  ],
  'Cusco': [
    'Cusco', 'San Sebastián', 'Santiago', 'Wanchaq', 'San Jerónimo'
  ],
  'La Libertad': [
    'Trujillo', 'Víctor Larco Herrera', 'La Esperanza', 'El Porvenir'
  ],
  'Piura': [
    'Piura', 'Castilla', 'Catacaos', 'Sullana'
  ],
  'Lambayeque': [
    'Chiclayo', 'Lambayeque', 'Ferreñafe'
  ],
  'Cajamarca': [
    'Cajamarca', 'Baños del Inca', 'Los Baños del Inca'
  ],
  'Junín': [
    'Huancayo', 'Chilca', 'El Tambo'
  ],
  'Ica': [
    'Ica', 'La Tinguiña', 'Los Aquijes'
  ],
  'Tacna': [
    'Tacna', 'Alto de la Alianza', 'Pocollay'
  ]
};

@Component({
  selector: 'app-register-municipality',
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
    MatStepperModule,
    MatSelectModule
  ],
  templateUrl: './register-municipality.html',
  styleUrl: './register-municipality.css'
})
export class RegisterMunicipalityComponent implements OnInit {
  registerForm: FormGroup;
  isLoading = false;
  hidePassword = true;
  hideConfirmPassword = true;
  peruRegions = PERU_REGIONS;
  peruDistricts = PERU_DISTRICTS;
  availableDistricts: string[] = [];

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private notificationService: NotificationService,
    private loadingService: LoadingService,
    private router: Router
  ) {
    this.registerForm = this.fb.group({
      // Municipality fields
      municipalityName: ['', [Validators.required, Validators.minLength(3)]],
      region: ['', [Validators.required]],
      district: ['', [Validators.required]],
      municipalityAddress: ['', [Validators.required, Validators.minLength(5)]],
      
      // Admin account
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
  }

  ngOnInit(): void {
    this.loadingService.loading$.subscribe(loading => {
      this.isLoading = loading;
    });
    
    // Watch for region changes to update available districts
    this.registerForm.get('region')?.valueChanges.subscribe(region => {
      if (region && this.peruDistricts[region]) {
        this.availableDistricts = this.peruDistricts[region];
        this.registerForm.get('district')?.setValue('');
      } else {
        this.availableDistricts = [];
        this.registerForm.get('district')?.setValue('');
      }
    });
  }
  
  hasRegionValue(): boolean {
    return !!this.registerForm.get('region')?.value;
  }
  
  hasDistrictValue(): boolean {
    return !!this.registerForm.get('district')?.value;
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
      
      const registerRequest: RegisterMunicipalityRequest = {
        municipalityName: registerData.municipalityName,
        region: registerData.region,
        district: registerData.district,
        municipalityAddress: registerData.municipalityAddress,
        email: registerData.email,
        password: registerData.password
      };
      
      this.http.post<any>(
        `${environment.apiUrl}${environment.endpoints.auth}/register-municipality`,
        registerRequest
      ).subscribe({
        next: (response) => {
          // Store token and user info
          localStorage.setItem('auth_token', response.token);
          
          // Get user details
          this.http.get<any>(`${environment.apiUrl}${environment.endpoints.users}/${response.userId}`).subscribe({
            next: (user) => {
              const userData = {
                id: user.id?.toString() || '',
                email: user.email || '',
                firstName: user.firstName || '',
                lastName: user.lastName || '',
                role: user.role,
                municipalityId: user.municipalityId?.toString(),
                phone: user.phone,
                address: user.address,
                city: user.city,
                zipCode: user.zipCode,
                isActive: user.isActive ?? true,
                createdAt: user.createdAt ? new Date(user.createdAt) : new Date(),
                updatedAt: user.updatedAt ? new Date(user.updatedAt) : new Date(),
                rfidCard: user.rfidCard,
                totalPoints: user.totalPoints
              };
              
              localStorage.setItem('current_user', JSON.stringify(userData));
              this.loadingService.hide();
              this.notificationService.showSuccess('Municipio registrado exitosamente! Bienvenido a Metalix!');
              this.router.navigate(['/dashboard']);
            },
            error: (error) => {
              this.loadingService.hide();
              this.notificationService.showError('Registration successful but failed to load user data. Please login.');
              this.router.navigate(['/auth/login']);
            }
          });
        },
        error: (error) => {
          this.loadingService.hide();
          const errorMessage = error.error?.message || 'Registration failed. Please try again.';
          this.notificationService.showError(errorMessage);
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
    if (control?.hasError('min')) {
      return `${fieldName} must be greater than ${control.errors?.['min'].min}`;
    }
    if (control?.hasError('pattern')) {
      if (fieldName === 'municipalityCode') {
        return 'Code must be 3-10 uppercase letters or numbers';
      }
      if (fieldName === 'zipCode') {
        return 'Please enter a valid zip code (e.g., 12345 or 12345-6789)';
      }
      if (fieldName === 'website') {
        return 'Please enter a valid website URL';
      }
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
}

