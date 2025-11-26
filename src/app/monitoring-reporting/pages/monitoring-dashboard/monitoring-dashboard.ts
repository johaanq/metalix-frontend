import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { forkJoin, Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
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
export class MonitoringDashboard implements OnInit, OnDestroy {
  currentUser: User | null = null;
  isSidenavOpen = true;
  isLoading = false;
  private subscriptions = new Subscription();
  
  // For SYSTEM_ADMIN: List of all municipalities
  municipalities: Municipality[] = [];
  selectedMunicipality: Municipality | null = null;
  
  // Municipality monitoring stats for cards
  municipalityMonitoringData: any[] = [];

  // System monitoring stats - will be loaded from backend
  stats = {
    totalUsers: 0,
    activeUsers: 0,
    totalCollections: 0,
    totalPointsDistributed: 0,
    systemUptime: '0%',
    averageResponseTime: '0ms'
  };

  // Performance metrics - will be loaded from backend
  performanceMetrics: any[] = [];

  // System alerts
  systemAlerts: any[] = [];

  // User activity data
  userActivityData: any[] = [];

  // Collection analytics - will be loaded from backend
  collectionAnalytics: any[] = [];

  constructor(
    private authService: AuthService,
    private snackBar: MatSnackBar,
    private monitoringService: MonitoringService,
    private wasteCollectionService: WasteCollectionService,
    private municipalityService: MunicipalityService
  ) {}

  ngOnInit(): void {
    // Load sidebar state from localStorage
    const savedSidebarState = localStorage.getItem('sidebarCollapsed');
    this.isSidenavOpen = savedSidebarState !== 'true';

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
    // Load monitoring stats for each municipality - optimized with parallel requests
    const sub = this.municipalityService.getMunicipalities().subscribe({
      next: (municipalities) => {
        const municipalitiesArray = Array.isArray(municipalities) ? municipalities : [];
        
        // Initialize data structure first
        this.municipalityMonitoringData = municipalitiesArray.map(m => ({
          id: m.id,
          name: m.name,
          code: m.code,
          region: m.region,
          status: m.isActive ? 'Active' : 'Inactive',
          totalAlerts: 0,
          activeAlerts: 0,
          totalCollections: 0,
          systemUptime: '0%',
          lastUpdated: new Date().toLocaleString()
        }));
        
        // Load all alerts in parallel for all municipalities
        const alertObservables = municipalitiesArray.map(m => 
          this.monitoringService.getAlerts(m.id, false).pipe(
            catchError(() => of([])),
            map(alerts => ({ municipalityId: m.id, alerts: Array.isArray(alerts) ? alerts : [] }))
          )
        );
        
        // Load collections once and share
        const collectionsObservable = this.wasteCollectionService.getWasteCollections().pipe(
          catchError(() => of([])),
          map(collections => Array.isArray(collections) ? collections : [])
        );
        
        // Execute all requests in parallel
        forkJoin({
          alerts: forkJoin(alertObservables),
          collections: collectionsObservable
        }).subscribe({
          next: ({ alerts, collections }) => {
            // Update alerts data
            alerts.forEach(({ municipalityId, alerts: alertsArray }) => {
              const municipalityData = this.municipalityMonitoringData.find(d => d.id === municipalityId);
              if (municipalityData) {
                municipalityData.totalAlerts = alertsArray.length;
                municipalityData.activeAlerts = alertsArray.filter((a: any) => !a.isResolved).length;
              }
            });
            
            // Update collections count (simplified - TODO: filter by municipality properly)
            const collectionsArray = collections;
            this.municipalityMonitoringData.forEach(m => {
              m.totalCollections = collectionsArray.length; // Simplified for now
            });
          },
          error: (error) => console.error('Error loading municipality monitoring data:', error)
        });
      },
      error: (error) => console.error('Error loading municipalities:', error)
    });
    this.subscriptions.add(sub);
  }
  
  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
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
        
        // Load performance metrics from real data
        this.loadPerformanceMetrics(metrics);
      },
      error: (error) => console.error('Error loading metrics:', error)
    });
    
    // Load dashboard data for stats
    if (municipalityId) {
      this.monitoringService.getDashboardData(municipalityId).subscribe({
        next: (dashboard) => {
          this.stats.activeUsers = dashboard.activeUsers || 0;
          this.stats.totalUsers = dashboard.activeUsers || 0; // Use activeUsers as totalUsers for now
          this.stats.totalCollections = dashboard.totalCollections || 0;
          this.stats.totalPointsDistributed = dashboard.totalPoints || 0;
          // systemUptime and averageResponseTime are not in DashboardData, keep defaults
          
          // Load collection analytics
          this.loadCollectionAnalytics(municipalityId);
        },
        error: (error) => console.error('Error loading dashboard data:', error)
      });
    } else {
      // Load collection analytics without municipality filter
      this.loadCollectionAnalytics();
    }
  }

  private loadPerformanceMetrics(metrics: Metric[]): void {
    // Build performance metrics from actual data
    const dailyCollections = metrics.find(m => m.name === 'daily_collections')?.value || 0;
    const totalPoints = metrics.find(m => m.name === 'total_points_distributed')?.value || 0;
    const newUsers = metrics.find(m => m.name === 'new_users')?.value || 0;
    const redeemedRewards = metrics.find(m => m.name === 'redeemed_rewards')?.value || 0;
    
    this.performanceMetrics = [
      {
        name: 'Recolecciones Diarias',
        value: dailyCollections,
        change: '+0%', // TODO: Calculate from previous period
        trend: 'up',
        icon: 'trending_up'
      },
      {
        name: 'Puntos Distribuidos',
        value: totalPoints,
        change: '+0%', // TODO: Calculate from previous period
        trend: 'up',
        icon: 'trending_up'
      },
      {
        name: 'Nuevos Usuarios',
        value: newUsers,
        change: '+0%', // TODO: Calculate from previous period
        trend: 'up',
        icon: 'trending_up'
      },
      {
        name: 'Recompensas Canjeadas',
        value: redeemedRewards,
        change: '+0%', // TODO: Calculate from previous period
        trend: 'up',
        icon: 'trending_up'
      }
    ];
  }

  private loadCollectionAnalytics(municipalityId?: string): void {
    // Load collection analytics from waste collections
    this.wasteCollectionService.getWasteCollections().subscribe({
      next: (collections) => {
        const collectionsArray = Array.isArray(collections) ? collections : [];
        
        // Filter by municipality if needed
        let filteredCollections = collectionsArray;
        if (municipalityId) {
          // Filter collections by municipality through collectors
          // This would require joining with collectors, for now use all
          filteredCollections = collectionsArray;
        }
        
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const weekAgo = new Date(today);
        weekAgo.setDate(weekAgo.getDate() - 7);
        const monthAgo = new Date(today);
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        
        const todayCollections = filteredCollections.filter((c: any) => {
          const cDate = new Date(c.collectedAt || c.timestamp);
          return cDate >= today;
        });
        
        const weekCollections = filteredCollections.filter((c: any) => {
          const cDate = new Date(c.collectedAt || c.timestamp);
          return cDate >= weekAgo;
        });
        
        const monthCollections = filteredCollections.filter((c: any) => {
          const cDate = new Date(c.collectedAt || c.timestamp);
          return cDate >= monthAgo;
        });
        
        this.collectionAnalytics = [
          {
            period: 'Hoy',
            collections: todayCollections.length,
            points: todayCollections.reduce((sum: number, c: any) => sum + (c.points || 0), 0),
            waste: Math.round(todayCollections.reduce((sum: number, c: any) => sum + (c.weight || 0), 0) * 10) / 10,
            beaches: 0 // TODO: Calculate unique beaches from collectors
          },
          {
            period: 'Esta Semana',
            collections: weekCollections.length,
            points: weekCollections.reduce((sum: number, c: any) => sum + (c.points || 0), 0),
            waste: Math.round(weekCollections.reduce((sum: number, c: any) => sum + (c.weight || 0), 0) * 10) / 10,
            beaches: 0 // TODO: Calculate unique beaches from collectors
          },
          {
            period: 'Este Mes',
            collections: monthCollections.length,
            points: monthCollections.reduce((sum: number, c: any) => sum + (c.points || 0), 0),
            waste: Math.round(monthCollections.reduce((sum: number, c: any) => sum + (c.weight || 0), 0) * 10) / 10,
            beaches: 0 // TODO: Calculate unique beaches from collectors
          }
        ];
      },
      error: (error) => {
        console.error('Error loading collection analytics:', error);
        this.collectionAnalytics = [];
      }
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
    // Save sidebar state to localStorage
    localStorage.setItem('sidebarCollapsed', (!this.isSidenavOpen).toString());
  }

  refreshData(): void {
    this.isLoading = true;
    // Reload all data from backend
    this.loadAllData();
    
    setTimeout(() => {
      this.isLoading = false;
      this.snackBar.open(
        '✅ Data refreshed successfully!',
        'Close',
        {
          duration: 3000,
          horizontalPosition: 'center',
          verticalPosition: 'bottom'
        }
      );
    }, 1000);
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