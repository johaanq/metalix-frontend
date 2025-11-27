import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface WasteCollector {
  id: string;
  municipalityId: string;
  zoneId: string;
  name: string;
  location: {
    latitude: number;
    longitude: number;
    address: string;
  };
  status: 'ACTIVE' | 'INACTIVE' | 'MAINTENANCE';
  capacity: number;
  currentWeight: number;
  lastMaintenance: string;
  nextMaintenance: string;
  createdAt: string;
  updatedAt: string;
}

export interface WasteCollection {
  id?: number;
  userId: number;
  collectorId: number;
  municipalityId: number;
  weight: number;
  recyclableType: 'PLASTIC' | 'GLASS' | 'METAL' | 'PAPER' | 'CARDBOARD' | 'ORGANIC' | 'ELECTRONIC' | 'HAZARDOUS' | 'GENERAL';
  points: number;
  timestamp: string;
  verified?: boolean;
  verificationMethod?: 'RFID' | 'MANUAL' | 'QR_CODE' | 'SENSOR' | 'VISUAL';
  createdAt?: string;
  updatedAt?: string;
}

export interface SensorData {
  id: string;
  collectorId: string;
  sensorType: 'WEIGHT' | 'OCCUPANCY' | 'TEMPERATURE';
  value: number;
  unit: string;
  timestamp: string;
  status: 'NORMAL' | 'HIGH' | 'LOW' | 'ERROR';
}

@Injectable({
  providedIn: 'root'
})
export class WasteCollectionService {

  constructor(
    private http: HttpClient
  ) { }

  getWasteCollectors(): Observable<WasteCollector[]> {
    return this.http.get<any[]>(`${environment.apiUrl}${environment.endpoints.wasteCollectors}`).pipe(
      map(collectors => collectors.map(c => this.mapWasteCollectorResponse(c)))
    );
  }

  getWasteCollectorById(id: string): Observable<WasteCollector> {
    return this.http.get<any>(`${environment.apiUrl}${environment.endpoints.wasteCollectors}/${id}`).pipe(
      map(c => this.mapWasteCollectorResponse(c))
    );
  }

  getWasteCollections(userId?: string): Observable<WasteCollection[]> {
    const url = userId 
      ? `${environment.apiUrl}${environment.endpoints.wasteCollections}/user/${userId}`
      : `${environment.apiUrl}${environment.endpoints.wasteCollections}`;
    return this.http.get<any>(url).pipe(
      map((response: any) => {
        // El backend puede devolver una página o una lista
        const collections = response.content || response || [];
        return collections.map((c: any) => this.mapWasteCollectionResponse(c));
      })
    );
  }

  createWasteCollection(collection: Partial<WasteCollection>): Observable<WasteCollection> {
    return this.http.post<any>(`${environment.apiUrl}${environment.endpoints.wasteCollections}`, collection).pipe(
      map(c => this.mapWasteCollectionResponse(c))
    );
  }

  // IoT - Dejamos como está según instrucciones
  getSensorData(collectorId?: string): Observable<SensorData[]> {
    // TODO: Implementar cuando se avance con IoT
    return new Observable(observer => {
      observer.next([]);
      observer.complete();
    });
  }

  updateCollectorStatus(id: string, status: string): Observable<WasteCollector> {
    return this.http.put<any>(
      `${environment.apiUrl}${environment.endpoints.wasteCollectors}/${id}`,
      { status: status }
    ).pipe(
      map(c => this.mapWasteCollectorResponse(c))
    );
  }

  private mapWasteCollectorResponse(c: any): WasteCollector {
        return {
      id: c.id?.toString() || '',
      municipalityId: c.municipalityId?.toString() || '',
      zoneId: c.zoneId?.toString() || '',
      name: c.name || '',
      location: c.location || {
        latitude: 0,
        longitude: 0,
        address: ''
          },
      status: c.status || 'ACTIVE',
      capacity: c.capacity || 0,
      currentWeight: c.currentWeight || 0,
      lastMaintenance: c.lastMaintenance || new Date().toISOString(),
      nextMaintenance: c.nextMaintenance || new Date().toISOString(),
      createdAt: c.createdAt || new Date().toISOString(),
      updatedAt: c.updatedAt || new Date().toISOString()
    };
  }

  private mapWasteCollectionResponse(c: any): WasteCollection {
    return {
      id: c.id,
      userId: c.userId,
      collectorId: c.collectorId,
      municipalityId: c.municipalityId,
      weight: c.weight || 0,
      recyclableType: c.recyclableType || c.materialType || 'METAL',
      points: c.points || 0,
      timestamp: c.timestamp || c.createdAt || new Date().toISOString(),
      verified: c.verified ?? false,
      verificationMethod: c.verificationMethod,
      createdAt: c.createdAt || new Date().toISOString(),
      updatedAt: c.updatedAt || new Date().toISOString()
    };
  }
}
