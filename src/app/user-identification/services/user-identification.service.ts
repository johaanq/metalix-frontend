import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { User, UserRole } from '../../shared/models';

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
    private http: HttpClient
  ) { }

  getUserProfile(userId: string): Observable<UserProfile> {
    return this.http.get<any>(`${environment.apiUrl}${environment.endpoints.users}/${userId}/profile`).pipe(
      switchMap(profileResponse => {
        const user: User = {
          id: profileResponse.id?.toString() || userId,
          email: profileResponse.email || '',
          firstName: profileResponse.firstName || '',
          lastName: profileResponse.lastName || '',
          role: profileResponse.role as UserRole,
          municipalityId: profileResponse.municipalityId?.toString(),
          phone: profileResponse.phone,
          address: profileResponse.address,
          city: profileResponse.city,
          zipCode: profileResponse.zipCode,
          isActive: profileResponse.isActive ?? true,
          createdAt: profileResponse.createdAt ? new Date(profileResponse.createdAt) : new Date(),
          updatedAt: profileResponse.updatedAt ? new Date(profileResponse.updatedAt) : new Date(),
          rfidCard: profileResponse.rfidCard,
          totalPoints: profileResponse.totalPoints
        };
        
        const profile: UserProfile = {
          ...user,
          rfidCard: undefined, // Se obtendrá por separado si es necesario
          totalCollections: profileResponse.totalCollections || 0,
          totalWeight: profileResponse.totalWeight || 0,
          totalPoints: profileResponse.totalPoints || 0,
          joinDate: user.createdAt instanceof Date ? user.createdAt.toISOString() : (typeof user.createdAt === 'string' ? user.createdAt : new Date().toISOString()),
          lastActivity: profileResponse.lastActivity || new Date().toISOString(),
          updatedAt: user.updatedAt
        };
        
        // Si hay un rfidCard en la respuesta, obtenerlo
        if (profileResponse.rfidCard) {
          return this.getRfidCards(user.id).pipe(
            map(cards => {
              profile.rfidCard = cards.find(c => c.userId === user.id) || undefined;
              return profile;
            })
          );
        }
        
        return of(profile);
      })
    );
  }

  updateUserProfile(userId: string, profile: Partial<UserProfile>): Observable<UserProfile> {
    return this.http.put<any>(
      `${environment.apiUrl}${environment.endpoints.users}/${userId}`,
      profile
    ).pipe(
      switchMap(userResponse => {
        const user: User = {
          id: userResponse.id?.toString() || userId,
          email: userResponse.email || '',
          firstName: userResponse.firstName || '',
          lastName: userResponse.lastName || '',
          role: userResponse.role as UserRole,
          municipalityId: userResponse.municipalityId?.toString(),
          phone: userResponse.phone,
          address: userResponse.address,
          city: userResponse.city,
          zipCode: userResponse.zipCode,
          isActive: userResponse.isActive ?? true,
          createdAt: userResponse.createdAt ? new Date(userResponse.createdAt) : new Date(),
          updatedAt: userResponse.updatedAt ? new Date(userResponse.updatedAt) : new Date(),
          rfidCard: userResponse.rfidCard,
          totalPoints: userResponse.totalPoints
        };
        
        const updatedProfile: UserProfile = {
          ...user,
          rfidCard: undefined,
          totalCollections: profile.totalCollections || 0,
          totalWeight: profile.totalWeight || 0,
          totalPoints: user.totalPoints || 0,
          joinDate: user.createdAt instanceof Date ? user.createdAt.toISOString() : (typeof user.createdAt === 'string' ? user.createdAt : new Date().toISOString()),
          lastActivity: new Date().toISOString(),
          updatedAt: user.updatedAt
        };
        
        // Si hay un rfidCard, obtenerlo
        if (userResponse.rfidCard) {
          return this.getRfidCards(user.id).pipe(
            map(cards => {
              updatedProfile.rfidCard = cards.find(c => c.userId === user.id) || undefined;
              return updatedProfile;
            })
          );
        }
        
        return of(updatedProfile);
      })
    );
  }

  getUserStats(userId: string): Observable<UserStats> {
    return this.http.get<any>(`${environment.apiUrl}${environment.endpoints.users}/${userId}/stats`).pipe(
      map(stats => ({
        userId: stats.userId?.toString() || userId,
        totalCollections: stats.totalCollections || 0,
        totalWeight: stats.totalWeight || 0,
        totalPoints: stats.totalPoints || 0,
        averageWeight: stats.averageWeight || 0,
        collectionsThisMonth: stats.collectionsThisMonth || 0,
        pointsThisMonth: stats.pointsThisMonth || 0,
        rank: stats.rank || 1,
        lastUpdated: stats.lastUpdated || new Date().toISOString()
      }))
    );
  }

  getRfidCards(userId?: string): Observable<RfidCard[]> {
    const url = userId 
      ? `${environment.apiUrl}${environment.endpoints.rfidCards}/user/${userId}`
      : `${environment.apiUrl}${environment.endpoints.rfidCards}`;
    return this.http.get<any>(url).pipe(
      map((response: any) => {
        // El backend puede devolver una tarjeta única o una lista
        const cards = Array.isArray(response) ? response : (response ? [response] : []);
        return cards.map((c: any) => this.mapRfidCardResponse(c));
      })
    );
  }

  issueRfidCard(userId: string): Observable<RfidCard> {
    return this.http.post<any>(
      `${environment.apiUrl}${environment.endpoints.rfidCards}/assign`,
      { userId: parseInt(userId), cardNumber: `RFID${Date.now().toString().slice(-6)}` }
    ).pipe(
      map(c => this.mapRfidCardResponse(c))
    );
  }

  deactivateRfidCard(cardId: string): Observable<RfidCard> {
    return this.http.patch<any>(
      `${environment.apiUrl}${environment.endpoints.rfidCards}/${cardId}/block`,
      {}
    ).pipe(
      map(c => this.mapRfidCardResponse(c))
    );
  }

  getUsersByMunicipality(municipalityId: string): Observable<User[]> {
    return this.http.get<any[]>(`${environment.apiUrl}${environment.endpoints.users}/municipality/${municipalityId}`).pipe(
      map(users => users.map(u => this.mapUserResponse(u)))
    );
  }

  searchUsers(query: string): Observable<User[]> {
    // El backend no tiene endpoint de búsqueda, así que obtenemos todos y filtramos
    return this.http.get<any>(`${environment.apiUrl}${environment.endpoints.users}?page=0&size=100`).pipe(
      map((response: any) => {
        const users = response.content || response || [];
        return users
          .filter((u: any) => 
            (u.firstName?.toLowerCase().includes(query.toLowerCase()) ||
             u.lastName?.toLowerCase().includes(query.toLowerCase()) ||
             u.email?.toLowerCase().includes(query.toLowerCase()))
          )
          .map((u: any) => this.mapUserResponse(u));
      })
    );
  }

  getUserActivity(userId: string, limit: number = 10): Observable<any[]> {
    return this.http.get<any[]>(`${environment.apiUrl}${environment.endpoints.users}/${userId}/activity?limit=${limit}`).pipe(
      map(activities => activities || [])
    );
  }

  private mapUserResponse(u: any): User {
    return {
      id: u.id?.toString() || '',
      email: u.email || '',
      firstName: u.firstName || '',
      lastName: u.lastName || '',
      role: u.role as UserRole,
      municipalityId: u.municipalityId?.toString(),
      phone: u.phone,
      address: u.address,
      city: u.city,
      zipCode: u.zipCode,
      isActive: u.isActive ?? true,
      createdAt: u.createdAt ? new Date(u.createdAt) : new Date(),
      updatedAt: u.updatedAt ? new Date(u.updatedAt) : new Date(),
      rfidCard: u.rfidCard,
      totalPoints: u.totalPoints
    };
  }

  private mapRfidCardResponse(c: any): RfidCard {
    return {
      id: c.id?.toString() || '',
      cardNumber: c.cardNumber || '',
      userId: c.userId?.toString() || null,
      isActive: c.isActive ?? true,
      issuedAt: c.issuedAt || c.createdAt || null,
      lastUsed: c.lastUsed || null,
      usageCount: c.usageCount || 0
    };
  }
}
