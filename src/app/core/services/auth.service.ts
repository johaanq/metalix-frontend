import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, throwError, of } from 'rxjs';
import { map, catchError, switchMap } from 'rxjs/operators';
import { User, UserRole } from '../../shared/models';
import { environment } from '../../../environments/environment';
import { MockDataService } from './mock-data.service';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: User;
  token: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: string;
  phone: string;
  address: string;
  city: string;
  zipCode: string;
  municipalityId: number;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  constructor(
    private http: HttpClient,
    private router: Router,
    private mockDataService: MockDataService
  ) {
    // Check for existing token in localStorage
    const token = localStorage.getItem('auth_token');
    if (token) {
      this.validateToken(token);
    } else {
      // If no token, try to load user from localStorage anyway
      const userStr = localStorage.getItem('current_user');
      if (userStr) {
        try {
          const user = JSON.parse(userStr);
          this.currentUserSubject.next(user);
          this.isAuthenticatedSubject.next(true);
          console.log('User loaded from localStorage in constructor:', user);
        } catch (error) {
          console.error('Error loading user from localStorage:', error);
          this.logout();
        }
      }
    }
  }

  login(email: string, password: string): Observable<LoginResponse> {
    // Usar mock data service en lugar de HTTP
    return this.mockDataService.login(email, password).pipe(
      map(response => {
        if (!response) {
          throw new Error('Invalid credentials');
        }
        
        localStorage.setItem('auth_token', response.token);
        localStorage.setItem('current_user', JSON.stringify(response.user));
        
        this.currentUserSubject.next(response.user);
        this.isAuthenticatedSubject.next(true);
        
        console.log('Login successful:', response.user);
        return response;
      }),
      catchError(error => {
        console.error('Login error:', error);
        return throwError(() => error);
      })
    );
  }

  register(registerData: RegisterRequest): Observable<LoginResponse> {
    // Simular registro - en mock data no se persiste
    const newUser: User = {
      id: Date.now().toString(),
      email: registerData.email,
      firstName: registerData.firstName,
      lastName: registerData.lastName,
      role: registerData.role as UserRole,
      municipalityId: registerData.municipalityId?.toString(),
      phone: registerData.phone,
      address: registerData.address,
      city: registerData.city,
      zipCode: registerData.zipCode,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const token = `token_${newUser.id}_${Date.now()}`;
    const loginResponse: LoginResponse = { user: newUser, token };
    
    localStorage.setItem('auth_token', token);
    localStorage.setItem('current_user', JSON.stringify(newUser));
    
    this.currentUserSubject.next(newUser);
    this.isAuthenticatedSubject.next(true);
    
    console.log('Registration successful:', newUser);
    return of(loginResponse);
  }

  logout(): void {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('current_user');
    this.currentUserSubject.next(null);
    this.isAuthenticatedSubject.next(false);
    this.router.navigate(['/auth/login']);
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  isAuthenticated(): boolean {
    return this.isAuthenticatedSubject.value;
  }

  hasRole(role: string): boolean {
    const user = this.getCurrentUser();
    return user ? user.role === role : false;
  }

  getToken(): string | null {
    return localStorage.getItem('auth_token');
  }

  private validateToken(token: string): void {
    // For now, we'll just check if the token exists and user data is in localStorage
    // In a real app, you'd validate the token with the server
    const userStr = localStorage.getItem('current_user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        this.currentUserSubject.next(user);
        this.isAuthenticatedSubject.next(true);
      } catch (error) {
        this.logout();
      }
    }
  }
}
