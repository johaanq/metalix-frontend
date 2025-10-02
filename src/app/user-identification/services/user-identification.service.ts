import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { User } from '../../shared/models';

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

  constructor(private http: HttpClient) { }

  getUserProfile(userId: string): Observable<UserProfile> {
    return this.http.get<UserProfile>(`${environment.apiUrl}${environment.endpoints.users}/${userId}/profile`);
  }

  updateUserProfile(userId: string, profile: Partial<UserProfile>): Observable<UserProfile> {
    return this.http.patch<UserProfile>(`${environment.apiUrl}${environment.endpoints.users}/${userId}`, profile);
  }

  getUserStats(userId: string): Observable<UserStats> {
    return this.http.get<UserStats>(`${environment.apiUrl}${environment.endpoints.users}/${userId}/stats`);
  }

  getRfidCards(userId?: string): Observable<RfidCard[]> {
    const url = userId 
      ? `${environment.apiUrl}${environment.endpoints.rfidCards}?userId=${userId}`
      : `${environment.apiUrl}${environment.endpoints.rfidCards}`;
    return this.http.get<RfidCard[]>(url);
  }

  issueRfidCard(userId: string): Observable<RfidCard> {
    return this.http.post<RfidCard>(`${environment.apiUrl}${environment.endpoints.rfidCards}`, {
      userId,
      isActive: true,
      issuedAt: new Date().toISOString(),
      usageCount: 0
    });
  }

  deactivateRfidCard(cardId: string): Observable<RfidCard> {
    return this.http.patch<RfidCard>(`${environment.apiUrl}${environment.endpoints.rfidCards}/${cardId}`, {
      isActive: false
    });
  }

  getUsersByMunicipality(municipalityId: string): Observable<User[]> {
    return this.http.get<User[]>(`${environment.apiUrl}${environment.endpoints.users}?municipalityId=${municipalityId}`);
  }

  searchUsers(query: string): Observable<User[]> {
    return this.http.get<User[]>(`${environment.apiUrl}${environment.endpoints.users}?q=${query}`);
  }

  getUserActivity(userId: string, limit: number = 10): Observable<any[]> {
    return this.http.get<any[]>(`${environment.apiUrl}${environment.endpoints.users}/${userId}/activity?_limit=${limit}&_sort=timestamp&_order=desc`);
  }
}
