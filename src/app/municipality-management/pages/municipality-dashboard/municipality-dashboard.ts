import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { of } from 'rxjs';
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
import { MatTableModule } from '@angular/material/table';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AuthService } from '../../../core/services/auth.service';
import { User, UserRole } from '../../../shared/models';
import { SidebarComponent } from '../../../shared/components/sidebar/sidebar';
import { MunicipalityService } from '../../services/municipality.service';
import { AddCollectionPointDialogComponent } from '../../components/add-collection-point-dialog/add-collection-point-dialog';
import { AddMunicipalityDialogComponent } from '../../components/add-municipality-dialog/add-municipality-dialog';
import { WasteCollectionService, WasteCollector } from '../../../waste-collection/services/waste-collection.service';
import { UserIdentificationService } from '../../../user-identification/services/user-identification.service';
import { RewardService } from '../../../reward-management/services/reward.service';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

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
export class MunicipalityDashboard implements OnInit, OnDestroy {
  currentUser: User | null = null;
  isSidenavOpen = true;
  isLoading = false;
  private subscriptions = new Subscription();
  
  // For SYSTEM_ADMIN: List of all municipalities
  municipalities: any[] = [];
  selectedMunicipality: any = null;

  // Municipality stats - will be loaded from backend
  stats = {
    totalCitizens: 0,
    totalWasteCollected: 0,
    totalPointsDistributed: 0,
    collectionPoints: 0,
    activeRewards: 0,
    environmentalImpact: 0
  };

  // Collection points management - Beach collectors
  collectionPoints: any[] = [];

  // Citizens data - Beach users
  citizensData: any[] = [];

  // Rewards management - Beach-related rewards
  rewardsManagement: any[] = [];

  // Recent activities - Beach context
  recentActivities: any[] = [];

  constructor(
    private authService: AuthService,
    private snackBar: MatSnackBar,
    private municipalityService: MunicipalityService,
    private wasteCollectionService: WasteCollectionService,
    private userIdentificationService: UserIdentificationService,
    private rewardService: RewardService,
    private http: HttpClient,
    private dialog: MatDialog,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Load sidebar state from localStorage
    const savedSidebarState = localStorage.getItem('sidebarCollapsed');
    this.isSidenavOpen = savedSidebarState !== 'true';

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
      // Load data for their municipality
      if (this.currentUser?.municipalityId) {
        this.loadMunicipalityDetails(this.currentUser.municipalityId);
      }
    } else if (this.isSystemAdmin()) {
      console.log('Loading data for System Admin - All municipalities');
      this.loadMunicipalities();
    }
  }

  private loadMunicipalities(): void {
    // Load municipalities from backend via service
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
    // Load all data in parallel for better performance
    console.log('Loading details for municipality:', municipalityId);
    this.isLoading = true;
    
    // Load all data sources in parallel
    forkJoin({
      collectors: this.wasteCollectionService.getWasteCollectors().pipe(
        catchError(() => of([]))
      ),
      citizens: this.userIdentificationService.getUsersByMunicipality(municipalityId).pipe(
        catchError(() => of([]))
      ),
      rewards: this.rewardService.getRewards().pipe(
        catchError(() => of([]))
      ),
      collections: this.wasteCollectionService.getWasteCollections().pipe(
        catchError(() => of([]))
      )
    }).subscribe({
      next: ({ collectors, citizens, rewards, collections }) => {
        // Process collectors
        const collectorsArray = Array.isArray(collectors) ? collectors : [];
        this.collectionPoints = collectorsArray
          .filter((c: WasteCollector) => c.municipalityId === municipalityId)
          .map(c => ({
            id: parseInt(c.id),
            name: c.name,
            address: c.location.address,
            status: c.status === 'ACTIVE' ? 'Active' : c.status === 'MAINTENANCE' ? 'Maintenance' : 'Inactive',
            capacity: c.capacity > 80 ? 'High' : c.capacity > 50 ? 'Medium' : 'Low',
            lastMaintenance: c.lastMaintenance ? new Date(c.lastMaintenance).toISOString().split('T')[0] : 'N/A',
            totalCollections: 0,
            beach: c.location.address.includes('Playa') ? c.location.address.split('Playa')[1]?.trim() || 'N/A' : 'N/A'
          }));
        
        // Process citizens
        const citizensArray = Array.isArray(citizens) ? citizens : [];
        this.citizensData = citizensArray.map((user: any) => ({
          id: user.id,
          name: `${user.firstName} ${user.lastName}`,
          email: user.email,
          totalPoints: user.totalPoints || 0,
          wasteCollected: user.totalWasteCollected || 0,
          lastActivity: user.lastActivity || 'N/A',
          status: user.isActive ? 'Active' : 'Inactive',
          beach: 'N/A'
        }));
        
        // Process rewards
        const rewardsArray = Array.isArray(rewards) ? rewards : [];
        this.rewardsManagement = rewardsArray
          .filter((r: any) => !r.municipalityId || r.municipalityId === municipalityId)
          .map((r: any) => ({
            id: r.id,
            name: r.name,
            pointsRequired: r.pointsRequired,
            totalRedeemed: r.totalRedeemed || 0,
            totalCost: (r.totalRedeemed || 0) * (r.pointsRequired || 0),
            status: r.isActive ? 'Active' : 'Inactive',
            description: r.description || ''
          }));
        
        // Process collections for activities and stats
        const collectionsArray = Array.isArray(collections) ? collections : [];
        const municipalityCollections = collectionsArray.filter((c: any) => {
          const collector = this.collectionPoints.find(cp => cp.id.toString() === c.collectorId?.toString());
          return collector !== undefined;
        });
        
        // Update stats
        this.stats.collectionPoints = this.collectionPoints.length;
        this.stats.activeRewards = this.rewardsManagement.filter((r: any) => r.status === 'Active').length;
        this.stats.totalCitizens = this.citizensData.length;
        this.stats.totalWasteCollected = municipalityCollections.reduce((sum: number, c: any) => sum + (c.weight || 0), 0);
        this.stats.totalPointsDistributed = municipalityCollections.reduce((sum: number, c: any) => sum + (c.points || 0), 0);
        this.stats.environmentalImpact = Math.round(this.stats.totalWasteCollected * 0.25);
        
        // Process recent activities
        this.recentActivities = municipalityCollections
          .slice(0, 10)
          .map((c: any, index: number) => ({
            id: index + 1,
            type: 'collection',
            description: `Recolección de ${c.wasteType || c.recyclableType || 'residuos'} - ${c.weight || 0} kg`,
            timestamp: c.collectedAt || c.timestamp ? new Date(c.collectedAt || c.timestamp).toLocaleString('es-PE') : 'N/A',
            icon: 'recycling'
          }));
        
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading municipality details:', error);
        this.isLoading = false;
      }
    });
  }
  
  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  private loadStats(municipalityId: string): void {
    // Load stats from backend
    this.stats.collectionPoints = this.collectionPoints.length;
    this.stats.activeRewards = this.rewardsManagement.filter((r: any) => r.status === 'Active').length;
    this.stats.totalCitizens = this.citizensData.length;
    
    // Calculate total waste collected and points from collections
    this.wasteCollectionService.getWasteCollections().subscribe({
      next: (collections) => {
        const municipalityCollections = collections.filter((c: any) => {
          const collector = this.collectionPoints.find(cp => cp.id.toString() === c.collectorId?.toString());
          return collector !== undefined;
        });
        
        this.stats.totalWasteCollected = municipalityCollections.reduce((sum: number, c: any) => sum + (c.weight || 0), 0);
        this.stats.totalPointsDistributed = municipalityCollections.reduce((sum: number, c: any) => sum + (c.points || 0), 0);
        this.stats.environmentalImpact = Math.round(this.stats.totalWasteCollected * 0.25);
      },
      error: (error) => {
        console.error('Error loading stats:', error);
      }
    });
  }

  private loadCollectionPoints(municipalityId: string): void {
    this.wasteCollectionService.getWasteCollectors().subscribe({
      next: (collectors: WasteCollector[]) => {
        this.collectionPoints = collectors
          .filter(c => c.municipalityId === municipalityId)
          .map(c => ({
            id: parseInt(c.id),
            name: c.name,
            address: c.location.address,
            status: c.status === 'ACTIVE' ? 'Active' : c.status === 'MAINTENANCE' ? 'Maintenance' : 'Inactive',
            capacity: c.capacity > 80 ? 'High' : c.capacity > 50 ? 'Medium' : 'Low',
            lastMaintenance: c.lastMaintenance ? new Date(c.lastMaintenance).toISOString().split('T')[0] : 'N/A',
            totalCollections: 0, // TODO: Calculate from waste collections
            beach: c.location.address.includes('Playa') ? c.location.address.split('Playa')[1]?.trim() || 'N/A' : 'N/A'
          }));
      },
      error: (error) => {
        console.error('Error loading collection points:', error);
        this.collectionPoints = [];
      }
    });
  }

  private loadCitizens(municipalityId: string): void {
    this.userIdentificationService.getUsersByMunicipality(municipalityId).subscribe({
      next: (users) => {
        this.citizensData = users.map((user: any) => ({
          id: user.id,
          name: `${user.firstName} ${user.lastName}`,
          email: user.email,
          totalPoints: user.totalPoints || 0,
          wasteCollected: user.totalWasteCollected || 0,
          lastActivity: user.lastActivity || 'N/A',
          status: user.isActive ? 'Active' : 'Inactive',
          beach: 'N/A' // TODO: Get from user profile if available
        }));
      },
      error: (error) => {
        console.error('Error loading citizens:', error);
        this.citizensData = [];
      }
    });
  }

  private loadRewards(municipalityId: string): void {
    this.rewardService.getRewards().subscribe({
      next: (rewards) => {
        this.rewardsManagement = rewards
          .filter((r: any) => !r.municipalityId || r.municipalityId === municipalityId)
          .map((r: any) => ({
            id: r.id,
            name: r.name,
            pointsRequired: r.pointsRequired,
            totalRedeemed: r.totalRedeemed || 0,
            totalCost: (r.totalRedeemed || 0) * (r.pointsRequired || 0),
            status: r.isActive ? 'Active' : 'Inactive',
            description: r.description || ''
          }));
      },
      error: (error) => {
        console.error('Error loading rewards:', error);
        this.rewardsManagement = [];
      }
    });
  }

  private loadRecentActivities(municipalityId: string): void {
    // Load recent waste collections as activities
    this.wasteCollectionService.getWasteCollections().subscribe({
      next: (collections) => {
        const filteredCollections = collections.filter((c: any) => {
          // Filter by municipality through collector
          return c.collectorId && this.collectionPoints.some(cp => cp.id.toString() === c.collectorId.toString());
        });
        
        this.recentActivities = filteredCollections
          .slice(0, 10)
          .map((c: any, index: number) => ({
            id: index + 1,
            type: 'collection',
            description: `Recolección de ${c.wasteType || 'residuos'} - ${c.weight || 0} kg`,
            timestamp: c.collectedAt ? new Date(c.collectedAt).toLocaleString('es-PE') : 'N/A',
            icon: 'recycling'
          }));
      },
      error: (error) => {
        console.error('Error loading recent activities:', error);
        this.recentActivities = [];
      }
    });
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
    // Save sidebar state to localStorage
    localStorage.setItem('sidebarCollapsed', (!this.isSidenavOpen).toString());
  }

  addCollectionPoint(): void {
    const dialogRef = this.dialog.open(AddCollectionPointDialogComponent, {
      width: '550px',
      maxWidth: '90vw',
      disableClose: false,
      panelClass: 'custom-dialog-container'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result && this.selectedMunicipality?.id) {
        this.isLoading = true;
        
        // Create collector via backend
        const newCollector = {
          municipalityId: this.selectedMunicipality.id,
          zoneId: result.zoneId || null,
          name: result.name,
          location: {
            latitude: result.latitude || 0,
            longitude: result.longitude || 0,
            address: result.address
          },
          status: result.status === 'Active' ? 'ACTIVE' : 'INACTIVE',
          capacity: parseInt(result.capacity) || 100,
          currentWeight: 0
        };
        
        // TODO: Add createWasteCollector method to WasteCollectionService
        // For now, using HTTP directly
        this.http.post<any>(`${environment.apiUrl}${environment.endpoints.wasteCollectors}`, newCollector).subscribe({
          next: (collector) => {
            // Reload collection points
            this.loadCollectionPoints(this.selectedMunicipality.id);
            this.isLoading = false;
            
            this.snackBar.open(
              `✅ Collection point "${result.name}" added successfully!`,
              'Close',
              {
                duration: 3000,
                horizontalPosition: 'center',
                verticalPosition: 'bottom',
                panelClass: ['success-snackbar']
              }
            );
          },
          error: (error: any) => {
            console.error('Error creating collection point:', error);
            this.isLoading = false;
            
            // Determinar mensaje de error más específico
            let errorMessage = 'Error al crear el punto de recolección. Por favor, intente nuevamente.';
            
            if (error.status === 400) {
              errorMessage = error.error?.message || 'Datos inválidos. Por favor, verifique la información ingresada.';
            } else if (error.status === 403) {
              errorMessage = 'No tiene permisos para crear puntos de recolección.';
            } else if (error.status === 500) {
              errorMessage = 'Error del servidor al crear el punto de recolección. Por favor, intente más tarde o contacte al administrador.';
            } else if (error.status === 0 || !error.status) {
              errorMessage = 'Error de conexión. Por favor, verifique su conexión a internet.';
            }
            
            this.snackBar.open(
              errorMessage,
              'Cerrar',
              {
                duration: 5000,
                panelClass: ['error-snackbar'],
                horizontalPosition: 'center',
                verticalPosition: 'top'
              }
            );
          }
        });
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
        
        // Create municipality via backend
        this.municipalityService.createMunicipality(result).subscribe({
          next: (municipality) => {
            // Reload municipalities list
            this.loadMunicipalities();
            this.isLoading = false;
            
            this.snackBar.open(
              `✅ Municipality "${result.name}" added successfully!`,
              'Close',
              {
                duration: 3000,
                horizontalPosition: 'center',
                verticalPosition: 'bottom',
                panelClass: ['success-snackbar']
              }
            );
          },
          error: (error) => {
            console.error('Error creating municipality:', error);
            this.isLoading = false;
            this.snackBar.open(
              'Error creating municipality. Please try again.',
              'Close',
              {
                duration: 3000,
                panelClass: ['error-snackbar']
              }
            );
          }
        });
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
    const dialogRef = this.dialog.open(AddCollectionPointDialogComponent, {
      width: '550px',
      maxWidth: '90vw',
      disableClose: false,
      panelClass: 'custom-dialog-container',
      data: point // Pass the point data for editing
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result && point.id) {
        this.isLoading = true;
        
        // Update collector via backend
        const updateData = {
          name: result.name,
          location: {
            ...point.location,
            address: result.address
          },
          status: result.status === 'Active' ? 'ACTIVE' : 'INACTIVE',
          capacity: parseInt(result.capacity) || 100
        };
        
        this.wasteCollectionService.updateCollectorStatus(point.id.toString(), updateData.status).subscribe({
          next: () => {
            // Also update via PUT if endpoint supports full update
            this.http.put<any>(
              `${environment.apiUrl}${environment.endpoints.wasteCollectors}/${point.id}`,
              updateData
            ).subscribe({
              next: () => {
                // Reload collection points
                if (this.selectedMunicipality?.id) {
                  this.loadCollectionPoints(this.selectedMunicipality.id);
                }
                this.isLoading = false;
                
                this.snackBar.open(
                  `✅ Collection point "${result.name}" updated successfully!`,
                  'Close',
                  {
                    duration: 3000,
                    horizontalPosition: 'center',
                    verticalPosition: 'bottom',
                    panelClass: ['success-snackbar']
                  }
                );
              },
              error: (error) => {
                console.error('Error updating collection point:', error);
                this.isLoading = false;
                this.snackBar.open(
                  'Error updating collection point. Please try again.',
                  'Close',
                  {
                    duration: 3000,
                    panelClass: ['error-snackbar']
                  }
                );
              }
            });
          },
          error: (error) => {
            console.error('Error updating collector status:', error);
            this.isLoading = false;
          }
        });
      }
    });
  }

  scheduleMaintenance(point: any): void {
    if (!point.id) {
      this.snackBar.open('Invalid collection point', 'Close', { duration: 3000 });
      return;
    }
    
    this.isLoading = true;
    
    // Update collector status to MAINTENANCE via backend
    this.wasteCollectionService.updateCollectorStatus(point.id.toString(), 'MAINTENANCE').subscribe({
      next: () => {
        // Reload collection points
        if (this.selectedMunicipality?.id) {
          this.loadCollectionPoints(this.selectedMunicipality.id);
        }
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
      },
      error: (error) => {
        console.error('Error scheduling maintenance:', error);
        this.isLoading = false;
        this.snackBar.open(
          'Error scheduling maintenance. Please try again.',
          'Close',
          {
            duration: 3000,
            panelClass: ['error-snackbar']
          }
        );
      }
    });
  }

  editReward(reward: any): void {
    if (reward.id) {
      this.router.navigate(['/municipality/rewards/edit', reward.id]);
    } else {
      this.snackBar.open('Invalid reward ID', 'Close', { duration: 3000 });
    }
  }

  viewRewardDetails(reward: any): void {
    if (reward.id) {
      this.router.navigate(['/municipality/rewards/details', reward.id]);
    } else {
      this.snackBar.open('Invalid reward ID', 'Close', { duration: 3000 });
    }
  }

  createReward(): void {
    this.router.navigate(['/municipality/rewards/create']);
  }

  viewCitizenProfile(citizen: any): void {
    if (citizen.id) {
      this.router.navigate(['/user-identification/profile'], { queryParams: { userId: citizen.id } });
    } else {
      this.snackBar.open('Invalid citizen ID', 'Close', { duration: 3000 });
    }
  }
}