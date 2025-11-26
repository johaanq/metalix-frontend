import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Subscription, forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
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
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { User, UserRole } from '../../../shared/models';
import { SidebarComponent } from '../../../shared/components/sidebar/sidebar';
import { UserIdentificationService } from '../../services/user-identification.service';
import { WasteCollectionService } from '../../../waste-collection/services/waste-collection.service';
import { RewardService } from '../../../reward-management/services/reward.service';

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
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
    SidebarComponent
  ],
  templateUrl: './user-profile.html',
  styleUrl: './user-profile.css'
})
export class UserProfile implements OnInit, OnDestroy {
  currentUser: User | null = null;
  isSidenavOpen = true;
  isLoading = false;
  isEditing = false;
  isDataLoaded = false;
  private userSubscription?: Subscription;

  // User profile data
  profileData = {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    zipCode: '',
    municipality: '',
    role: '',
    memberSince: '',
    totalPoints: 0,
    wasteCollected: 0,
    rewardsEarned: 0
  };

  // Achievement badges - will be loaded from backend
  achievements: any[] = [];

  // Activity history - will be loaded from backend
  activityHistory: any[] = [];

  constructor(
    private authService: AuthService,
    private userIdentificationService: UserIdentificationService,
    private wasteCollectionService: WasteCollectionService,
    private rewardService: RewardService
  ) {}

  ngOnInit(): void {
    console.log('User Profile - Initializing');
    
    // Subscribe to user changes
    this.userSubscription = this.authService.currentUser$.subscribe(user => {
      console.log('User Profile - User updated:', user);
      this.currentUser = user;
      
      // If no user from observable, try localStorage
      if (!this.currentUser) {
        const userStr = localStorage.getItem('current_user');
        if (userStr) {
          try {
            this.currentUser = JSON.parse(userStr);
            console.log('User loaded from localStorage:', this.currentUser);
          } catch (error) {
            console.error('Error parsing user from localStorage:', error);
          }
        }
      }
      
      // Load sidebar state from localStorage
      const savedSidebarState = localStorage.getItem('sidebarCollapsed');
      this.isSidenavOpen = savedSidebarState !== 'true';

      this.loadProfileData();
    });
  }

  ngOnDestroy(): void {
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
  }

  private loadProfileData(): void {
    console.log('Loading profile data for user:', this.currentUser);
    this.isDataLoaded = false;
    
    if (this.currentUser) {
      // Handle createdAt - could be string or Date object
      let memberSinceDate = '2024-01-01';
      if (this.currentUser.createdAt) {
        try {
          const createdAt: any = this.currentUser.createdAt;
          if (typeof createdAt === 'string') {
            memberSinceDate = createdAt.split('T')[0];
          } else if (createdAt instanceof Date) {
            memberSinceDate = createdAt.toISOString().split('T')[0];
          }
        } catch (error) {
          console.error('Error parsing createdAt date:', error);
        }
      }
      
      // Only show points for CITIZEN role
      const isCitizen = this.currentUser.role === 'CITIZEN';
      
      this.profileData = {
        firstName: this.currentUser.firstName || '',
        lastName: this.currentUser.lastName || '',
        email: this.currentUser.email || '',
        phone: this.currentUser.phone || '',
        address: this.currentUser.address || '',
        city: this.currentUser.city || '',
        zipCode: this.currentUser.zipCode || '',
        municipality: this.currentUser.municipality || '',
        role: this.currentUser.role || 'CITIZEN',
        memberSince: memberSinceDate,
        totalPoints: isCitizen ? (this.currentUser.totalPoints || 0) : 0,
        wasteCollected: 0, // Will be loaded from waste collections
        rewardsEarned: 0 // Will be loaded from reward transactions
      };
      
      // Load additional data for citizens in parallel
      if (isCitizen && this.currentUser.id) {
        this.loadUserAdditionalData(this.currentUser.id);
      }
      
      console.log('Profile data loaded:', this.profileData);
    } else {
      console.warn('No user data available');
      // Set empty values when no user is available
      this.profileData = {
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        zipCode: '',
        municipality: '',
        role: 'CITIZEN',
        memberSince: '',
        totalPoints: 0,
        wasteCollected: 0,
        rewardsEarned: 0
      };
    }
    
    this.isDataLoaded = true;
  }

  toggleSidenav(): void {
    this.isSidenavOpen = !this.isSidenavOpen;
    // Save sidebar state to localStorage
    localStorage.setItem('sidebarCollapsed', (!this.isSidenavOpen).toString());
  }

  getUserRoleDisplay(): string {
    if (!this.currentUser) return 'Ciudadano';
    
    switch (this.currentUser.role) {
      case UserRole.CITIZEN:
        return 'Ciudadano';
      case UserRole.MUNICIPALITY_ADMIN:
        return 'Administrador Municipal';
      case UserRole.SYSTEM_ADMIN:
        return 'Administrador del Sistema';
      default:
        return this.currentUser.role || 'Ciudadano';
    }
  }

  editProfile(): void {
    this.isEditing = true;
  }

  saveProfile(): void {
    console.log('Saving profile data:', this.profileData);
    if (!this.currentUser?.id) {
      console.error('No user ID available');
      return;
    }
    
    this.isLoading = true;
    
    const updateData = {
      firstName: this.profileData.firstName,
      lastName: this.profileData.lastName,
      phone: this.profileData.phone,
      address: this.profileData.address,
      city: this.profileData.city,
      zipCode: this.profileData.zipCode
    };
    
    this.userIdentificationService.updateUserProfile(this.currentUser.id, updateData).subscribe({
      next: (updatedProfile) => {
        this.isLoading = false;
        this.isEditing = false;
        
        // Update current user data
        if (this.currentUser) {
          this.currentUser.firstName = updatedProfile.firstName;
          this.currentUser.lastName = updatedProfile.lastName;
          this.currentUser.phone = updatedProfile.phone;
          this.currentUser.address = updatedProfile.address;
          this.currentUser.city = updatedProfile.city;
          this.currentUser.zipCode = updatedProfile.zipCode;
          
          // Update localStorage
          localStorage.setItem('current_user', JSON.stringify(this.currentUser));
          
          // Update the auth service
          this.authService['currentUserSubject'].next(this.currentUser);
          
          console.log('Profile saved successfully:', this.currentUser);
        }
      },
      error: (error) => {
        console.error('Error saving profile:', error);
        this.isLoading = false;
      }
    });
  }

  private loadUserAdditionalData(userId: string): void {
    // Load all user data in parallel for better performance
    forkJoin({
      collections: this.wasteCollectionService.getWasteCollections(userId).pipe(
        catchError(() => of([]))
      ),
      transactions: this.rewardService.getUserTransactions(userId).pipe(
        catchError(() => of([]))
      )
    }).subscribe({
      next: ({ collections, transactions }: { collections: any[], transactions: any[] }) => {
        const collectionsArray = Array.isArray(collections) ? collections : [];
        const transactionsArray = Array.isArray(transactions) ? transactions : [];
        
        // Update waste collected
        this.profileData.wasteCollected = Math.round(
          collectionsArray.reduce((sum: number, c: any) => sum + (c.weight || 0), 0) * 10
        ) / 10;
        
        // Update rewards earned
        this.profileData.rewardsEarned = transactionsArray.length;
        
        // Build activity history
        const collectionActivities = collectionsArray.slice(0, 10).map((c: any, index: number) => ({
          id: index + 1,
          type: 'collection',
          description: `Collected ${c.weight || 0} kg of ${c.recyclableType || 'waste'}`,
          points: c.points || 0,
          date: c.collectedAt || c.timestamp ? new Date(c.collectedAt || c.timestamp).toISOString().split('T')[0] : '',
          icon: 'recycling'
        }));
        
        const rewardActivities = transactionsArray.slice(0, 5).map((t: any, index: number) => ({
          id: collectionActivities.length + index + 1,
          type: 'reward',
          description: `Redeemed reward: ${t.rewardName || 'Reward'}`,
          points: -(t.pointsUsed || 0),
          date: t.redeemedAt ? new Date(t.redeemedAt).toISOString().split('T')[0] : '',
          icon: 'card_giftcard'
        }));
        
        this.activityHistory = [...collectionActivities, ...rewardActivities]
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
          .slice(0, 10);
      },
      error: (error: any) => {
        console.error('Error loading user additional data:', error);
      }
    });
  }

  cancelEdit(): void {
    this.isEditing = false;
    this.loadProfileData(); // Reset to original data
  }

  getAchievementColor(earned: boolean): string {
    return earned ? 'primary' : 'accent';
  }

  getActivityIcon(type: string): string {
    switch (type) {
      case 'collection':
        return 'recycling';
      case 'reward':
        return 'card_giftcard';
      case 'profile':
        return 'edit';
      default:
        return 'info';
    }
  }

  getActivityColor(points: number): string {
    if (points > 0) return 'primary';
    if (points < 0) return 'warn';
    return 'accent';
  }
}