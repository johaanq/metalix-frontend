import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { User, UserRole } from '../../shared/models';
import { environment } from '../../../environments/environment';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: User;
  token: string;
}

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: string;
  municipalityId?: string;
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
    private router: Router
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
    // Para desarrollo, usamos los datos mock directamente
    const mockUsers = {
      'citizen@example.com': {
        user: {
          id: '1',
          email: 'citizen@example.com',
          firstName: 'Juan',
          lastName: 'Pérez',
          role: UserRole.CITIZEN,
          municipalityId: '1',
          municipality: 'Municipalidad de Miraflores',
          phone: '+51-1-999-888-777',
          address: 'Av. Larco 200, Miraflores',
          city: 'Lima',
          zipCode: '15074',
          isActive: true,
          createdAt: new Date('2024-01-15T10:30:00Z'),
          updatedAt: new Date('2024-01-15T10:30:00Z'),
          rfidCard: 'RFID001',
          totalPoints: 1250
        },
        token: 'token_citizen_123'
      },
      'admin@municipalidad.com': {
        user: {
          id: '2',
          email: 'admin@municipalidad.com',
          firstName: 'María',
          lastName: 'González',
          role: UserRole.MUNICIPALITY_ADMIN,
          municipalityId: '1',
          municipality: 'Municipalidad de Miraflores',
          phone: '+51-1-617-7272',
          address: 'Av. Larco 400, Miraflores',
          city: 'Lima',
          zipCode: '15074',
          isActive: true,
          createdAt: new Date('2024-01-10T09:00:00Z'),
          updatedAt: new Date('2024-01-10T09:00:00Z')
        },
        token: 'token_admin_123'
      },
      'system@metalix.com': {
        user: {
          id: '3',
          email: 'system@metalix.com',
          firstName: 'Carlos',
          lastName: 'Rodríguez',
          role: UserRole.SYSTEM_ADMIN,
          municipalityId: undefined,
          phone: '+51-1-513-9000',
          address: 'Av. República 100, Lima',
          city: 'Lima',
          zipCode: '15073',
          isActive: true,
          createdAt: new Date('2024-01-01T08:00:00Z'),
          updatedAt: new Date('2024-01-01T08:00:00Z')
        },
        token: 'token_system_123'
      }
    };

    return new Observable(observer => {
      setTimeout(() => {
        const userData = mockUsers[email as keyof typeof mockUsers];
        
        if (userData && (password === 'password123' || password === 'admin123')) {
          localStorage.setItem('auth_token', userData.token);
          localStorage.setItem('current_user', JSON.stringify(userData.user));
          
          this.currentUserSubject.next(userData.user);
          this.isAuthenticatedSubject.next(true);
          
          observer.next(userData);
          observer.complete();
        } else {
          observer.error({ error: 'Invalid credentials' });
        }
      }, 1000);
    });
  }

  register(registerData: RegisterRequest): Observable<User> {
    return this.http.post<User>(`${environment.apiUrl}${environment.endpoints.auth}/register`, registerData)
      .pipe(
        catchError(error => {
          console.error('Registration error:', error);
          return throwError(() => error);
        })
      );
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
