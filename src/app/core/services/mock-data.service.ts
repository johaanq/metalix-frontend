import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MockDataService {
  
  private mockData = {
    users: [
      {
        id: "1",
        email: "citizen@example.com",
        firstName: "Juan",
        lastName: "Pérez",
        role: "CITIZEN",
        municipalityId: "1",
        municipality: "Municipalidad de Miraflores",
        phone: "+51-1-999-888-777",
        address: "Av. Larco 200, Miraflores",
        city: "Lima",
        zipCode: "15074",
        isActive: true,
        createdAt: "2024-01-15T10:30:00Z",
        updatedAt: "2024-01-15T10:30:00Z",
        rfidCard: "RFID001",
        totalPoints: 1250
      },
      {
        id: "2",
        email: "admin@municipalidad.com",
        firstName: "María",
        lastName: "González",
        role: "MUNICIPALITY_ADMIN",
        municipalityId: "1",
        municipality: "Municipalidad de Miraflores",
        phone: "+51-1-617-7272",
        address: "Av. Larco 400, Miraflores",
        city: "Lima",
        zipCode: "15074",
        isActive: true,
        createdAt: "2024-01-10T09:00:00Z",
        updatedAt: "2024-01-10T09:00:00Z"
      },
      {
        id: "3",
        email: "system@metalix.com",
        firstName: "Carlos",
        lastName: "Rodríguez",
        role: "SYSTEM_ADMIN",
        municipalityId: null,
        phone: "+51-1-513-9000",
        address: "Av. República 100, Lima",
        city: "Lima",
        zipCode: "15073",
        isActive: true,
        createdAt: "2024-01-01T08:00:00Z",
        updatedAt: "2024-01-01T08:00:00Z"
      }
    ],
    municipalities: [
      {
        id: "1",
        name: "Municipalidad de Miraflores",
        code: "MIR001",
        region: "Lima",
        province: "Lima",
        district: "Miraflores",
        population: 85000,
        area: 9.62,
        address: "Av. Larco 400",
        phone: "+51-1-617-7272",
        email: "contacto@miraflores.gob.pe",
        website: "https://www.miraflores.gob.pe",
        status: "Active",
        totalCitizens: 1250,
        collectionPoints: 15,
        activeRewards: 25,
        totalWasteCollected: 12500,
        totalPointsDistributed: 45000,
        createdAt: "2024-01-01T08:00:00Z",
        updatedAt: "2024-01-25T16:45:00Z"
      },
      {
        id: "2",
        name: "Municipalidad de San Isidro",
        code: "SIS001",
        region: "Lima",
        province: "Lima",
        district: "San Isidro",
        population: 65000,
        area: 11.1,
        address: "Calle Las Begonias 475",
        phone: "+51-1-513-9000",
        email: "contacto@munisanisidro.gob.pe",
        website: "https://www.munisanisidro.gob.pe",
        status: "Active",
        totalCitizens: 890,
        collectionPoints: 12,
        activeRewards: 18,
        totalWasteCollected: 8900,
        totalPointsDistributed: 32000,
        createdAt: "2024-01-05T09:00:00Z",
        updatedAt: "2024-01-25T16:45:00Z"
      }
    ],
    zones: [
      {
        id: "1",
        municipalityId: "1",
        name: "Zona Centro",
        boundaries: {
          north: -12.1,
          south: -12.12,
          east: -77.02,
          west: -77.04
        },
        population: 25000,
        zoneType: "RESIDENTIAL",
        createdAt: "2024-01-01T00:00:00Z",
        updatedAt: "2024-01-01T00:00:00Z"
      },
      {
        id: "2",
        municipalityId: "1",
        name: "Zona Comercial",
        boundaries: {
          north: -12.08,
          south: -12.1,
          east: -77,
          west: -77.02
        },
        population: 15000,
        zoneType: "COMMERCIAL",
        createdAt: "2024-01-01T00:00:00Z",
        updatedAt: "2024-01-01T00:00:00Z"
      }
    ],
    wasteCollectors: [
      {
        id: "1",
        municipalityId: "1",
        zoneId: "1",
        name: "Recolector Centro-001",
        location: {
          latitude: -12.11,
          longitude: -77.03,
          address: "Av. Larco 200, Miraflores"
        },
        status: "ACTIVE",
        capacity: 100,
        currentWeight: 45,
        lastMaintenance: "2024-01-20T00:00:00Z",
        nextMaintenance: "2024-02-20T00:00:00Z",
        createdAt: "2024-01-01T00:00:00Z",
        updatedAt: "2024-01-25T14:30:00Z"
      },
      {
        id: "2",
        municipalityId: "1",
        zoneId: "2",
        name: "Recolector Comercial-001",
        location: {
          latitude: -12.09,
          longitude: -77.01,
          address: "Av. Comercio 150, Miraflores"
        },
        status: "ACTIVE",
        capacity: 150,
        currentWeight: 78,
        lastMaintenance: "2024-01-15T00:00:00Z",
        nextMaintenance: "2024-02-15T00:00:00Z",
        createdAt: "2024-01-01T00:00:00Z",
        updatedAt: "2024-01-25T16:45:00Z"
      }
    ],
    wasteCollections: [
      {
        id: "1",
        userId: "1",
        collectorId: "1",
        weight: 2.5,
        materialType: "METAL",
        pointsEarned: 50,
        timestamp: "2024-01-25T14:30:00Z",
        status: "COMPLETED",
        rfidCard: "RFID001"
      },
      {
        id: "2",
        userId: "1",
        collectorId: "1",
        weight: 1.8,
        materialType: "METAL",
        pointsEarned: 36,
        timestamp: "2024-01-24T10:15:00Z",
        status: "COMPLETED",
        rfidCard: "RFID001"
      },
      {
        id: "3",
        userId: "1",
        collectorId: "2",
        weight: 3.2,
        materialType: "METAL",
        pointsEarned: 64,
        timestamp: "2024-01-23T16:20:00Z",
        status: "COMPLETED",
        rfidCard: "RFID001"
      }
    ],
    rewards: [
      {
        id: "1",
        name: "Descuento 10% Supermercado",
        description: "Descuento del 10% en tu próxima compra en supermercados participantes",
        pointsCost: 200,
        category: "SHOPPING",
        isActive: true,
        stock: 50,
        validUntil: "2024-12-31T23:59:59Z",
        municipalityId: "1",
        createdAt: "2024-01-01T00:00:00Z",
        updatedAt: "2024-01-01T00:00:00Z"
      },
      {
        id: "2",
        name: "Entrada Gratis Cine",
        description: "Una entrada gratis para cualquier película en cines participantes",
        pointsCost: 300,
        category: "ENTERTAINMENT",
        isActive: true,
        stock: 25,
        validUntil: "2024-12-31T23:59:59Z",
        municipalityId: "1",
        createdAt: "2024-01-01T00:00:00Z",
        updatedAt: "2024-01-01T00:00:00Z"
      },
      {
        id: "3",
        name: "Descuento 15% Restaurante",
        description: "Descuento del 15% en restaurantes participantes",
        pointsCost: 150,
        category: "DINING",
        isActive: true,
        stock: 100,
        validUntil: "2024-12-31T23:59:59Z",
        municipalityId: "1",
        createdAt: "2024-01-01T00:00:00Z",
        updatedAt: "2024-01-01T00:00:00Z"
      }
    ],
    rewardTransactions: [
      {
        id: "1",
        userId: "1",
        rewardId: "1",
        transactionType: "REDEEMED",
        points: -200,
        description: "Canje de descuento supermercado",
        timestamp: "2024-01-20T15:30:00Z",
        status: "COMPLETED"
      },
      {
        id: "2",
        userId: "1",
        rewardId: null,
        transactionType: "EARNED",
        points: 50,
        description: "Puntos ganados por recolección de metal",
        timestamp: "2024-01-25T14:30:00Z",
        status: "COMPLETED"
      }
    ],
    reports: [
      {
        id: "1",
        reportType: "COLLECTION_EFFICIENCY",
        municipalityId: "1",
        generatedBy: "2",
        data: {
          totalCollections: 1250,
          totalWeight: 3125.5,
          averageWeight: 2.5,
          efficiency: 85.2,
          period: "2024-01-01 to 2024-01-31"
        },
        createdAt: "2024-01-31T23:59:59Z",
        status: "COMPLETED",
        fileName: "collection_efficiency_jan_2024.pdf"
      }
    ],
    metrics: [
      {
        id: "1",
        name: "daily_collections",
        value: 45,
        unit: "count",
        timestamp: "2024-01-25T00:00:00Z",
        source: "WASTE_COLLECTOR",
        municipalityId: "1",
        metadata: {
          zoneId: "1",
          collectorId: "1"
        }
      },
      {
        id: "2",
        name: "total_weight_collected",
        value: 125.5,
        unit: "kg",
        timestamp: "2024-01-25T00:00:00Z",
        source: "WASTE_COLLECTOR",
        municipalityId: "1",
        metadata: {
          zoneId: "1",
          collectorId: "1"
        }
      }
    ],
    alerts: [
      {
        id: "1",
        alertType: "COLLECTOR_FULL",
        severity: "HIGH",
        message: "El recolector Centro-001 está al 90% de su capacidad",
        source: "WASTE_COLLECTOR",
        isResolved: false,
        createdAt: "2024-01-25T16:45:00Z",
        metadata: {
          collectorId: "1",
          currentWeight: 90,
          capacity: 100
        }
      }
    ],
    rfidCards: [
      {
        id: "1",
        cardNumber: "RFID001",
        userId: "1",
        isActive: true,
        issuedAt: "2024-01-15T10:30:00Z",
        lastUsed: "2024-01-25T14:30:00Z",
        usageCount: 15
      }
    ],
    sensorData: [
      {
        id: "1",
        collectorId: "1",
        sensorType: "WEIGHT",
        value: 45.2,
        unit: "kg",
        timestamp: "2024-01-25T16:45:00Z",
        status: "NORMAL"
      }
    ]
  };

  // Métodos para obtener datos
  getUsers(): Observable<any[]> {
    return of(this.mockData.users);
  }

  getMunicipalities(): Observable<any[]> {
    return of(this.mockData.municipalities);
  }

  getZones(): Observable<any[]> {
    return of(this.mockData.zones);
  }

  getWasteCollectors(): Observable<any[]> {
    return of(this.mockData.wasteCollectors);
  }

  getWasteCollections(): Observable<any[]> {
    return of(this.mockData.wasteCollections);
  }

  getRewards(): Observable<any[]> {
    return of(this.mockData.rewards);
  }

  getRewardTransactions(): Observable<any[]> {
    return of(this.mockData.rewardTransactions);
  }

  getReports(): Observable<any[]> {
    return of(this.mockData.reports);
  }

  getMetrics(): Observable<any[]> {
    return of(this.mockData.metrics);
  }

  getAlerts(): Observable<any[]> {
    return of(this.mockData.alerts);
  }

  getRfidCards(): Observable<any[]> {
    return of(this.mockData.rfidCards);
  }

  getSensorData(): Observable<any[]> {
    return of(this.mockData.sensorData);
  }

  // Método de login
  login(email: string, password: string): Observable<any> {
    const user = this.mockData.users.find(u => u.email === email);
    
    if (user && (password === 'password123' || password === 'admin123')) {
      return of({
        user: user,
        token: `token_${user.id}_${Date.now()}`
      });
    } else {
      return of(null);
    }
  }

  // Método para obtener usuario por ID
  getUserById(id: string): Observable<any> {
    const user = this.mockData.users.find(u => u.id === id);
    return of(user || null);
  }

  // Método para obtener municipio por ID
  getMunicipalityById(id: string): Observable<any> {
    const municipality = this.mockData.municipalities.find(m => m.id === id);
    return of(municipality || null);
  }

  // Método para obtener recolecciones por usuario
  getWasteCollectionsByUser(userId: string): Observable<any[]> {
    const collections = this.mockData.wasteCollections.filter(wc => wc.userId === userId);
    return of(collections);
  }

  // Método para obtener transacciones por usuario
  getRewardTransactionsByUser(userId: string): Observable<any[]> {
    const transactions = this.mockData.rewardTransactions.filter(rt => rt.userId === userId);
    return of(transactions);
  }
}