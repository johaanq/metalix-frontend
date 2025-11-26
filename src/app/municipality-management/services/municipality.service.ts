import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
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
    website?: string;
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

  constructor(
    private http: HttpClient
  ) { }

  getMunicipalities(): Observable<Municipality[]> {
    return this.http.get<any[]>(`${environment.apiUrl}${environment.endpoints.municipalities}`).pipe(
      map(municipalities => municipalities.map(m => this.mapMunicipalityResponse(m)))
    );
  }

  getMunicipalityById(id: string): Observable<Municipality> {
    return this.http.get<any>(`${environment.apiUrl}${environment.endpoints.municipalities}/${id}`).pipe(
      map(m => this.mapMunicipalityResponse(m))
    );
  }

  getZones(municipalityId?: string): Observable<Zone[]> {
    const url = municipalityId 
      ? `${environment.apiUrl}${environment.endpoints.zones}/municipality/${municipalityId}`
      : `${environment.apiUrl}${environment.endpoints.zones}`;
    return this.http.get<any[]>(url).pipe(
      map(zones => zones.map(z => this.mapZoneResponse(z)))
    );
  }

  private mapMunicipalityResponse(m: any): Municipality {
    return {
      id: m.id?.toString() || '',
      name: m.name || '',
      code: m.code || '',
      region: m.region || '',
      population: m.population || 0,
      area: m.area || 0,
      contactInfo: {
        email: m.contactEmail || '',
        phone: m.contactPhone || '',
        address: '',
        website: ''
      },
      isActive: m.isActive ?? true,
      createdAt: m.createdAt || new Date().toISOString(),
      updatedAt: m.updatedAt || new Date().toISOString()
    };
  }

  private mapZoneResponse(z: any): Zone {
    return {
      id: z.id?.toString() || '',
      municipalityId: z.municipalityId?.toString() || '',
      name: z.name || '',
      boundaries: z.boundaries || { north: 0, south: 0, east: 0, west: 0 },
      population: z.population || 0,
      zoneType: z.zoneType || 'RESIDENTIAL',
      createdAt: z.createdAt || new Date().toISOString(),
      updatedAt: z.updatedAt || new Date().toISOString()
    };
  }

  getZoneById(id: string): Observable<Zone> {
    return this.http.get<any>(`${environment.apiUrl}${environment.endpoints.zones}/${id}`).pipe(
      map(z => this.mapZoneResponse(z))
    );
  }

  getMunicipalityStats(municipalityId: string): Observable<MunicipalityStats> {
    return this.http.get<any>(`${environment.apiUrl}${environment.endpoints.municipalities}/${municipalityId}/stats`).pipe(
      map(stats => ({
        municipalityId: stats.municipalityId?.toString() || municipalityId,
        totalUsers: stats.totalUsers || 0,
        activeUsers: stats.activeUsers || 0,
        totalCollections: stats.totalCollections || 0,
        totalWeight: stats.totalWeight || 0,
        totalPoints: stats.totalPoints || 0,
        averageParticipation: stats.averageParticipation || 0,
        lastUpdated: stats.lastUpdated || new Date().toISOString()
      }))
    );
  }

  createMunicipality(municipality: Partial<Municipality>): Observable<Municipality> {
    const request = {
      name: municipality.name,
      code: municipality.code,
      region: municipality.region,
      population: municipality.population,
      area: municipality.area,
      contactEmail: municipality.contactInfo?.email,
      contactPhone: municipality.contactInfo?.phone
    };
    return this.http.post<any>(`${environment.apiUrl}${environment.endpoints.municipalities}`, request).pipe(
      map(m => this.mapMunicipalityResponse(m))
    );
  }

  updateMunicipality(id: string, municipality: Partial<Municipality>): Observable<Municipality> {
    const request = {
      name: municipality.name,
      code: municipality.code,
      region: municipality.region,
      population: municipality.population,
      area: municipality.area,
      contactEmail: municipality.contactInfo?.email,
      contactPhone: municipality.contactInfo?.phone,
      isActive: municipality.isActive
    };
    return this.http.put<any>(`${environment.apiUrl}${environment.endpoints.municipalities}/${id}`, request).pipe(
      map(m => this.mapMunicipalityResponse(m))
    );
  }

  createZone(zone: Partial<Zone>): Observable<Zone> {
    return this.http.post<any>(`${environment.apiUrl}${environment.endpoints.zones}`, zone).pipe(
      map(z => this.mapZoneResponse(z))
    );
  }

  updateZone(id: string, zone: Partial<Zone>): Observable<Zone> {
    return this.http.put<any>(`${environment.apiUrl}${environment.endpoints.zones}/${id}`, zone).pipe(
      map(z => this.mapZoneResponse(z))
    );
  }

  deleteZone(id: string): Observable<void> {
    return this.http.delete<void>(`${environment.apiUrl}${environment.endpoints.zones}/${id}`);
  }
}
