import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Reward {
  id: string;
  name: string;
  description: string;
  pointsCost: number;
  category: 'SHOPPING' | 'ENTERTAINMENT' | 'DINING' | 'SERVICES' | 'DISCOUNTS';
  isActive: boolean;
  stock: number;
  validUntil: string;
  municipalityId: string;
  createdAt: string;
  updatedAt: string;
}

export interface RewardTransaction {
  id: string;
  userId: string;
  rewardId: string | null;
  transactionType: 'EARNED' | 'REDEEMED' | 'EXPIRED' | 'REFUNDED';
  points: number;
  description: string;
  timestamp: string;
  status: 'PENDING' | 'COMPLETED' | 'CANCELLED';
}

export interface UserPoints {
  userId: string;
  totalPoints: number;
  availablePoints: number;
  redeemedPoints: number;
  lastUpdated: string;
}

@Injectable({
  providedIn: 'root'
})
export class RewardService {

  constructor(private http: HttpClient) { }

  getRewards(municipalityId?: string): Observable<Reward[]> {
    const url = municipalityId 
      ? `${environment.apiUrl}${environment.endpoints.rewards}?municipalityId=${municipalityId}&isActive=true`
      : `${environment.apiUrl}${environment.endpoints.rewards}?isActive=true`;
    return this.http.get<Reward[]>(url);
  }

  getRewardById(id: string): Observable<Reward> {
    return this.http.get<Reward>(`${environment.apiUrl}${environment.endpoints.rewards}/${id}`);
  }

  redeemReward(userId: string, rewardId: string): Observable<RewardTransaction> {
    return this.http.post<RewardTransaction>(`${environment.apiUrl}${environment.endpoints.rewardTransactions}`, {
      userId,
      rewardId,
      transactionType: 'REDEEMED',
      points: 0, // Will be calculated by backend
      description: 'Reward redemption',
      timestamp: new Date().toISOString(),
      status: 'PENDING'
    });
  }

  getUserTransactions(userId: string): Observable<RewardTransaction[]> {
    return this.http.get<RewardTransaction[]>(`${environment.apiUrl}${environment.endpoints.rewardTransactions}?userId=${userId}`);
  }

  getUserPoints(userId: string): Observable<UserPoints> {
    return this.http.get<UserPoints>(`${environment.apiUrl}${environment.endpoints.users}/${userId}/points`);
  }

  createReward(reward: Partial<Reward>): Observable<Reward> {
    return this.http.post<Reward>(`${environment.apiUrl}${environment.endpoints.rewards}`, reward);
  }

  updateReward(id: string, reward: Partial<Reward>): Observable<Reward> {
    return this.http.patch<Reward>(`${environment.apiUrl}${environment.endpoints.rewards}/${id}`, reward);
  }

  deleteReward(id: string): Observable<void> {
    return this.http.delete<void>(`${environment.apiUrl}${environment.endpoints.rewards}/${id}`);
  }
}
