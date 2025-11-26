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
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AuthService } from '../../../core/services/auth.service';
import { User, UserRole } from '../../../shared/models';
import { SidebarComponent } from '../../../shared/components/sidebar/sidebar';
import { WasteCollectionService, WasteCollector, WasteCollection } from '../../services/waste-collection.service';

@Component({
  selector: 'app-waste-collection-dashboard',
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
    MatDialogModule,
    MatSnackBarModule,
    SidebarComponent
  ],
  templateUrl: './waste-collection-dashboard.html',
  styleUrl: './waste-collection-dashboard.css'
})
export class WasteCollectionDashboard implements OnInit {
  currentUser: User | null = null;
  isSidenavOpen = true;
  isLoading = false;

  // Waste collection stats
  stats = {
    totalWasteCollected: 0,
    totalPointsEarned: 0,
    collectionSessions: 0,
    environmentalImpact: 0
  };

  // Collection history
  collectionHistory: any[] = [];

  // Available collection points
  collectionPoints: any[] = [];

  constructor(
    private authService: AuthService,
    private snackBar: MatSnackBar,
    private wasteCollectionService: WasteCollectionService
  ) {}

  ngOnInit(): void {
    // Load sidebar state from localStorage
    const savedSidebarState = localStorage.getItem('sidebarCollapsed');
    this.isSidenavOpen = savedSidebarState !== 'true';

    this.currentUser = this.authService.getCurrentUser();
    this.loadCollectionPoints();
    this.loadCollectionHistory();
    this.loadStats();
  }

  private loadCollectionPoints(): void {
    this.wasteCollectionService.getWasteCollectors().subscribe({
      next: (collectors: WasteCollector[]) => {
        const collectorsArray = Array.isArray(collectors) ? collectors : [];
        this.collectionPoints = collectorsArray.map(c => ({
          id: c.id,
          name: c.name,
          address: c.location.address,
          status: c.status === 'ACTIVE' ? 'Open' : 'Closed',
          hours: '8:00 AM - 6:00 PM',
          distance: this.calculateDistance(c.location.latitude, c.location.longitude),
          capacity: c.capacity,
          currentWeight: c.currentWeight
        }));
      },
      error: (error) => {
        console.error('Error loading collection points:', error);
        this.snackBar.open('Error loading collection points', 'Close', { duration: 3000 });
      }
    });
  }

  private loadCollectionHistory(): void {
    if (!this.currentUser) return;
    
    this.wasteCollectionService.getWasteCollections(this.currentUser.id).subscribe({
      next: (collections: WasteCollection[]) => {
        const collectionsArray = Array.isArray(collections) ? collections : [];
        this.collectionHistory = collectionsArray.map(c => {
          // Normalizar datos para manejar inconsistencias en la respuesta del backend
          const normalizedCollection = this.normalizeCollectionData(c);
          return {
            id: normalizedCollection.id,
            date: new Date(normalizedCollection.timestamp).toISOString().split('T')[0],
            wasteType: this.formatMaterialType(normalizedCollection.recyclableType),
            weight: normalizedCollection.weight,
            points: normalizedCollection.points,
            location: 'Collection Point' // We'll need to join with collectors if needed
          };
        }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      },
      error: (error) => {
        console.error('Error loading collection history:', error);
      }
    });
  }

  private loadStats(): void {
    if (!this.currentUser) return;
    
    this.wasteCollectionService.getWasteCollections(this.currentUser.id).subscribe({
      next: (collections: WasteCollection[]) => {
        const collectionsArray = Array.isArray(collections) ? collections : [];
        const normalizedCollections = collectionsArray.map(c => this.normalizeCollectionData(c));
        const totalWeight = normalizedCollections.reduce((sum, c) => sum + c.weight, 0);
        const totalPoints = normalizedCollections.reduce((sum, c) => sum + c.points, 0);
        
        this.stats = {
          totalWasteCollected: Math.round(totalWeight * 10) / 10,
          totalPointsEarned: totalPoints,
          collectionSessions: normalizedCollections.length,
          environmentalImpact: Math.round(totalWeight * 0.25 * 10) / 10 // Approximate CO2 saved
        };
      },
      error: (error) => {
        console.error('Error loading stats:', error);
      }
    });
  }

  private calculateDistance(lat: number, lon: number): string {
    // TODO: Calculate actual distance using geolocation API
    // For now, return a placeholder
    return 'N/A';
  }

  private normalizeCollectionData(collection: any): any {
    // Normalizar datos para manejar inconsistencias en la respuesta del backend
    return {
      id: collection.id,
      timestamp: collection.timestamp,
      weight: collection.weight,
      recyclableType: collection.recyclableType || collection.materialType || 'METAL',
      points: collection.points || collection.pointsEarned || 0,
      userId: collection.userId,
      collectorId: collection.collectorId,
      status: collection.status || 'COMPLETED'
    };
  }

  private formatMaterialType(type: string): string {
    const types: any = {
      'METAL': 'Metal',
      'PLASTIC': 'Plastic',
      'PAPER': 'Paper',
      'GLASS': 'Glass',
      'CARDBOARD': 'Cardboard',
      'ORGANIC': 'Organic',
      'ELECTRONIC': 'Electronic',
      'HAZARDOUS': 'Hazardous',
      'GENERAL': 'General'
    };
    return types[type] || type;
  }

  toggleSidenav(): void {
    this.isSidenavOpen = !this.isSidenavOpen;
    // Save sidebar state to localStorage
    localStorage.setItem('sidebarCollapsed', (!this.isSidenavOpen).toString());
  }

  startCollection(): void {
    if (!this.currentUser || this.collectionPoints.length === 0) {
      this.snackBar.open('Unable to start collection', 'Close', { duration: 3000 });
      return;
    }

    this.isLoading = true;
    
    // Create new collection - weight should come from user input or sensor
    // For now, using a default value. TODO: Get weight from user input or sensor
    const weight = 0; // Weight should be provided by user or sensor
    const pointsEarned = Math.floor(weight * 20); // 20 points per kg
    
    const newCollection: any = {
      userId: parseInt(this.currentUser.id),
      collectorId: parseInt(this.collectionPoints[0].id),
      municipalityId: parseInt(this.currentUser.municipalityId || '1'),
      weight: weight,
      recyclableType: 'METAL',
      points: pointsEarned,
      timestamp: new Date().toISOString(),
      verified: true,
      verificationMethod: 'RFID'
    };

    this.wasteCollectionService.createWasteCollection(newCollection).subscribe({
      next: (collection) => {
        this.isLoading = false;
        
        // Reload data
        this.loadCollectionHistory();
        this.loadStats();
        
        // Update user's points in localStorage
        if (this.currentUser) {
          this.currentUser.totalPoints = (this.currentUser.totalPoints || 0) + pointsEarned;
          localStorage.setItem('current_user', JSON.stringify(this.currentUser));
          this.authService['currentUserSubject'].next(this.currentUser);
        }
        
        // Show success notification
        this.snackBar.open(
          `✅ Collection successful! You earned ${pointsEarned} points for ${weight}kg of Metal`,
          'Close',
          {
            duration: 5000,
            horizontalPosition: 'center',
            verticalPosition: 'top',
            panelClass: ['success-snackbar']
          }
        );
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Error creating collection:', error);
        this.snackBar.open('Error creating collection', 'Close', { duration: 3000 });
      }
    });
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'Open':
        return 'primary';
      case 'Closed':
        return 'warn';
      default:
        return 'accent';
    }
  }

  getDirections(point: any): void {
    // Open Google Maps with the address
    const address = encodeURIComponent(point.address);
    const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${address}`;
    window.open(mapsUrl, '_blank');
    
    this.snackBar.open(`Opening directions to ${point.name}`, 'Close', {
      duration: 3000,
      horizontalPosition: 'center',
      verticalPosition: 'bottom'
    });
  }

  viewCollectionDetails(collection: any): void {
    this.snackBar.open(
      `Collection #${collection.id}: ${collection.wasteType} - ${collection.weight}kg at ${collection.location}`,
      'Close',
      {
        duration: 5000,
        horizontalPosition: 'center',
        verticalPosition: 'bottom'
      }
    );
  }
}