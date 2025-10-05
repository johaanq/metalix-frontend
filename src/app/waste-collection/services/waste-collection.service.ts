import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
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

  constructor(private http: HttpClient) { }

  getWasteCollectors(): Observable<WasteCollector[]> {
    return this.http.get<WasteCollector[]>(`${environment.apiUrl}${environment.endpoints.wasteCollectors}`);
  }

  getWasteCollectorById(id: string): Observable<WasteCollector> {
    return this.http.get<WasteCollector>(`${environment.apiUrl}${environment.endpoints.wasteCollectors}/${id}`);
  }

  getWasteCollections(userId?: string): Observable<WasteCollection[]> {
    const url = userId 
      ? `${environment.apiUrl}${environment.endpoints.wasteCollections}?userId=${userId}`
      : `${environment.apiUrl}${environment.endpoints.wasteCollections}`;
    return this.http.get<WasteCollection[]>(url);
  }

  createWasteCollection(collection: Partial<WasteCollection>): Observable<WasteCollection> {
    return this.http.post<WasteCollection>(`${environment.apiUrl}${environment.endpoints.wasteCollections}`, collection);
  }

  getSensorData(collectorId?: string): Observable<SensorData[]> {
    const url = collectorId 
      ? `${environment.apiUrl}${environment.endpoints.sensorData}?collectorId=${collectorId}`
      : `${environment.apiUrl}${environment.endpoints.sensorData}`;
    return this.http.get<SensorData[]>(url);
  }

  updateCollectorStatus(id: string, status: string): Observable<WasteCollector> {
    return this.http.put<WasteCollector>(`${environment.apiUrl}${environment.endpoints.wasteCollectors}/${id}`, { status });
  }
}
