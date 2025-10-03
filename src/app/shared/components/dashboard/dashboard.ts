import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
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
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatInputModule } from '@angular/material/input';
import { MatTabsModule } from '@angular/material/tabs';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '../../../core/services/auth.service';
import { User, UserRole } from '../../models';
import { SidebarComponent } from '../sidebar/sidebar';
import { MunicipalityService, Municipality } from '../../../municipality-management/services/municipality.service';
import { MonitoringService } from '../../../monitoring-reporting/services/monitoring.service';
import { WasteCollectionService, WasteCollector } from '../../../waste-collection/services/waste-collection.service';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

@Component({
  selector: 'app-dashboard',
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
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatInputModule,
    MatTabsModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    SidebarComponent
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class DashboardComponent implements OnInit {
  currentUser: User | null = null;
  isSidenavOpen = true;
  isLoading = false;

  // Filters for System Admin
  municipalities: Municipality[] = [];
  selectedMunicipalityId: string = 'all';
  
  // Filters for Municipality Admin
  collectionPoints: WasteCollector[] = [];
  selectedCollectionPointId: string = 'all';
  
  // Common filters
  selectedRegion: string = 'all';
  selectedMaterialType: string = 'all';
  startDate: Date | null = null;
  endDate: Date | null = null;
  
  regions: string[] = [];
  zones: string[] = []; // For Municipality Admin
  materialTypes = ['all', 'METAL', 'PLASTIC', 'PAPER', 'GLASS'];

  // Citizen stats
  citizenStats = {
    totalPoints: 0,
    wasteCollected: 0,
    rewardsEarned: 0,
    environmentalImpact: 0
  };
  
  // Admin aggregated stats
  aggregatedStats = {
    totalMunicipalities: 0,
    totalCitizens: 0,
    totalCollections: 0,
    totalWasteCollected: 0,
    totalPointsDistributed: 0,
    activeAlerts: 0,
    systemUptime: '99.9%',
    averageParticipation: 0
  };
  
  // Top municipalities by performance (System Admin)
  topMunicipalities: any[] = [];
  
  // Top collection points by performance (Municipality Admin)
  topCollectionPoints: any[] = [];
  
  // Collection trends
  collectionTrends: any[] = [];
  
  // Material distribution
  materialDistribution: any[] = [];
  
  // Regional performance
  regionalPerformance: any[] = [];

  // Quick actions based on user role
  quickActions: any[] = [];

  constructor(
    private authService: AuthService,
    private municipalityService: MunicipalityService,
    private monitoringService: MonitoringService,
    private wasteCollectionService: WasteCollectionService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    
    // Check if user is authenticated before loading data
    if (!this.currentUser) {
      console.warn('No authenticated user found');
      return;
    }
    
    this.setupQuickActions();
    
    if (this.isSystemAdmin()) {
      this.loadMunicipalities();
      this.loadAggregatedData();
    } else if (this.isMunicipalityAdmin()) {
      this.loadCollectionPoints();
      this.loadMunicipalityAdminData();
    } else {
      this.loadCitizenStats();
    }
  }

  private loadMunicipalities(): void {
    this.municipalityService.getMunicipalities().subscribe({
      next: (municipalities) => {
        this.municipalities = Array.isArray(municipalities) ? municipalities : [];
        this.regions = ['all', ...new Set(this.municipalities.map(m => m.region))];
      },
      error: (error) => {
        console.error('Error loading municipalities:', error);
        if (error.status === 401 || error.status === 403) {
          this.snackBar.open('Session expired. Please login again.', 'Close', { duration: 5000 });
          this.authService.logout();
        }
      }
    });
  }
  
  private loadCollectionPoints(): void {
    this.isLoading = true;
    this.wasteCollectionService.getWasteCollectors().subscribe({
      next: (collectors) => {
        const collectorsArray = Array.isArray(collectors) ? collectors : [];
        // Filter by municipality admin's municipalityId
        if (this.currentUser?.municipalityId) {
          this.collectionPoints = collectorsArray.filter(c => c.municipalityId === this.currentUser?.municipalityId);
          this.zones = ['all', ...new Set(this.collectionPoints.map(cp => cp.zoneId))];
        } else {
          this.collectionPoints = collectorsArray;
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading collection points:', error);
        this.isLoading = false;
        if (error.status === 401 || error.status === 403) {
          this.snackBar.open('Session expired. Please login again.', 'Close', { duration: 5000 });
          this.authService.logout();
        }
      }
    });
  }
  
  private loadAggregatedData(): void {
    this.isLoading = true;
    
    // Load municipalities stats
    this.municipalityService.getMunicipalities().subscribe({
      next: (municipalities) => {
        // Apply municipality and region filters
        let filteredMunicipalities = Array.isArray(municipalities) ? municipalities : [];
        
        if (this.selectedMunicipalityId !== 'all') {
          filteredMunicipalities = filteredMunicipalities.filter(m => m.id === this.selectedMunicipalityId);
        }
        
        if (this.selectedRegion !== 'all') {
          filteredMunicipalities = filteredMunicipalities.filter(m => m.region === this.selectedRegion);
        }
        
        this.aggregatedStats.totalMunicipalities = filteredMunicipalities.length;
        this.aggregatedStats.totalCitizens = filteredMunicipalities.reduce((sum, m) => sum + (m.population || 0), 0);
        
        // Generate top municipalities data from filtered municipalities
        this.topMunicipalities = filteredMunicipalities.slice(0, 5).map(m => ({
          name: m.name,
          collections: Math.floor(Math.random() * 5000) + 1000,
          waste: Math.floor(Math.random() * 50000) + 10000,
          citizens: m.population,
          participation: Math.floor(Math.random() * 40) + 60
        }));
        
        // Generate regional performance from filtered municipalities
        const regionMap = new Map<string, any>();
        filteredMunicipalities.forEach(m => {
          if (!regionMap.has(m.region)) {
            regionMap.set(m.region, {
              region: m.region,
              municipalities: 0,
              collections: 0,
              waste: 0
            });
          }
          const data = regionMap.get(m.region);
          data.municipalities++;
          data.collections += Math.floor(Math.random() * 2000) + 500;
          data.waste += Math.floor(Math.random() * 20000) + 5000;
        });
        this.regionalPerformance = Array.from(regionMap.values());
        
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading aggregated data:', error);
        this.isLoading = false;
        if (error.status === 401 || error.status === 403) {
          this.snackBar.open('Session expired. Please login again.', 'Close', { duration: 5000 });
          this.authService.logout();
        }
      }
    });
    
    // Load waste collections
    this.wasteCollectionService.getWasteCollections().subscribe({
      next: (allCollections) => {
        // Apply filters to collections
        const collectionsArray = Array.isArray(allCollections) ? allCollections : [];
        let filteredCollections = this.applyCollectionFilters(collectionsArray);
        
        this.aggregatedStats.totalCollections = filteredCollections.length;
        this.aggregatedStats.totalWasteCollected = filteredCollections.reduce((sum, c) => sum + c.weight, 0);
        this.aggregatedStats.totalPointsDistributed = filteredCollections.reduce((sum, c) => sum + c.points, 0);
        
        // Material distribution from filtered collections
        const materialMap = new Map<string, number>();
        filteredCollections.forEach(c => {
          materialMap.set(c.recyclableType, (materialMap.get(c.recyclableType) || 0) + c.weight);
        });
        this.materialDistribution = Array.from(materialMap.entries()).map(([type, weight]) => ({
          type,
          weight,
          percentage: Math.round((weight / this.aggregatedStats.totalWasteCollected) * 100)
        }));
        
        // Collection trends from filtered collections
        this.generateCollectionTrends(filteredCollections);
      },
      error: (error) => {
        console.error('Error loading waste collections:', error);
        if (error.status === 401 || error.status === 403) {
          this.snackBar.open('Session expired. Please login again.', 'Close', { duration: 5000 });
          this.authService.logout();
        }
      }
    });
    
    // Load alerts
    this.monitoringService.getAlerts(undefined, false).subscribe({
      next: (alerts) => {
        this.aggregatedStats.activeAlerts = alerts.length;
      },
      error: (error) => {
        console.error('Error loading alerts:', error);
        if (error.status === 401 || error.status === 403) {
          this.snackBar.open('Session expired. Please login again.', 'Close', { duration: 5000 });
          this.authService.logout();
        }
      }
    });
  }
  
  private applyCollectionFilters(collections: any[]): any[] {
    let filtered = Array.isArray(collections) ? collections : [];
    
    // Filter by material type
    if (this.selectedMaterialType !== 'all') {
      filtered = filtered.filter(c => c.recyclableType === this.selectedMaterialType);
    }
    
    // Filter by date range
    if (this.startDate) {
      filtered = filtered.filter(c => new Date(c.timestamp) >= this.startDate!);
    }
    
    if (this.endDate) {
      const endOfDay = new Date(this.endDate);
      endOfDay.setHours(23, 59, 59, 999);
      filtered = filtered.filter(c => new Date(c.timestamp) <= endOfDay);
    }
    
    return filtered;
  }
  
  private applyMunicipalityAdminFilters(collections: any[]): any[] {
    let filtered = Array.isArray(collections) ? collections : [];
    
    // Filter by collection point
    if (this.selectedCollectionPointId !== 'all') {
      filtered = filtered.filter(c => c.collectorId === this.selectedCollectionPointId);
    }
    
    // Filter by zone (through collection point)
    if (this.selectedRegion !== 'all') {
      filtered = filtered.filter(c => {
        const cp = this.collectionPoints.find(point => point.id === c.collectorId);
        return cp && cp.zoneId === this.selectedRegion;
      });
    }
    
    // Filter by material type
    if (this.selectedMaterialType !== 'all') {
      filtered = filtered.filter(c => c.recyclableType === this.selectedMaterialType);
    }
    
    // Filter by date range
    if (this.startDate) {
      filtered = filtered.filter(c => new Date(c.timestamp) >= this.startDate!);
    }
    
    if (this.endDate) {
      const endOfDay = new Date(this.endDate);
      endOfDay.setHours(23, 59, 59, 999);
      filtered = filtered.filter(c => new Date(c.timestamp) <= endOfDay);
    }
    
    return filtered;
  }
  
  private generateCollectionTrends(collections: any[]): void {
    const collectionsArray = Array.isArray(collections) ? collections : [];
    // Generate real trends from filtered collections grouped by day
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const dayMap = new Map<number, { collections: number, weight: number }>();
    
    // Initialize days
    for (let i = 0; i < 7; i++) {
      dayMap.set(i, { collections: 0, weight: 0 });
    }
    
    // Group collections by day of week
    collectionsArray.forEach(c => {
      const date = new Date(c.timestamp);
      const dayIndex = (date.getDay() + 6) % 7; // Convert Sunday=0 to Monday=0
      const dayData = dayMap.get(dayIndex)!;
      dayData.collections++;
      dayData.weight += c.weight;
    });
    
    // Build trends array
    this.collectionTrends = days.map((day, index) => {
      const data = dayMap.get(index)!;
      return {
        day,
        collections: data.collections,
        weight: Math.round(data.weight * 10) / 10
      };
    });
  }
  
  private loadCitizenStats(): void {
    if (this.currentUser && this.currentUser.role === 'CITIZEN') {
      this.citizenStats.totalPoints = this.currentUser.totalPoints || 0;
      // Load citizen's waste collections
      this.wasteCollectionService.getWasteCollections(this.currentUser.id).subscribe({
        next: (collections) => {
          const collectionsArray = Array.isArray(collections) ? collections : [];
          this.citizenStats.wasteCollected = collectionsArray.reduce((sum, c) => sum + c.weight, 0);
          this.citizenStats.rewardsEarned = collectionsArray.filter(c => c.points > 0).length;
          this.citizenStats.environmentalImpact = Math.floor(this.citizenStats.wasteCollected * 2.5); // CO2 saved
        },
        error: (error) => console.error('Error loading citizen stats:', error)
      });
    }
  }
  
  private loadMunicipalityAdminData(): void {
    this.isLoading = true;
    
    // Load waste collections for this municipality
    this.wasteCollectionService.getWasteCollections().subscribe({
      next: (allCollections) => {
        const collectionsArray = Array.isArray(allCollections) ? allCollections : [];
        // Filter by municipality's collection points
        let municipalityCollections = collectionsArray.filter(c => {
          const collector = this.collectionPoints.find(cp => cp.id === c.collectorId.toString());
          return collector !== undefined;
        });
        
        // Apply additional filters (collection point, material type, date range)
        municipalityCollections = this.applyMunicipalityAdminFilters(municipalityCollections);
        
        // Calculate aggregated stats for municipality
        this.aggregatedStats.totalCollections = municipalityCollections.length;
        this.aggregatedStats.totalWasteCollected = municipalityCollections.reduce((sum, c) => sum + c.weight, 0);
        this.aggregatedStats.totalPointsDistributed = municipalityCollections.reduce((sum, c) => sum + c.points, 0);
        this.aggregatedStats.totalCitizens = new Set(municipalityCollections.map(c => c.userId)).size;
        
        // Material distribution
        const materialMap = new Map<string, number>();
        municipalityCollections.forEach(c => {
          materialMap.set(c.recyclableType, (materialMap.get(c.recyclableType) || 0) + c.weight);
        });
        this.materialDistribution = Array.from(materialMap.entries()).map(([type, weight]) => ({
          type,
          weight,
          percentage: Math.round((weight / this.aggregatedStats.totalWasteCollected) * 100) || 0
        }));
        
        // Top collection points
        this.generateTopCollectionPoints(municipalityCollections);
        
        // Collection trends
        this.generateCollectionTrends(municipalityCollections);
        
        // Zone performance (instead of regional)
        this.generateZonePerformance(municipalityCollections);
        
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading municipality admin data:', error);
        this.isLoading = false;
      }
    });
    
    // Load alerts for municipality
    this.monitoringService.getAlerts(this.currentUser?.municipalityId, false).subscribe({
      next: (alerts) => {
        this.aggregatedStats.activeAlerts = alerts.length;
      },
      error: (error) => console.error('Error loading alerts:', error)
    });
  }
  
  private generateTopCollectionPoints(collections: any[]): void {
    const cpMap = new Map<string, any>();
    
    collections.forEach(c => {
      const cp = this.collectionPoints.find(collector => collector.id === c.collectorId);
      if (cp) {
        if (!cpMap.has(cp.id)) {
          cpMap.set(cp.id, {
            name: cp.name,
            collections: 0,
            waste: 0,
            status: cp.status,
            location: cp.location.address
          });
        }
        const data = cpMap.get(cp.id);
        data.collections++;
        data.waste += c.weight;
      }
    });
    
    this.topCollectionPoints = Array.from(cpMap.values())
      .sort((a, b) => b.collections - a.collections)
      .slice(0, 5)
      .map(cp => ({
        ...cp,
        participation: Math.floor(Math.random() * 40) + 60 // Mock participation rate
      }));
  }
  
  private generateZonePerformance(collections: any[]): void {
    const zoneMap = new Map<string, any>();
    
    collections.forEach(c => {
      const cp = this.collectionPoints.find(collector => collector.id === c.collectorId);
      if (cp) {
        if (!zoneMap.has(cp.zoneId)) {
          zoneMap.set(cp.zoneId, {
            region: `Zone ${cp.zoneId}`,
            municipalities: 0, // Will show collection points instead
            collections: 0,
            waste: 0
          });
        }
        const data = zoneMap.get(cp.zoneId);
        data.collections++;
        data.waste += c.weight;
      }
    });
    
    // Count collection points per zone
    this.collectionPoints.forEach(cp => {
      if (zoneMap.has(cp.zoneId)) {
        zoneMap.get(cp.zoneId).municipalities++;
      }
    });
    
    this.regionalPerformance = Array.from(zoneMap.values());
  }
  
  applyFilters(): void {
    // Build filter description
    const filters: string[] = [];
    
    if (this.isSystemAdmin()) {
      if (this.selectedMunicipalityId !== 'all') {
        const municipality = this.municipalities.find(m => m.id === this.selectedMunicipalityId);
        filters.push(`Municipality: ${municipality?.name}`);
      }
      if (this.selectedRegion !== 'all') {
        filters.push(`Region: ${this.selectedRegion}`);
      }
    } else if (this.isMunicipalityAdmin()) {
      if (this.selectedCollectionPointId !== 'all') {
        const cp = this.collectionPoints.find(c => c.id === this.selectedCollectionPointId);
        filters.push(`Collection Point: ${cp?.name}`);
      }
      if (this.selectedRegion !== 'all') {
        filters.push(`Zone: ${this.selectedRegion}`);
      }
    }
    
    if (this.selectedMaterialType !== 'all') {
      filters.push(`Material: ${this.selectedMaterialType}`);
    }
    
    if (this.startDate || this.endDate) {
      const dateStr = this.startDate && this.endDate 
        ? `${this.startDate.toLocaleDateString()} - ${this.endDate.toLocaleDateString()}`
        : this.startDate 
          ? `From ${this.startDate.toLocaleDateString()}`
          : `Until ${this.endDate?.toLocaleDateString()}`;
      filters.push(`Date: ${dateStr}`);
    }
    
    // Reload data with filters
    if (this.isSystemAdmin()) {
      this.loadAggregatedData();
    } else if (this.isMunicipalityAdmin()) {
      this.loadMunicipalityAdminData();
    }
    
    // Show notification
    const message = filters.length > 0 
      ? `Filters applied: ${filters.join(', ')}`
      : 'Showing all data';
      
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      horizontalPosition: 'center',
      verticalPosition: 'bottom'
    });
  }
  
  clearFilters(): void {
    this.selectedMunicipalityId = 'all';
    this.selectedCollectionPointId = 'all';
    this.selectedRegion = 'all';
    this.selectedMaterialType = 'all';
    this.startDate = null;
    this.endDate = null;
    
    if (this.isSystemAdmin()) {
      this.loadAggregatedData();
    } else if (this.isMunicipalityAdmin()) {
      this.loadMunicipalityAdminData();
    }
    
    this.snackBar.open('All filters cleared', 'Close', {
      duration: 2000,
      horizontalPosition: 'center',
      verticalPosition: 'bottom'
    });
  }

  private setupQuickActions(): void {
    if (!this.currentUser) return;

    // Citizen actions
    if (this.currentUser.role === UserRole.CITIZEN) {
      this.quickActions = [
        {
          title: 'Collect Waste',
          description: 'Deposit metal waste and earn points',
          icon: 'recycling',
          route: '/waste-collection',
          color: 'primary'
        },
        {
          title: 'View Rewards',
          description: 'Check your points and available rewards',
          icon: 'card_giftcard',
          route: '/rewards',
          color: 'accent'
        },
        {
          title: 'My Profile',
          description: 'View your profile and achievements',
          icon: 'account_circle',
          route: '/user-identification/profile',
          color: 'primary'
        }
      ];
    }
    // Admin actions
    else if (this.currentUser.role === UserRole.MUNICIPALITY_ADMIN || this.currentUser.role === UserRole.SYSTEM_ADMIN) {
      this.quickActions = [
        {
          title: 'Municipality Management',
          description: 'Manage municipality settings and citizens',
          icon: 'location_city',
          route: '/municipality',
          color: 'primary'
        },
        {
          title: 'Monitoring & Reports',
          description: 'View system reports and analytics',
          icon: 'analytics',
          route: '/monitoring',
          color: 'accent'
        },
        {
          title: 'My Profile',
          description: 'View your profile information',
          icon: 'account_circle',
          route: '/user-identification/profile',
          color: 'primary'
        }
      ];
    }
  }

  toggleSidenav(): void {
    this.isSidenavOpen = !this.isSidenavOpen;
  }

  isCitizen(): boolean {
    return this.currentUser?.role === 'CITIZEN';
  }
  
  isAdmin(): boolean {
    return this.currentUser?.role === 'MUNICIPALITY_ADMIN' || this.currentUser?.role === 'SYSTEM_ADMIN';
  }
  
  isSystemAdmin(): boolean {
    return this.currentUser?.role === 'SYSTEM_ADMIN';
  }
  
  isMunicipalityAdmin(): boolean {
    return this.currentUser?.role === 'MUNICIPALITY_ADMIN';
  }
  
  getMaterialTypeLabel(type: string): string {
    if (type === 'all') return 'All Materials';
    return type.charAt(0) + type.slice(1).toLowerCase();
  }
}