import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { AuthService } from '../../../core/services/auth.service';
import { User } from '../../../shared/models';
import { SidebarComponent } from '../../../shared/components/sidebar/sidebar';
import { RewardService, Reward } from '../../services/reward.service';

@Component({
  selector: 'app-reward-form',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatToolbarModule,
    MatSidenavModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatDatepickerModule,
    MatNativeDateModule,
    SidebarComponent
  ],
  templateUrl: './reward-form.html',
  styleUrl: './reward-form.css'
})
export class RewardFormComponent implements OnInit {
  currentUser: User | null = null;
  isSidenavOpen = true;
  isLoading = false;
  isEditMode = false;
  rewardId: string | null = null;
  rewardForm: FormGroup;

  categories = [
    { value: 'SHOPPING', label: 'Shopping' },
    { value: 'ENTERTAINMENT', label: 'Entertainment' },
    { value: 'DINING', label: 'Dining' },
    { value: 'SERVICES', label: 'Services' },
    { value: 'DISCOUNTS', label: 'Discounts' }
  ];

  constructor(
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private rewardService: RewardService,
    private snackBar: MatSnackBar
  ) {
    this.rewardForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      description: ['', [Validators.required, Validators.minLength(10)]],
      pointsCost: [0, [Validators.required, Validators.min(1)]],
      category: ['SHOPPING', Validators.required],
      isActive: [true],
      stock: [1, [Validators.required, Validators.min(1)]], // Minimum 1 for creation (backend requires @Positive)
      validUntil: [null, Validators.required]
    });
  }

  ngOnInit(): void {
    // Load sidebar state from localStorage
    const savedSidebarState = localStorage.getItem('sidebarCollapsed');
    this.isSidenavOpen = savedSidebarState !== 'true';

    this.currentUser = this.authService.getCurrentUser();

    // Check if editing
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.isEditMode = true;
        this.rewardId = params['id'];
        if (this.rewardId) {
          this.loadReward(this.rewardId);
        }
      }
    });
  }

  private loadReward(id: string): void {
    this.isLoading = true;
    this.rewardService.getRewardById(id).subscribe({
      next: (reward) => {
        this.rewardForm.patchValue({
          name: reward.name,
          description: reward.description,
          pointsCost: reward.pointsCost,
          category: reward.category,
          isActive: reward.isActive,
          stock: reward.stock,
          validUntil: reward.validUntil ? new Date(reward.validUntil) : null
        });
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading reward:', error);
        this.isLoading = false;
        this.snackBar.open('Error loading reward', 'Close', { duration: 3000 });
        this.router.navigate(['/municipality/dashboard']);
      }
    });
  }

  onSubmit(): void {
    if (this.rewardForm.invalid) {
      this.rewardForm.markAllAsTouched();
      return;
    }

    if (!this.currentUser?.municipalityId) {
      this.snackBar.open('Municipality ID is required', 'Close', { duration: 3000 });
      return;
    }

    this.isLoading = true;
    const formValue = this.rewardForm.value;
    const rewardData: Partial<Reward> = {
      name: formValue.name,
      description: formValue.description,
      pointsCost: formValue.pointsCost,
      category: formValue.category,
      isActive: formValue.isActive,
      stock: formValue.stock,
      validUntil: formValue.validUntil ? new Date(formValue.validUntil).toISOString() : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
      municipalityId: this.currentUser.municipalityId
    };

    const operation = this.isEditMode && this.rewardId
      ? this.rewardService.updateReward(this.rewardId, rewardData)
      : this.rewardService.createReward(rewardData);

    operation.subscribe({
      next: () => {
        this.isLoading = false;
        this.snackBar.open(
          `✅ Reward ${this.isEditMode ? 'updated' : 'created'} successfully!`,
          'Close',
          {
            duration: 3000,
            horizontalPosition: 'center',
            verticalPosition: 'bottom',
            panelClass: ['success-snackbar']
          }
        );
        this.router.navigate(['/municipality/dashboard']);
      },
      error: (error) => {
        console.error(`Error ${this.isEditMode ? 'updating' : 'creating'} reward:`, error);
        this.isLoading = false;
        
        // Extract error message from response
        let errorMessage = `Error ${this.isEditMode ? 'updating' : 'creating'} reward.`;
        if (error.error?.message) {
          errorMessage = error.error.message;
        } else if (error.error?.error) {
          errorMessage = error.error.error;
        } else if (error.message) {
          errorMessage = error.message;
        }
        
        this.snackBar.open(
          errorMessage,
          'Close',
          {
            duration: 5000,
            panelClass: ['error-snackbar']
          }
        );
      }
    });
  }

  cancel(): void {
    this.router.navigate(['/municipality/dashboard']);
  }

  toggleSidenav(): void {
    this.isSidenavOpen = !this.isSidenavOpen;
    localStorage.setItem('sidebarCollapsed', (!this.isSidenavOpen).toString());
  }
}

