import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';
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
    // First get the reward to get its points cost
    return this.getRewardById(rewardId).pipe(
      switchMap(reward => {
        const newTransaction: RewardTransaction = {
          id: Date.now().toString(), // Simple ID generation
          userId: userId,
          rewardId: rewardId,
          transactionType: 'REDEEMED',
          points: -reward.pointsCost,
          description: `Canje de ${reward.name}`,
          timestamp: new Date().toISOString(),
          status: 'COMPLETED'
        };
        
        return this.http.post<RewardTransaction>(`${environment.apiUrl}${environment.endpoints.rewardTransactions}`, newTransaction);
      })
    );
  }

  getUserTransactions(userId: string): Observable<RewardTransaction[]> {
    return this.http.get<RewardTransaction[]>(`${environment.apiUrl}${environment.endpoints.rewardTransactions}?userId=${userId}`);
  }

  getUserPoints(userId: string): Observable<UserPoints> {
    return this.getUserTransactions(userId).pipe(
      switchMap(transactions => {
        const totalPoints = transactions
          .filter(t => t.transactionType === 'EARNED')
          .reduce((sum, t) => sum + t.points, 0);
        
        const redeemedPoints = transactions
          .filter(t => t.transactionType === 'REDEEMED' && t.status === 'COMPLETED')
          .reduce((sum, t) => sum + Math.abs(t.points), 0);
        
        const userPoints: UserPoints = {
          userId: userId,
          totalPoints: totalPoints,
          availablePoints: totalPoints - redeemedPoints,
          redeemedPoints: redeemedPoints,
          lastUpdated: new Date().toISOString()
        };
        
        return new Observable<UserPoints>(observer => {
          observer.next(userPoints);
          observer.complete();
        });
      })
    );
  }

  createReward(reward: Partial<Reward>): Observable<Reward> {
    return this.http.post<Reward>(`${environment.apiUrl}${environment.endpoints.rewards}`, reward);
  }

  updateReward(id: string, reward: Partial<Reward>): Observable<Reward> {
    return this.http.put<Reward>(`${environment.apiUrl}${environment.endpoints.rewards}/${id}`, reward);
  }

  deleteReward(id: string): Observable<void> {
    return this.http.delete<void>(`${environment.apiUrl}${environment.endpoints.rewards}/${id}`);
  }
}
