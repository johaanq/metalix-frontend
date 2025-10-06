import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { MockDataService } from '../../core/services/mock-data.service';

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
    private http: HttpClient,
    private mockDataService: MockDataService
  ) { }

  getWasteCollectors(): Observable<WasteCollector[]> {
    return this.mockDataService.getWasteCollectors();
  }

  getWasteCollectorById(id: string): Observable<WasteCollector> {
    return this.mockDataService.getWasteCollectors().pipe(
      map(collectors => collectors.find(c => c.id === id) || null)
    );
  }

  getWasteCollections(userId?: string): Observable<WasteCollection[]> {
    if (userId) {
      return this.mockDataService.getWasteCollectionsByUser(userId);
    }
    return this.mockDataService.getWasteCollections();
  }

  createWasteCollection(collection: Partial<WasteCollection>): Observable<WasteCollection> {
    // Simular creación - en mock data no se persiste
    const newCollection = {
      id: Date.now(),
      ...collection,
      timestamp: new Date().toISOString(),
      status: 'COMPLETED'
    } as WasteCollection;
    
    return of(newCollection);
  }

  getSensorData(collectorId?: string): Observable<SensorData[]> {
    return this.mockDataService.getSensorData();
  }

  updateCollectorStatus(id: string, status: string): Observable<WasteCollector> {
    // Simular actualización - en mock data no se persiste
    return this.getWasteCollectorById(id).pipe(
      map(collector => {
        if (collector) {
          return { ...collector, status: status as any, updatedAt: new Date().toISOString() };
        }
        // Si no existe, crear uno por defecto
        return {
          id: id,
          municipalityId: '1',
          zoneId: '1',
          name: 'Default Collector',
          location: {
            latitude: -12.11,
            longitude: -77.03,
            address: 'Default Address'
          },
          status: status as any,
          capacity: 100,
          currentWeight: 0,
          lastMaintenance: new Date().toISOString(),
          nextMaintenance: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        } as WasteCollector;
      })
    );
  }
}
