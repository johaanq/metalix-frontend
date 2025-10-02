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
import { MatTableModule } from '@angular/material/table';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AuthService } from '../../../core/services/auth.service';
import { User, UserRole } from '../../../shared/models';
import { SidebarComponent } from '../../../shared/components/sidebar/sidebar';
import { MunicipalityService } from '../../services/municipality.service';
import { AddCollectionPointDialogComponent } from '../../components/add-collection-point-dialog/add-collection-point-dialog';
import { AddMunicipalityDialogComponent } from '../../components/add-municipality-dialog/add-municipality-dialog';

@Component({
  selector: 'app-municipality-dashboard',
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
    MatTableModule,
    MatDialogModule,
    MatSnackBarModule,
    SidebarComponent
  ],
  templateUrl: './municipality-dashboard.html',
  styleUrl: './municipality-dashboard.css'
})
export class MunicipalityDashboard implements OnInit {
  currentUser: User | null = null;
  isSidenavOpen = true;
  isLoading = false;
  
  // For SYSTEM_ADMIN: List of all municipalities
  municipalities: any[] = [];
  selectedMunicipality: any = null;

  // Municipality stats
  stats = {
    totalCitizens: 1250,
    totalWasteCollected: 12500,
    totalPointsDistributed: 45000,
    collectionPoints: 15,
    activeRewards: 25,
    environmentalImpact: 2500
  };

  // Collection points management
  collectionPoints = [
    {
      id: 1,
      name: 'Downtown Collection Center',
      address: '123 Main Street',
      status: 'Active',
      capacity: 'High',
      lastMaintenance: '2024-01-10',
      totalCollections: 1250
    },
    {
      id: 2,
      name: 'Northside Collection Point',
      address: '456 Oak Avenue',
      status: 'Active',
      capacity: 'Medium',
      lastMaintenance: '2024-01-05',
      totalCollections: 890
    },
    {
      id: 3,
      name: 'Southside Collection Point',
      address: '789 Pine Road',
      status: 'Maintenance',
      capacity: 'High',
      lastMaintenance: '2024-01-15',
      totalCollections: 1100
    }
  ];

  // Citizens data
  citizensData = [
    {
      id: 1,
      name: 'John Smith',
      email: 'john.smith@email.com',
      totalPoints: 1250,
      wasteCollected: 45.2,
      lastActivity: '2024-01-15',
      status: 'Active'
    },
    {
      id: 2,
      name: 'Maria Garcia',
      email: 'maria.garcia@email.com',
      totalPoints: 890,
      wasteCollected: 32.1,
      lastActivity: '2024-01-14',
      status: 'Active'
    },
    {
      id: 3,
      name: 'David Johnson',
      email: 'david.johnson@email.com',
      totalPoints: 2100,
      wasteCollected: 78.5,
      lastActivity: '2024-01-15',
      status: 'Active'
    }
  ];

  // Rewards management
  rewardsManagement = [
    {
      id: 1,
      name: 'Coffee Voucher',
      pointsRequired: 100,
      totalRedeemed: 45,
      totalCost: 450,
      status: 'Active'
    },
    {
      id: 2,
      name: 'Movie Tickets',
      pointsRequired: 200,
      totalRedeemed: 23,
      totalCost: 460,
      status: 'Active'
    },
    {
      id: 3,
      name: 'Grocery Gift Card',
      pointsRequired: 300,
      totalRedeemed: 12,
      totalCost: 360,
      status: 'Paused'
    }
  ];

  // Recent activities
  recentActivities = [
    {
      id: 1,
      type: 'collection',
      description: 'New collection point added',
      timestamp: '2024-01-15 10:30',
      icon: 'add_location'
    },
    {
      id: 2,
      type: 'citizen',
      description: 'New citizen registered',
      timestamp: '2024-01-15 09:15',
      icon: 'person_add'
    },
    {
      id: 3,
      type: 'reward',
      description: 'Reward redeemed by citizen',
      timestamp: '2024-01-15 08:45',
      icon: 'card_giftcard'
    }
  ];

  constructor(
    private authService: AuthService,
    private snackBar: MatSnackBar,
    private municipalityService: MunicipalityService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    this.loadDashboardData();
  }

  private loadDashboardData(): void {
    // MUNICIPALITY_ADMIN only sees their municipality
    // SYSTEM_ADMIN sees all municipalities
    
    if (this.isMunicipalityAdmin()) {
      console.log('Loading data for Municipality Admin - Municipality:', this.currentUser?.municipalityId);
      // Auto-select their municipality
      this.selectedMunicipality = {
        id: this.currentUser?.municipalityId,
        name: this.currentUser?.municipality
      };
    } else if (this.isSystemAdmin()) {
      console.log('Loading data for System Admin - All municipalities');
      this.loadMunicipalities();
    }
  }

  private loadMunicipalities(): void {
    // Load municipalities from db.json via service
    this.isLoading = true;
    this.municipalityService.getMunicipalities().subscribe({
      next: (municipalities) => {
        this.municipalities = municipalities;
        console.log('Municipalities loaded:', municipalities);
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading municipalities:', error);
        this.snackBar.open('Error loading municipalities', 'Close', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
        this.isLoading = false;
      }
    });
  }

  selectMunicipality(municipality: any): void {
    this.selectedMunicipality = municipality;
    console.log('Selected municipality:', municipality);
    // Here you would load the specific data for this municipality
    this.loadMunicipalityDetails(municipality.id);
  }

  backToMunicipalities(): void {
    this.selectedMunicipality = null;
  }

  private loadMunicipalityDetails(municipalityId: string): void {
    // Load collection points, citizens, rewards for this municipality
    console.log('Loading details for municipality:', municipalityId);
    // Update stats with real data for this municipality
  }

  showMunicipalitiesView(): boolean {
    return this.isSystemAdmin() && !this.selectedMunicipality;
  }

  showMunicipalityDetails(): boolean {
    return this.isMunicipalityAdmin() || (this.isSystemAdmin() && this.selectedMunicipality);
  }

  isMunicipalityAdmin(): boolean {
    return this.currentUser?.role === 'MUNICIPALITY_ADMIN';
  }

  isSystemAdmin(): boolean {
    return this.currentUser?.role === 'SYSTEM_ADMIN';
  }

  toggleSidenav(): void {
    this.isSidenavOpen = !this.isSidenavOpen;
  }

  addCollectionPoint(): void {
    const dialogRef = this.dialog.open(AddCollectionPointDialogComponent, {
      width: '550px',
      maxWidth: '90vw',
      disableClose: false,
      panelClass: 'custom-dialog-container'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.isLoading = true;
        // Simulate API call
        setTimeout(() => {
          const newPoint = {
            id: this.collectionPoints.length + 1,
            name: result.name,
            address: result.address,
            status: result.status,
            capacity: result.capacity + ' kg',
            lastMaintenance: new Date().toISOString().split('T')[0],
            totalCollections: 0
          };
          
          this.collectionPoints.push(newPoint);
          this.stats.collectionPoints += 1;
          this.isLoading = false;
          
          this.snackBar.open(
            `✅ Collection point "${newPoint.name}" added successfully!`,
            'Close',
            {
              duration: 3000,
              horizontalPosition: 'center',
              verticalPosition: 'bottom',
              panelClass: ['success-snackbar']
            }
          );
        }, 1000);
      }
    });
  }

  addMunicipality(): void {
    const dialogRef = this.dialog.open(AddMunicipalityDialogComponent, {
      width: '600px',
      maxWidth: '90vw',
      disableClose: false,
      panelClass: 'custom-dialog-container'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.isLoading = true;
        // Simulate API call
        setTimeout(() => {
          const newMunicipality = {
            id: String(this.municipalities.length + 1),
            name: result.name,
            code: result.code,
            region: result.region,
            province: result.region,
            district: result.district,
            population: result.population,
            area: result.area,
            address: result.address,
            phone: result.phone,
            email: result.email,
            website: result.website,
            status: 'Active',
            totalCitizens: 0,
            collectionPoints: 0,
            activeRewards: 0,
            totalWasteCollected: 0,
            totalPointsDistributed: 0,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };
          
          this.municipalities.push(newMunicipality);
          this.isLoading = false;
          
          this.snackBar.open(
            `✅ Municipality "${newMunicipality.name}" added successfully!`,
            'Close',
            {
              duration: 3000,
              horizontalPosition: 'center',
              verticalPosition: 'bottom',
              panelClass: ['success-snackbar']
            }
          );
        }, 1000);
      }
    });
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'Active':
        return 'primary';
      case 'Maintenance':
        return 'warn';
      case 'Paused':
        return 'accent';
      default:
        return 'primary';
    }
  }

  getCapacityColor(capacity: string): string {
    switch (capacity) {
      case 'High':
        return 'primary';
      case 'Medium':
        return 'accent';
      case 'Low':
        return 'warn';
      default:
        return 'primary';
    }
  }

  getActivityIcon(type: string): string {
    switch (type) {
      case 'collection':
        return 'add_location';
      case 'citizen':
        return 'person_add';
      case 'reward':
        return 'card_giftcard';
      default:
        return 'info';
    }
  }

  editCollectionPoint(point: any): void {
    this.snackBar.open(
      `Editing ${point.name}. This will open the edit form.`,
      'Close',
      {
        duration: 3000,
        horizontalPosition: 'center',
        verticalPosition: 'bottom'
      }
    );
    console.log('Edit collection point:', point);
    // Here you would typically open a dialog or navigate to an edit form
  }

  scheduleMaintenance(point: any): void {
    this.isLoading = true;
    
    setTimeout(() => {
      point.status = 'Maintenance';
      point.lastMaintenance = new Date().toISOString().split('T')[0];
      this.isLoading = false;
      
      this.snackBar.open(
        `Maintenance scheduled for ${point.name}`,
        'Close',
        {
          duration: 3000,
          horizontalPosition: 'center',
          verticalPosition: 'bottom'
        }
      );
    }, 1500);
  }

  editReward(reward: any): void {
    this.snackBar.open(
      `Editing reward: ${reward.name}. This will open the edit form.`,
      'Close',
      {
        duration: 3000,
        horizontalPosition: 'center',
        verticalPosition: 'bottom'
      }
    );
    console.log('Edit reward:', reward);
  }

  viewRewardDetails(reward: any): void {
    const message = `
      Reward: ${reward.name}
      Points Required: ${reward.pointsRequired}
      Total Redeemed: ${reward.totalRedeemed}
      Total Cost: ${reward.totalCost} points
      Status: ${reward.status}
    `;
    
    this.snackBar.open(message, 'Close', {
      duration: 8000,
      horizontalPosition: 'center',
      verticalPosition: 'top'
    });
  }

  viewCitizenProfile(citizen: any): void {
    this.snackBar.open(
      `Viewing profile for ${citizen.name}. This will navigate to citizen profile.`,
      'Close',
      {
        duration: 3000,
        horizontalPosition: 'center',
        verticalPosition: 'bottom'
      }
    );
    console.log('View citizen profile:', citizen);
  }
}