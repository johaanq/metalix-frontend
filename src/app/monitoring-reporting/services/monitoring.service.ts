import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Report {
  id: string;
  reportType: 'COLLECTION_EFFICIENCY' | 'ENVIRONMENTAL_IMPACT' | 'USER_PARTICIPATION' | 'FINANCIAL_SUMMARY';
  municipalityId: string;
  generatedBy: string;
  data: any;
  createdAt: string;
  status: 'PENDING' | 'COMPLETED' | 'FAILED';
  fileName?: string;
}

export interface Metric {
  id: string;
  name: string;
  value: number;
  unit: string;
  timestamp: string;
  source: 'WASTE_COLLECTOR' | 'SYSTEM' | 'USER' | 'SENSOR';
  municipalityId: string;
  metadata?: any;
}

export interface Alert {
  id: string;
  alertType: 'COLLECTOR_FULL' | 'MAINTENANCE_DUE' | 'LOW_PARTICIPATION' | 'SYSTEM_ERROR' | 'SECURITY_BREACH';
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  message: string;
  source: 'WASTE_COLLECTOR' | 'SYSTEM' | 'ANALYTICS' | 'SECURITY';
  isResolved: boolean;
  createdAt: string;
  resolvedAt?: string;
  metadata?: any;
}

export interface DashboardData {
  municipalityId: string;
  totalCollections: number;
  totalWeight: number;
  activeUsers: number;
  totalPoints: number;
  environmentalImpact: {
    co2Saved: number;
    energySaved: number;
    treesEquivalent: number;
  };
  recentAlerts: Alert[];
  topCollectors: Array<{
    id: string;
    name: string;
    collections: number;
    weight: number;
  }>;
  lastUpdated: string;
}

@Injectable({
  providedIn: 'root'
})
export class MonitoringService {

  constructor(private http: HttpClient) { }

  getReports(municipalityId?: string): Observable<Report[]> {
    const url = municipalityId 
      ? `${environment.apiUrl}${environment.endpoints.reports}?municipalityId=${municipalityId}`
      : `${environment.apiUrl}${environment.endpoints.reports}`;
    return this.http.get<Report[]>(url);
  }

  getReportById(id: string): Observable<Report> {
    return this.http.get<Report>(`${environment.apiUrl}${environment.endpoints.reports}/${id}`);
  }

  generateReport(reportType: string, municipalityId: string, generatedBy: string): Observable<Report> {
    return this.http.post<Report>(`${environment.apiUrl}${environment.endpoints.reports}`, {
      reportType,
      municipalityId,
      generatedBy,
      data: {},
      status: 'PENDING'
    });
  }

  getMetrics(municipalityId?: string, name?: string): Observable<Metric[]> {
    let url = `${environment.apiUrl}${environment.endpoints.metrics}`;
    const params = [];
    
    if (municipalityId) params.push(`municipalityId=${municipalityId}`);
    if (name) params.push(`name=${name}`);
    
    if (params.length > 0) {
      url += `?${params.join('&')}`;
    }
    
    return this.http.get<Metric[]>(url);
  }

  getAlerts(municipalityId?: string, isResolved?: boolean): Observable<Alert[]> {
    let url = `${environment.apiUrl}${environment.endpoints.alerts}`;
    const params = [];
    
    if (municipalityId) params.push(`municipalityId=${municipalityId}`);
    if (isResolved !== undefined) params.push(`isResolved=${isResolved}`);
    
    if (params.length > 0) {
      url += `?${params.join('&')}`;
    }
    
    return this.http.get<Alert[]>(url);
  }

  resolveAlert(id: string): Observable<Alert> {
    return this.http.patch<Alert>(`${environment.apiUrl}${environment.endpoints.alerts}/${id}`, {
      isResolved: true,
      resolvedAt: new Date().toISOString()
    });
  }

  getDashboardData(municipalityId: string): Observable<DashboardData> {
    return this.http.get<DashboardData>(`${environment.apiUrl}${environment.endpoints.municipalities}/${municipalityId}/dashboard`);
  }

  getRealTimeMetrics(municipalityId: string): Observable<Metric[]> {
    return this.http.get<Metric[]>(`${environment.apiUrl}${environment.endpoints.metrics}?municipalityId=${municipalityId}&_sort=timestamp&_order=desc&_limit=50`);
  }
}
