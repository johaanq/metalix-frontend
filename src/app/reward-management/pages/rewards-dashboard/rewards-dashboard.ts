import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatChipsModule } from '@angular/material/chips';
import { MatBadgeModule } from '@angular/material/badge';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTabsModule } from '@angular/material/tabs';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AuthService } from '../../../core/services/auth.service';
import { User, UserRole } from '../../../shared/models';
import { SidebarComponent } from '../../../shared/components/sidebar/sidebar';
import { RewardService, Reward, RewardTransaction } from '../../services/reward.service';

@Component({
  selector: 'app-rewards-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatToolbarModule,
    MatSidenavModule,
    MatListModule,
    MatGridListModule,
    MatChipsModule,
    MatBadgeModule,
    MatDividerModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatProgressSpinnerModule,
    MatTabsModule,
    MatDialogModule,
    MatSnackBarModule,
    SidebarComponent
  ],
  templateUrl: './rewards-dashboard.html',
  styleUrl: './rewards-dashboard.css'
})
export class RewardsDashboard implements OnInit {
  currentUser: User | null = null;
  isSidenavOpen = true;
  isLoading = false;

  // Rewards stats
  stats = {
    totalPoints: 0,
    availablePoints: 0,
    redeemedPoints: 0,
    rewardsEarned: 0
  };

  // Available rewards
  availableRewards: any[] = [];

  // Redeemed rewards history
  redeemedRewards: any[] = [];

  // Points history
  pointsHistory: any[] = [];

  constructor(
    private authService: AuthService,
    private snackBar: MatSnackBar,
    private rewardService: RewardService
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    this.loadRewardsData();
    this.loadAvailableRewards();
    this.loadTransactionHistory();
  }

  private loadRewardsData(): void {
    console.log('Loading rewards data for user:', this.currentUser);
    if (this.currentUser) {
      // Update stats with user's actual points
      this.stats.totalPoints = this.currentUser.totalPoints || 0;
      
      // Load transaction history to calculate redeemed points
      if (this.currentUser.id) {
        this.rewardService.getUserTransactions(this.currentUser.id).subscribe({
          next: (transactions: RewardTransaction[]) => {
            const redeemedPoints = transactions
              .filter(t => t.transactionType === 'REDEEMED' && t.status === 'COMPLETED')
              .reduce((sum, t) => sum + Math.abs(t.points), 0);
            
            this.stats.redeemedPoints = redeemedPoints;
            this.stats.availablePoints = this.stats.totalPoints - redeemedPoints;
            this.stats.rewardsEarned = transactions.filter(t => t.transactionType === 'REDEEMED').length;
          },
          error: (error) => {
            console.error('Error loading transactions:', error);
            this.stats.availablePoints = this.stats.totalPoints;
          }
        });
      }
    }
  }

  private loadAvailableRewards(): void {
    const municipalityId = this.currentUser?.municipalityId;
    
    this.rewardService.getRewards(municipalityId).subscribe({
      next: (rewards: Reward[]) => {
        this.availableRewards = rewards.map(r => ({
          id: r.id,
          name: r.name,
          description: r.description,
          pointsRequired: r.pointsCost,
          category: this.formatCategory(r.category),
          icon: this.getCategoryIcon(r.category),
          available: r.isActive && r.stock > 0
        }));
      },
      error: (error) => {
        console.error('Error loading rewards:', error);
        this.snackBar.open('Error loading rewards', 'Close', { duration: 3000 });
      }
    });
  }

  private loadTransactionHistory(): void {
    if (!this.currentUser?.id) return;
    
    this.rewardService.getUserTransactions(this.currentUser.id).subscribe({
      next: (transactions: RewardTransaction[]) => {
        // Load redeemed rewards
        this.redeemedRewards = transactions
          .filter(t => t.transactionType === 'REDEEMED')
          .map(t => ({
            id: t.id,
            name: t.description,
            pointsUsed: Math.abs(t.points),
            redeemedDate: new Date(t.timestamp).toISOString().split('T')[0],
            status: t.status === 'COMPLETED' ? 'Used' : 'Pending',
            icon: 'card_giftcard'
          }));

        // Load points history
        this.pointsHistory = transactions.map(t => ({
          id: t.id,
          description: t.description,
          points: t.points,
          date: new Date(t.timestamp).toISOString().split('T')[0],
          type: t.transactionType === 'EARNED' ? 'earned' : 'redeemed',
          icon: t.transactionType === 'EARNED' ? 'recycling' : 'card_giftcard'
        })).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      },
      error: (error) => {
        console.error('Error loading transaction history:', error);
      }
    });
  }

  private formatCategory(category: string): string {
    const categories: any = {
      'SHOPPING': 'Shopping',
      'ENTERTAINMENT': 'Entertainment',
      'DINING': 'Food & Beverage',
      'SERVICES': 'Services',
      'DISCOUNTS': 'Discounts'
    };
    return categories[category] || category;
  }

  private getCategoryIcon(category: string): string {
    const icons: any = {
      'SHOPPING': 'shopping_cart',
      'ENTERTAINMENT': 'movie',
      'DINING': 'restaurant',
      'SERVICES': 'build',
      'DISCOUNTS': 'local_offer'
    };
    return icons[category] || 'card_giftcard';
  }

  toggleSidenav(): void {
    this.isSidenavOpen = !this.isSidenavOpen;
  }

  redeemReward(reward: any): void {
    if (!this.currentUser) {
      this.snackBar.open('Please log in to redeem rewards', 'Close', { duration: 3000 });
      return;
    }

    if (reward.pointsRequired > this.stats.availablePoints) {
      this.snackBar.open(
        `❌ Insufficient points! You need ${reward.pointsRequired} points but only have ${this.stats.availablePoints}.`,
        'Close',
        {
          duration: 4000,
          horizontalPosition: 'center',
          verticalPosition: 'top',
          panelClass: ['error-snackbar']
        }
      );
      return;
    }

    // Confirm expensive rewards
    if (reward.pointsRequired >= 300) {
      const confirmed = confirm(`Are you sure you want to redeem "${reward.name}" for ${reward.pointsRequired} points?`);
      if (!confirmed) {
        return;
      }
    }

    this.isLoading = true;
    console.log('Redeeming reward:', reward.name, 'for', reward.pointsRequired, 'points');
    
    // Use reward service to redeem
    this.rewardService.redeemReward(this.currentUser.id, reward.id).subscribe({
      next: (transaction) => {
        this.isLoading = false;
        
        // Reload data to reflect changes
        this.loadRewardsData();
        this.loadTransactionHistory();
        
        // Show success notification
        this.snackBar.open(
          `🎉 ${reward.name} redeemed successfully! Check "My Rewards" tab.`,
          'Close',
          {
            duration: 5000,
            horizontalPosition: 'center',
            verticalPosition: 'top',
            panelClass: ['success-snackbar']
          }
        );
        
        console.log('Reward redeemed successfully:', transaction);
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Error redeeming reward:', error);
        this.snackBar.open('Error redeeming reward. Please try again.', 'Close', { duration: 3000 });
      }
    });
  }

  canRedeemReward(reward: any): boolean {
    return reward.available && reward.pointsRequired <= this.stats.availablePoints;
  }

  getRewardCategoryColor(category: string): string {
    switch (category) {
      case 'Food & Beverage':
        return 'primary';
      case 'Entertainment':
        return 'accent';
      case 'Shopping':
        return 'warn';
      case 'Health & Wellness':
        return 'primary';
      case 'Education':
        return 'accent';
      default:
        return 'primary';
    }
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'Used':
        return 'primary';
      case 'Pending':
        return 'accent';
      case 'Expired':
        return 'warn';
      default:
        return 'primary';
    }
  }

  getPointsColor(points: number): string {
    return points > 0 ? 'primary' : 'warn';
  }

  getPointsIcon(type: string): string {
    return type === 'earned' ? 'add' : 'remove';
  }

  viewRewardDetails(reward: any): void {
    const message = `
      Reward: ${reward.name}
      Category: ${reward.category}
      Description: ${reward.description}
      Points Required: ${reward.pointsRequired}
      Status: ${reward.available ? 'Available' : 'Unavailable'}
    `;
    
    this.snackBar.open(message, 'Close', {
      duration: 8000,
      horizontalPosition: 'center',
      verticalPosition: 'top',
      panelClass: ['reward-details-snackbar']
    });
  }
}