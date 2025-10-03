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
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AuthService } from '../../../core/services/auth.service';
import { User, UserRole } from '../../../shared/models';
import { SidebarComponent } from '../../../shared/components/sidebar/sidebar';
import { MonitoringService, Alert, Metric } from '../../services/monitoring.service';
import { WasteCollectionService } from '../../../waste-collection/services/waste-collection.service';
import { MunicipalityService, Municipality } from '../../../municipality-management/services/municipality.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-monitoring-dashboard',
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
    MatSnackBarModule,
    SidebarComponent,
    FormsModule
  ],
  templateUrl: './monitoring-dashboard.html',
  styleUrl: './monitoring-dashboard.css'
})
export class MonitoringDashboard implements OnInit {
  currentUser: User | null = null;
  isSidenavOpen = true;
  isLoading = false;
  
  // For SYSTEM_ADMIN: List of all municipalities
  municipalities: Municipality[] = [];
  selectedMunicipality: Municipality | null = null;
  
  // Municipality monitoring stats for cards
  municipalityMonitoringData: any[] = [];

  // System monitoring stats
  stats = {
    totalUsers: 1250,
    activeUsers: 890,
    totalCollections: 15600,
    totalPointsDistributed: 125000,
    systemUptime: '99.9%',
    averageResponseTime: '120ms'
  };

  // Performance metrics
  performanceMetrics = [
    {
      name: 'Daily Collections',
      value: 450,
      change: '+12%',
      trend: 'up',
      icon: 'trending_up'
    },
    {
      name: 'Points Distributed',
      value: 3500,
      change: '+8%',
      trend: 'up',
      icon: 'trending_up'
    },
    {
      name: 'New Users',
      value: 25,
      change: '+15%',
      trend: 'up',
      icon: 'trending_up'
    },
    {
      name: 'Rewards Redeemed',
      value: 120,
      change: '+5%',
      trend: 'up',
      icon: 'trending_up'
    }
  ];

  // System alerts
  systemAlerts: any[] = [];

  // User activity data
  userActivityData: any[] = [];

  // Collection analytics
  collectionAnalytics = [
    {
      period: 'Today',
      collections: 45,
      points: 1250,
      waste: 125.5
    },
    {
      period: 'This Week',
      collections: 320,
      points: 8900,
      waste: 890.2
    },
    {
      period: 'This Month',
      collections: 1250,
      points: 35000,
      waste: 3500.8
    }
  ];

  constructor(
    private authService: AuthService,
    private snackBar: MatSnackBar,
    private monitoringService: MonitoringService,
    private wasteCollectionService: WasteCollectionService,
    private municipalityService: MunicipalityService
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    
    // Load municipalities for System Admin
    if (this.isSystemAdmin()) {
      this.loadMunicipalities();
      this.loadMunicipalityMonitoringData();
    } else if (this.isMunicipalityAdmin()) {
      // Municipality Admin goes directly to their municipality details
      this.loadAllData();
    }
  }
  
  private loadMunicipalities(): void {
    this.isLoading = true;
    this.municipalityService.getMunicipalities().subscribe({
      next: (municipalities) => {
        this.municipalities = municipalities;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading municipalities:', error);
        this.isLoading = false;
      }
    });
  }
  
  private loadMunicipalityMonitoringData(): void {
    // Load monitoring stats for each municipality
    this.municipalityService.getMunicipalities().subscribe({
      next: (municipalities) => {
        const municipalitiesArray = Array.isArray(municipalities) ? municipalities : [];
        this.municipalityMonitoringData = municipalitiesArray.map(m => ({
          id: m.id,
          name: m.name,
          code: m.code,
          region: m.region,
          status: m.isActive ? 'Active' : 'Inactive',
          totalAlerts: Math.floor(Math.random() * 20),
          activeAlerts: Math.floor(Math.random() * 5),
          totalCollections: Math.floor(Math.random() * 1000) + 500,
          systemUptime: '99.' + Math.floor(Math.random() * 9) + '%',
          lastUpdated: new Date().toLocaleString()
        }));
      },
      error: (error) => console.error('Error loading municipality monitoring data:', error)
    });
  }
  
  private loadAllData(): void {
    this.loadAlerts();
    this.loadMetrics();
    this.loadUserActivity();
    this.updateStatsBasedOnRole();
  }
  
  // View control methods
  showMunicipalitiesView(): boolean {
    return this.isSystemAdmin() && !this.selectedMunicipality;
  }
  
  showMonitoringDetails(): boolean {
    return this.isMunicipalityAdmin() || (this.isSystemAdmin() && this.selectedMunicipality !== null);
  }
  
  selectMunicipality(municipality: any): void {
    this.selectedMunicipality = municipality;
    this.loadAllData();
    
    this.snackBar.open(
      `Monitoring ${municipality.name}`,
      'Close',
      {
        duration: 2000,
        horizontalPosition: 'center',
        verticalPosition: 'bottom'
      }
    );
  }
  
  backToMunicipalities(): void {
    this.selectedMunicipality = null;
  }

  private updateStatsBasedOnRole(): void {
    if (this.isMunicipalityAdmin()) {
      console.log('Monitoring for Municipality Admin - Scope: Municipality', this.currentUser?.municipalityId);
      // Show only municipality-specific data
    } else if (this.isSystemAdmin()) {
      console.log('Monitoring for System Admin - Scope: All System');
      // Show global system data
    }
  }

  isMunicipalityAdmin(): boolean {
    return this.currentUser?.role === 'MUNICIPALITY_ADMIN';
  }

  isSystemAdmin(): boolean {
    return this.currentUser?.role === 'SYSTEM_ADMIN';
  }

  private loadAlerts(): void {
    // Get municipality ID based on user role
    let municipalityId: string | undefined;
    
    if (this.isMunicipalityAdmin()) {
      municipalityId = this.currentUser?.municipalityId;
    } else if (this.isSystemAdmin() && this.selectedMunicipality) {
      municipalityId = this.selectedMunicipality.id;
    }
    
    this.monitoringService.getAlerts(municipalityId, false).subscribe({
      next: (alerts: Alert[]) => {
        const alertsArray = Array.isArray(alerts) ? alerts : [];
        this.systemAlerts = alertsArray.map(a => ({
          id: a.id,
          type: a.alertType.toLowerCase(),
          message: a.message,
          timestamp: new Date(a.createdAt).toLocaleString(),
          severity: a.severity.toLowerCase(),
          icon: this.getAlertIcon(a.alertType.toLowerCase())
        }));
      },
      error: (error) => console.error('Error loading alerts:', error)
    });
  }

  private loadMetrics(): void {
    // Get municipality ID based on user role
    let municipalityId: string | undefined;
    
    if (this.isMunicipalityAdmin()) {
      municipalityId = this.currentUser?.municipalityId;
    } else if (this.isSystemAdmin() && this.selectedMunicipality) {
      municipalityId = this.selectedMunicipality.id;
    }
    
    this.monitoringService.getMetrics(municipalityId).subscribe({
      next: (metrics: Metric[]) => {
        // Update stats from metrics
        metrics.forEach(m => {
          if (m.name === 'daily_collections') this.stats.totalCollections = m.value;
          if (m.name === 'total_weight_collected') this.stats.totalPointsDistributed = Math.floor(m.value * 20);
        });
      },
      error: (error) => console.error('Error loading metrics:', error)
    });
  }

  private loadUserActivity(): void {
    // Load recent waste collections as user activity
    this.wasteCollectionService.getWasteCollections().subscribe({
      next: (collections) => {
        const collectionsArray = Array.isArray(collections) ? collections : [];
        // For now, show all collections. 
        // TODO: Implement proper filtering by loading collectors first and matching municipalityId
        const filteredCollections = collectionsArray;
        
        const recentCollections = filteredCollections.slice(0, 10);
        this.stats.totalCollections = filteredCollections.length;
        this.stats.activeUsers = new Set(filteredCollections.map(c => c.userId)).size;
      },
      error: (error) => console.error('Error loading user activity:', error)
    });
  }
  
  getSelectedMunicipalityName(): string {
    if (this.isMunicipalityAdmin()) {
      return this.currentUser?.municipality || 'Municipality';
    }
    return this.selectedMunicipality?.name || 'Municipality';
  }

  toggleSidenav(): void {
    this.isSidenavOpen = !this.isSidenavOpen;
  }

  refreshData(): void {
    this.isLoading = true;
    // Simulate API call
    setTimeout(() => {
      this.isLoading = false;
      // Update stats with new data
      const newCollections = Math.floor(Math.random() * 100);
      const newPoints = Math.floor(Math.random() * 1000);
      this.stats.totalCollections += newCollections;
      this.stats.totalPointsDistributed += newPoints;
      
      this.snackBar.open(
        `✅ Data refreshed! ${newCollections} new collections, ${newPoints} new points distributed.`,
        'Close',
        {
          duration: 3000,
          horizontalPosition: 'center',
          verticalPosition: 'bottom'
        }
      );
    }, 2000);
  }

  getAlertColor(severity: string): string {
    switch (severity) {
      case 'high':
        return 'warn';
      case 'medium':
        return 'accent';
      case 'low':
        return 'primary';
      default:
        return 'primary';
    }
  }

  getAlertIcon(type: string): string {
    switch (type) {
      case 'warning':
        return 'warning';
      case 'error':
        return 'error';
      case 'info':
        return 'info';
      default:
        return 'info';
    }
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'Active':
        return 'primary';
      case 'Inactive':
        return 'accent';
      case 'Suspended':
        return 'warn';
      default:
        return 'primary';
    }
  }

  getTrendColor(trend: string): string {
    return trend === 'up' ? 'primary' : 'warn';
  }
}