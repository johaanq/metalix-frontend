import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
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

  constructor(
    private http: HttpClient
  ) { }

  getReports(municipalityId?: string): Observable<Report[]> {
    const url = municipalityId 
      ? `${environment.apiUrl}${environment.endpoints.monitoring}/reports/municipality/${municipalityId}`
      : `${environment.apiUrl}${environment.endpoints.monitoring}/reports`;
    return this.http.get<any[]>(url).pipe(
      map(reports => reports.map(r => this.mapReportResponse(r)))
    );
  }

  getReportById(id: string): Observable<Report> {
    return this.http.get<any>(`${environment.apiUrl}${environment.endpoints.monitoring}/reports/${id}`).pipe(
      map(r => this.mapReportResponse(r))
    );
  }

  generateReport(reportType: string, municipalityId: string, generatedBy: string): Observable<Report> {
    const request = {
      reportType: reportType,
      municipalityId: parseInt(municipalityId),
      generatedBy: parseInt(generatedBy),
      data: {},
      status: 'PENDING'
    };
    return this.http.post<any>(`${environment.apiUrl}${environment.endpoints.monitoring}/reports`, request).pipe(
      map(r => this.mapReportResponse(r))
    );
  }

  getMetrics(municipalityId?: string, name?: string): Observable<Metric[]> {
    const url = municipalityId 
      ? `${environment.apiUrl}${environment.endpoints.monitoring}/metrics/municipality/${municipalityId}`
      : `${environment.apiUrl}${environment.endpoints.monitoring}/metrics`;
    return this.http.get<any[]>(url).pipe(
      map(metrics => metrics.map(m => this.mapMetricResponse(m)))
    );
  }

  getAlerts(municipalityId?: string, isResolved?: boolean): Observable<Alert[]> {
    let url = `${environment.apiUrl}${environment.endpoints.monitoring}/alerts`;
    if (municipalityId) {
      url = `${environment.apiUrl}${environment.endpoints.monitoring}/alerts/municipality/${municipalityId}`;
    } else if (isResolved === false) {
      url = `${environment.apiUrl}${environment.endpoints.monitoring}/alerts/unread`;
    }
    return this.http.get<any[]>(url).pipe(
      map(alerts => alerts.map(a => this.mapAlertResponse(a)))
    );
  }

  resolveAlert(id: string): Observable<Alert> {
    return this.http.patch<any>(
      `${environment.apiUrl}${environment.endpoints.monitoring}/alerts/${id}`,
      { isResolved: true }
    ).pipe(
      map(a => this.mapAlertResponse(a))
    );
  }

  getDashboardData(municipalityId: string): Observable<DashboardData> {
    // Usar el endpoint del backend para obtener datos del dashboard
    return this.http.get<any>(`${environment.apiUrl}${environment.endpoints.municipalities}/${municipalityId}/dashboard`).pipe(
      map(dashboard => {
        const dashboardData: DashboardData = {
          municipalityId: dashboard.municipalityId?.toString() || municipalityId,
          totalCollections: dashboard.totalCollections || 0,
          totalWeight: dashboard.totalWeight || 0,
          activeUsers: dashboard.activeUsers || 0,
          totalPoints: dashboard.totalPoints || 0,
          environmentalImpact: dashboard.environmentalImpact || {
            co2Saved: 0,
            energySaved: 0,
            treesEquivalent: 0
          },
          recentAlerts: (dashboard.recentAlerts || []).map((a: any) => this.mapAlertResponse(a)),
          topCollectors: dashboard.topCollectors || [],
          lastUpdated: dashboard.lastUpdated || new Date().toISOString()
        };
        return dashboardData;
      })
    );
  }

  getRealTimeMetrics(municipalityId: string): Observable<Metric[]> {
    return this.getMetrics(municipalityId);
  }

  private mapReportResponse(r: any): Report {
    return {
      id: r.id?.toString() || '',
      reportType: r.reportType || 'COLLECTION_EFFICIENCY',
      municipalityId: r.municipalityId?.toString() || '',
      generatedBy: r.generatedBy?.toString() || '',
      data: r.data || {},
      createdAt: r.createdAt || new Date().toISOString(),
      status: r.status || 'PENDING',
      fileName: r.fileName
    };
  }

  private mapMetricResponse(m: any): Metric {
    return {
      id: m.id?.toString() || '',
      name: m.name || '',
      value: m.value || 0,
      unit: m.unit || '',
      timestamp: m.timestamp || m.createdAt || new Date().toISOString(),
      source: m.source || 'SYSTEM',
      municipalityId: m.municipalityId?.toString() || '',
      metadata: m.metadata
    };
  }

  private mapAlertResponse(a: any): Alert {
    return {
      id: a.id?.toString() || '',
      alertType: a.alertType || 'SYSTEM_ERROR',
      severity: a.severity || 'MEDIUM',
      message: a.message || '',
      source: a.source || 'SYSTEM',
      isResolved: a.isResolved ?? false,
      createdAt: a.createdAt || new Date().toISOString(),
      resolvedAt: a.resolvedAt,
      metadata: a.metadata
    };
  }
}
