import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Municipality {
  id: string;
  name: string;
  code: string;
  region: string;
  population: number;
  area: number;
  contactInfo: {
    email: string;
    phone: string;
    address: string;
    website: string;
  };
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Zone {
  id: string;
  municipalityId: string;
  name: string;
  boundaries: {
    north: number;
    south: number;
    east: number;
    west: number;
  };
  population: number;
  zoneType: 'RESIDENTIAL' | 'COMMERCIAL' | 'INDUSTRIAL' | 'MIXED';
  createdAt: string;
  updatedAt: string;
}

export interface MunicipalityStats {
  municipalityId: string;
  totalUsers: number;
  activeUsers: number;
  totalCollections: number;
  totalWeight: number;
  totalPoints: number;
  averageParticipation: number;
  lastUpdated: string;
}

@Injectable({
  providedIn: 'root'
})
export class MunicipalityService {

  constructor(private http: HttpClient) { }

  getMunicipalities(): Observable<Municipality[]> {
    return this.http.get<Municipality[]>(`${environment.apiUrl}${environment.endpoints.municipalities}`);
  }

  getMunicipalityById(id: string): Observable<Municipality> {
    return this.http.get<Municipality>(`${environment.apiUrl}${environment.endpoints.municipalities}/${id}`);
  }

  getZones(municipalityId?: string): Observable<Zone[]> {
    const url = municipalityId 
      ? `${environment.apiUrl}${environment.endpoints.zones}?municipalityId=${municipalityId}`
      : `${environment.apiUrl}${environment.endpoints.zones}`;
    return this.http.get<Zone[]>(url);
  }

  getZoneById(id: string): Observable<Zone> {
    return this.http.get<Zone>(`${environment.apiUrl}${environment.endpoints.zones}/${id}`);
  }

  getMunicipalityStats(municipalityId: string): Observable<MunicipalityStats> {
    return this.http.get<MunicipalityStats>(`${environment.apiUrl}${environment.endpoints.municipalities}/${municipalityId}/stats`);
  }

  createMunicipality(municipality: Partial<Municipality>): Observable<Municipality> {
    return this.http.post<Municipality>(`${environment.apiUrl}${environment.endpoints.municipalities}`, municipality);
  }

  updateMunicipality(id: string, municipality: Partial<Municipality>): Observable<Municipality> {
    return this.http.patch<Municipality>(`${environment.apiUrl}${environment.endpoints.municipalities}/${id}`, municipality);
  }

  createZone(zone: Partial<Zone>): Observable<Zone> {
    return this.http.post<Zone>(`${environment.apiUrl}${environment.endpoints.zones}`, zone);
  }

  updateZone(id: string, zone: Partial<Zone>): Observable<Zone> {
    return this.http.patch<Zone>(`${environment.apiUrl}${environment.endpoints.zones}/${id}`, zone);
  }

  deleteZone(id: string): Observable<void> {
    return this.http.delete<void>(`${environment.apiUrl}${environment.endpoints.zones}/${id}`);
  }
}
