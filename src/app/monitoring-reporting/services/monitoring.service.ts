import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { MockDataService } from '../../core/services/mock-data.service';

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
    private http: HttpClient,
    private mockDataService: MockDataService
  ) { }

  getReports(municipalityId?: string): Observable<Report[]> {
    return this.mockDataService.getReports();
  }

  getReportById(id: string): Observable<Report> {
    return this.mockDataService.getReports().pipe(
      map(reports => reports.find(r => r.id === id) || null)
    );
  }

  generateReport(reportType: string, municipalityId: string, generatedBy: string): Observable<Report> {
    // Simular generación de reporte - en mock data no se persiste
    const newReport: Report = {
      id: Date.now().toString(),
      reportType: reportType as any,
      municipalityId,
      generatedBy,
      data: {},
      status: 'COMPLETED',
      createdAt: new Date().toISOString()
    };
    
    return of(newReport);
  }

  getMetrics(municipalityId?: string, name?: string): Observable<Metric[]> {
    return this.mockDataService.getMetrics();
  }

  getAlerts(municipalityId?: string, isResolved?: boolean): Observable<Alert[]> {
    return this.mockDataService.getAlerts();
  }

  resolveAlert(id: string): Observable<Alert> {
    // Simular resolución de alerta - en mock data no se persiste
    return this.mockDataService.getAlerts().pipe(
      map(alerts => {
        const alert = alerts.find(a => a.id === id);
        if (alert) {
          return { ...alert, isResolved: true, resolvedAt: new Date().toISOString() };
        }
        return null;
      })
    );
  }

  getDashboardData(municipalityId: string): Observable<DashboardData> {
    // Simular datos del dashboard combinando mock data
    return this.mockDataService.getWasteCollections().pipe(
      map(collections => {
        const totalCollections = collections.length;
        const totalWeight = collections.reduce((sum, c) => sum + (c.weight || 0), 0);
        
        const dashboardData: DashboardData = {
          municipalityId,
          totalCollections,
          totalWeight,
          activeUsers: 1250, // Del mock data
          totalPoints: 45000, // Del mock data
          environmentalImpact: {
            co2Saved: totalWeight * 0.5, // Estimación
            energySaved: totalWeight * 2.5,
            treesEquivalent: totalWeight * 0.02
          },
          recentAlerts: [], // Se llenará con getAlerts
          topCollectors: [],
          lastUpdated: new Date().toISOString()
        };
        
        return dashboardData;
      })
    );
  }

  getRealTimeMetrics(municipalityId: string): Observable<Metric[]> {
    return this.mockDataService.getMetrics();
  }
}
