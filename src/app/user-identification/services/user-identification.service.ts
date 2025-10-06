import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { User, UserRole } from '../../shared/models';
import { MockDataService } from '../../core/services/mock-data.service';

export interface RfidCard {
  id: string;
  cardNumber: string;
  userId: string | null;
  isActive: boolean;
  issuedAt: string | null;
  lastUsed: string | null;
  usageCount: number;
}

export interface UserProfile extends Omit<User, 'rfidCard'> {
  rfidCard?: RfidCard;
  totalCollections: number;
  totalWeight: number;
  totalPoints: number;
  joinDate: string;
  lastActivity: string;
}

export interface UserStats {
  userId: string;
  totalCollections: number;
  totalWeight: number;
  totalPoints: number;
  averageWeight: number;
  collectionsThisMonth: number;
  pointsThisMonth: number;
  rank: number;
  lastUpdated: string;
}

@Injectable({
  providedIn: 'root'
})
export class UserIdentificationService {

  constructor(
    private http: HttpClient,
    private mockDataService: MockDataService
  ) { }

  getUserProfile(userId: string): Observable<UserProfile> {
    return this.mockDataService.getUserById(userId).pipe(
      map(user => {
        if (!user) {
          // Si no existe el usuario, crear uno por defecto
          const defaultUser: User = {
            id: userId,
            email: 'default@example.com',
            firstName: 'Default',
            lastName: 'User',
            role: UserRole.CITIZEN,
            municipalityId: '1',
            phone: '+51-1-000-000-000',
            address: 'Default Address',
            city: 'Lima',
            zipCode: '15000',
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date(),
            totalPoints: 0
          };
          user = defaultUser;
        }
        
        const profile: UserProfile = {
          ...user,
          totalCollections: 15, // Del mock data
          totalWeight: 45.5,
          totalPoints: user.totalPoints || 1250,
          joinDate: user.createdAt,
          lastActivity: new Date().toISOString(),
          updatedAt: new Date() // Convertir a Date
        };
        
        return profile;
      })
    );
  }

  updateUserProfile(userId: string, profile: Partial<UserProfile>): Observable<UserProfile> {
    // Simular actualización - en mock data no se persiste
    return this.getUserProfile(userId).pipe(
      map(existingProfile => {
        return { ...existingProfile, ...profile, updatedAt: new Date() };
      })
    );
  }

  getUserStats(userId: string): Observable<UserStats> {
    return this.mockDataService.getWasteCollectionsByUser(userId).pipe(
      map(collections => {
        const totalCollections = collections.length;
        const totalWeight = collections.reduce((sum, c) => sum + (c.weight || 0), 0);
        const totalPoints = collections.reduce((sum, c) => sum + (c.points || c.pointsEarned || 0), 0);
        
        const stats: UserStats = {
          userId,
          totalCollections,
          totalWeight,
          totalPoints,
          averageWeight: totalCollections > 0 ? totalWeight / totalCollections : 0,
          collectionsThisMonth: Math.floor(totalCollections * 0.3), // Estimación
          pointsThisMonth: Math.floor(totalPoints * 0.3),
          rank: 1,
          lastUpdated: new Date().toISOString()
        };
        
        return stats;
      })
    );
  }

  getRfidCards(userId?: string): Observable<RfidCard[]> {
    return this.mockDataService.getRfidCards();
  }

  issueRfidCard(userId: string): Observable<RfidCard> {
    // Simular emisión de tarjeta - en mock data no se persiste
    const newCard: RfidCard = {
      id: Date.now().toString(),
      cardNumber: `RFID${Date.now().toString().slice(-6)}`,
      userId,
      isActive: true,
      issuedAt: new Date().toISOString(),
      lastUsed: null,
      usageCount: 0
    };
    
    return of(newCard);
  }

  deactivateRfidCard(cardId: string): Observable<RfidCard> {
    // Simular desactivación - en mock data no se persiste
    return this.mockDataService.getRfidCards().pipe(
      map(cards => {
        const card = cards.find(c => c.id === cardId);
        if (card) {
          return { ...card, isActive: false };
        }
        return null;
      })
    );
  }

  getUsersByMunicipality(municipalityId: string): Observable<User[]> {
    return this.mockDataService.getUsers().pipe(
      map(users => users.filter(u => u.municipalityId === municipalityId))
    );
  }

  searchUsers(query: string): Observable<User[]> {
    return this.mockDataService.getUsers().pipe(
      map(users => users.filter(u => 
        u.firstName.toLowerCase().includes(query.toLowerCase()) ||
        u.lastName.toLowerCase().includes(query.toLowerCase()) ||
        u.email.toLowerCase().includes(query.toLowerCase())
      ))
    );
  }

  getUserActivity(userId: string, limit: number = 10): Observable<any[]> {
    // Simular actividad del usuario
    return this.mockDataService.getWasteCollectionsByUser(userId).pipe(
      map(collections => collections.slice(0, limit))
    );
  }
}
