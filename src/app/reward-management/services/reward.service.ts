import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { switchMap, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { MockDataService } from '../../core/services/mock-data.service';

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
    private http: HttpClient,
    private mockDataService: MockDataService
  ) { }

  getRewards(municipalityId?: string): Observable<Reward[]> {
    return this.mockDataService.getRewards();
  }

  getRewardById(id: string): Observable<Reward> {
    return this.mockDataService.getRewards().pipe(
      map(rewards => rewards.find(r => r.id === id) || null)
    );
  }

  redeemReward(userId: string, rewardId: string): Observable<RewardTransaction> {
    // Simular canje - en mock data no se persiste
    return this.getRewardById(rewardId).pipe(
      switchMap(reward => {
        if (!reward) {
          throw new Error('Reward not found');
        }
        
        const newTransaction: RewardTransaction = {
          id: Date.now().toString(),
          userId: userId,
          rewardId: rewardId,
          transactionType: 'REDEEMED',
          points: -reward.pointsCost,
          description: `Canje de ${reward.name}`,
          timestamp: new Date().toISOString(),
          status: 'COMPLETED'
        };
        
        return of(newTransaction);
      })
    );
  }

  getUserTransactions(userId: string): Observable<RewardTransaction[]> {
    return this.mockDataService.getRewardTransactionsByUser(userId);
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
    // Simular creación - en mock data no se persiste
    const newReward = {
      id: Date.now().toString(),
      ...reward,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    } as Reward;
    
    return of(newReward);
  }

  updateReward(id: string, reward: Partial<Reward>): Observable<Reward> {
    // Simular actualización - en mock data no se persiste
    return this.getRewardById(id).pipe(
      map(existingReward => {
        if (existingReward) {
          return { ...existingReward, ...reward, updatedAt: new Date().toISOString() };
        }
        // Si no existe, crear uno nuevo
        return {
          id: id,
          name: reward.name || 'New Reward',
          description: reward.description || '',
          pointsCost: reward.pointsCost || 100,
          category: reward.category || 'SHOPPING',
          isActive: reward.isActive !== undefined ? reward.isActive : true,
          stock: reward.stock || 0,
          validUntil: reward.validUntil || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
          municipalityId: reward.municipalityId || '1',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        } as Reward;
      })
    );
  }

  deleteReward(id: string): Observable<void> {
    // Simular eliminación - en mock data no se persiste
    return of(void 0);
  }
}
