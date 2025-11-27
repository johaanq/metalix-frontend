import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { switchMap, map } from 'rxjs/operators';
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

  constructor(
    private http: HttpClient
  ) { }

  getRewards(municipalityId?: string): Observable<Reward[]> {
    const url = municipalityId 
      ? `${environment.apiUrl}${environment.endpoints.rewards}/municipality/${municipalityId}`
      : `${environment.apiUrl}${environment.endpoints.rewards}/active`;
    return this.http.get<any[]>(url).pipe(
      map(rewards => rewards.map(r => this.mapRewardResponse(r)))
    );
  }

  getRewardById(id: string): Observable<Reward> {
    return this.http.get<any>(`${environment.apiUrl}${environment.endpoints.rewards}/${id}`).pipe(
      map(r => this.mapRewardResponse(r))
    );
  }

  redeemReward(userId: string, rewardId: string): Observable<RewardTransaction> {
    return this.http.post<any>(
      `${environment.apiUrl}${environment.endpoints.rewardTransactions}/redeem`,
      { userId: parseInt(userId), rewardId: parseInt(rewardId) }
    ).pipe(
      map(transaction => this.mapRewardTransactionResponse(transaction))
    );
        }
        
  getUserTransactions(userId: string): Observable<RewardTransaction[]> {
    return this.http.get<any>(`${environment.apiUrl}${environment.endpoints.rewardTransactions}/user/${userId}`).pipe(
      map((response: any) => {
        // El backend puede devolver una página o una lista
        const transactions = response.content || response || [];
        return transactions.map((t: any) => this.mapRewardTransactionResponse(t));
      })
    );
  }

  private mapRewardResponse(r: any): Reward {
    return {
      id: r.id?.toString() || '',
      name: r.name || '',
      description: r.description || '',
      pointsCost: r.pointsCost || 0,
      category: this.mapCategoryFromBackend(r.category) as any, // Map backend category to frontend
      isActive: r.isActive ?? true,
      stock: r.availability || r.stock || 0, // Backend uses 'availability', frontend uses 'stock'
      validUntil: r.expirationDate ? new Date(r.expirationDate).toISOString() : (r.validUntil || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()), // Backend uses 'expirationDate', frontend uses 'validUntil'
      municipalityId: r.municipalityId?.toString() || '',
      createdAt: r.createdAt || new Date().toISOString(),
      updatedAt: r.updatedAt || new Date().toISOString()
    };
  }

  private mapRewardTransactionResponse(t: any): RewardTransaction {
    return {
      id: t.id?.toString() || '',
      userId: t.userId?.toString() || '',
      rewardId: t.rewardId?.toString() || null,
      transactionType: t.transactionType || 'EARNED',
      points: t.points || 0,
      description: t.description || '',
      timestamp: t.timestamp || t.createdAt || new Date().toISOString(),
      status: t.status || 'COMPLETED'
    };
  }

  getUserPoints(userId: string): Observable<UserPoints> {
    return this.http.get<number>(`${environment.apiUrl}${environment.endpoints.users}/${userId}/points`).pipe(
      switchMap(totalPoints => {
    return this.getUserTransactions(userId).pipe(
          map(transactions => {
        const redeemedPoints = transactions
          .filter(t => t.transactionType === 'REDEEMED' && t.status === 'COMPLETED')
          .reduce((sum, t) => sum + Math.abs(t.points), 0);
        
        const userPoints: UserPoints = {
          userId: userId,
              totalPoints: totalPoints || 0,
              availablePoints: (totalPoints || 0) - redeemedPoints,
          redeemedPoints: redeemedPoints,
          lastUpdated: new Date().toISOString()
        };
        
            return userPoints;
          })
        );
      })
    );
  }

  createReward(reward: Partial<Reward>): Observable<Reward> {
    // Map frontend fields to backend DTO
    const request: any = {
      name: reward.name,
      description: reward.description || '',
      pointsCost: reward.pointsCost,
      category: this.mapCategoryToBackend(reward.category), // Map frontend category to backend enum
      availability: Math.max(1, reward.stock || 1), // Backend requires @Positive, so minimum is 1
      municipalityId: reward.municipalityId ? parseInt(reward.municipalityId) : null
    };
    
    // Convert validUntil (ISO string) to expirationDate (LocalDate format)
    if (reward.validUntil) {
      request.expirationDate = reward.validUntil.split('T')[0]; // Extract date part (YYYY-MM-DD)
    }
    
    // Validate required fields
    if (!request.name || !request.pointsCost || !request.municipalityId) {
      throw new Error('Missing required fields: name, pointsCost, or municipalityId');
    }
    
    return this.http.post<any>(`${environment.apiUrl}${environment.endpoints.rewards}`, request).pipe(
      map(r => this.mapRewardResponse(r))
    );
  }

  updateReward(id: string, reward: Partial<Reward>): Observable<Reward> {
    // Map frontend fields to backend Reward model
    const updateData: any = {
      name: reward.name,
          description: reward.description || '',
      pointsCost: reward.pointsCost,
      category: this.mapCategoryToBackend(reward.category), // Map frontend category to backend enum
      isActive: reward.isActive ?? true,
      availability: Math.max(0, reward.stock || 0), // For update, 0 is allowed
      municipalityId: reward.municipalityId ? parseInt(reward.municipalityId) : null
    };
    
    // Convert validUntil (ISO string) to expirationDate (LocalDate format)
    if (reward.validUntil) {
      updateData.expirationDate = reward.validUntil.split('T')[0]; // Extract date part (YYYY-MM-DD)
    }
    
    return this.http.put<any>(`${environment.apiUrl}${environment.endpoints.rewards}/${id}`, updateData).pipe(
      map(r => this.mapRewardResponse(r))
    );
  }

  // Map frontend category to backend enum
  private mapCategoryToBackend(category?: string): string | null {
    if (!category) return null;
    
    const categoryMap: { [key: string]: string } = {
      'SHOPPING': 'PRODUCT',
      'ENTERTAINMENT': 'EXPERIENCE',
      'DINING': 'SERVICE',
      'SERVICES': 'SERVICE',
      'DISCOUNTS': 'DISCOUNT'
    };
    
    return categoryMap[category] || category.toUpperCase();
  }

  // Map backend category to frontend
  private mapCategoryFromBackend(category?: string): string {
    if (!category) return 'SHOPPING';
    
    const categoryMap: { [key: string]: string } = {
      'PRODUCT': 'SHOPPING',
      'EXPERIENCE': 'ENTERTAINMENT',
      'SERVICE': 'SERVICES',
      'DISCOUNT': 'DISCOUNTS',
      'VOUCHER': 'SHOPPING',
      'CHARITY': 'SERVICES',
      'OTHER': 'SHOPPING'
    };
    
    return categoryMap[category] || 'SHOPPING';
  }

  deleteReward(id: string): Observable<void> {
    return this.http.delete<void>(`${environment.apiUrl}${environment.endpoints.rewards}/${id}`);
  }
}
