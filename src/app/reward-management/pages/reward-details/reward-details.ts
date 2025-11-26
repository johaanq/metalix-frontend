import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDividerModule } from '@angular/material/divider';
import { AuthService } from '../../../core/services/auth.service';
import { User } from '../../../shared/models';
import { SidebarComponent } from '../../../shared/components/sidebar/sidebar';
import { RewardService, Reward } from '../../services/reward.service';

@Component({
  selector: 'app-reward-details',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatToolbarModule,
    MatSidenavModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatDividerModule,
    SidebarComponent
  ],
  templateUrl: './reward-details.html',
  styleUrl: './reward-details.css'
})
export class RewardDetailsComponent implements OnInit {
  currentUser: User | null = null;
  isSidenavOpen = true;
  isLoading = false;
  reward: Reward | null = null;
  rewardId: string | null = null;

  constructor(
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private rewardService: RewardService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    // Load sidebar state from localStorage
    const savedSidebarState = localStorage.getItem('sidebarCollapsed');
    this.isSidenavOpen = savedSidebarState !== 'true';

    this.currentUser = this.authService.getCurrentUser();

    this.route.params.subscribe(params => {
      if (params['id']) {
        this.rewardId = params['id'];
        if (this.rewardId) {
          this.loadReward(this.rewardId);
        } else {
          this.snackBar.open('Invalid reward ID', 'Close', { duration: 3000 });
          this.router.navigate(['/municipality/dashboard']);
        }
      } else {
        this.snackBar.open('Invalid reward ID', 'Close', { duration: 3000 });
        this.router.navigate(['/municipality/dashboard']);
      }
    });
  }

  private loadReward(id: string): void {
    this.isLoading = true;
    this.rewardService.getRewardById(id).subscribe({
      next: (reward) => {
        this.reward = reward;
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

  editReward(): void {
    if (this.rewardId) {
      this.router.navigate(['/municipality/rewards/edit', this.rewardId]);
    }
  }

  goBack(): void {
    this.router.navigate(['/municipality/dashboard']);
  }

  toggleSidenav(): void {
    this.isSidenavOpen = !this.isSidenavOpen;
    localStorage.setItem('sidebarCollapsed', (!this.isSidenavOpen).toString());
  }

  getCategoryLabel(category: string): string {
    const categories: { [key: string]: string } = {
      'SHOPPING': 'Shopping',
      'ENTERTAINMENT': 'Entertainment',
      'DINING': 'Dining',
      'SERVICES': 'Services',
      'DISCOUNTS': 'Discounts'
    };
    return categories[category] || category;
  }
}

