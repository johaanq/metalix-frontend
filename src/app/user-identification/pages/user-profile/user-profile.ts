import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
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

  // Achievement badges
  achievements = [
    {
      id: 1,
      name: 'First Collection',
      description: 'Completed your first waste collection',
      icon: 'recycling',
      earned: true,
      date: '2024-01-01'
    },
    {
      id: 2,
      name: 'Point Collector',
      description: 'Earned 1000+ points',
      icon: 'stars',
      earned: true,
      date: '2024-01-15'
    },
    {
      id: 3,
      name: 'Eco Warrior',
      description: 'Collected 50+ kg of waste',
      icon: 'eco',
      earned: false,
      date: null
    },
    {
      id: 4,
      name: 'Regular Contributor',
      description: 'Made 20+ collections',
      icon: 'schedule',
      earned: false,
      date: null
    }
  ];

  // Activity history
  activityHistory = [
    {
      id: 1,
      type: 'collection',
      description: 'Metal waste collected',
      points: 150,
      date: '2024-01-15',
      icon: 'recycling'
    },
    {
      id: 2,
      type: 'reward',
      description: 'Reward redeemed',
      points: -200,
      date: '2024-01-14',
      icon: 'card_giftcard'
    },
    {
      id: 3,
      type: 'profile',
      description: 'Profile updated',
      points: 0,
      date: '2024-01-13',
      icon: 'edit'
    }
  ];

  constructor(private authService: AuthService) {}

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
        wasteCollected: isCitizen ? 45.2 : 0,
        rewardsEarned: isCitizen ? 8 : 0
      };
      console.log('Profile data loaded:', this.profileData);
    } else {
      console.warn('No user data available, using default values');
      // Set default values when no user is available
      this.profileData = {
        firstName: 'Usuario',
        lastName: 'No Identificado',
        email: 'usuario@ejemplo.com',
        phone: '',
        address: '',
        city: '',
        zipCode: '',
        municipality: '',
        role: 'CITIZEN',
        memberSince: '2024-01-01',
        totalPoints: 0,
        wasteCollected: 0,
        rewardsEarned: 0
      };
    }
    
    this.isDataLoaded = true;
  }

  toggleSidenav(): void {
    this.isSidenavOpen = !this.isSidenavOpen;
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
    this.isLoading = true;
    // Simulate API call
    setTimeout(() => {
      this.isLoading = false;
      this.isEditing = false;
      // Update current user data
      if (this.currentUser) {
        this.currentUser.firstName = this.profileData.firstName;
        this.currentUser.lastName = this.profileData.lastName;
        this.currentUser.phone = this.profileData.phone;
        this.currentUser.address = this.profileData.address;
        this.currentUser.city = this.profileData.city;
        this.currentUser.zipCode = this.profileData.zipCode;
        this.currentUser.municipality = this.profileData.municipality;
        
        // Update localStorage
        localStorage.setItem('current_user', JSON.stringify(this.currentUser));
        
        // Update the auth service
        this.authService['currentUserSubject'].next(this.currentUser);
        
        console.log('Profile saved successfully:', this.currentUser);
      }
    }, 2000);
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