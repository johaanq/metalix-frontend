import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { map, catchError, switchMap } from 'rxjs/operators';
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
    // Para json-server, vamos a simular el login buscando el usuario directamente
    return this.http.get<User[]>(`${environment.apiUrl}${environment.endpoints.users}?email=${email}`)
      .pipe(
        map(users => {
          if (users.length === 0) {
            throw new Error('User not found');
          }
          
          const user = users[0];
          
          // Simular validación de contraseña
          if (password !== 'password123' && password !== 'admin123') {
            throw new Error('Invalid credentials');
          }
          
          const token = `token_${user.id}_${Date.now()}`;
          const loginResponse: LoginResponse = { user, token };
          
          localStorage.setItem('auth_token', token);
          localStorage.setItem('current_user', JSON.stringify(user));
          
          this.currentUserSubject.next(user);
          this.isAuthenticatedSubject.next(true);
          
          console.log('Login successful:', user);
          return loginResponse;
        }),
        catchError(error => {
          console.error('Login error:', error);
          return throwError(() => error);
        })
      );
  }

  register(registerData: RegisterRequest): Observable<LoginResponse> {
    return this.http.post<any>(`${environment.apiUrl}${environment.endpoints.auth}/register`, registerData)
      .pipe(
        map(response => {
          // Backend devuelve: { token, userId, email, role }
          const token = response.token;
          
          localStorage.setItem('auth_token', token);
          
          // Obtener datos completos del usuario
          return this.http.get<User>(`${environment.apiUrl}${environment.endpoints.users}/${response.userId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
          }).pipe(
            map(user => {
              localStorage.setItem('current_user', JSON.stringify(user));
              this.currentUserSubject.next(user);
              this.isAuthenticatedSubject.next(true);
              
              return { user, token };
            }),
            catchError(error => {
              // Si falla obtener el usuario, usar los datos básicos de la respuesta
              const basicUser: User = {
                id: response.userId.toString(),
                email: response.email,
                firstName: registerData.firstName || '',
                lastName: registerData.lastName || '',
                role: response.role as UserRole,
                isActive: true,
                createdAt: new Date(),
                updatedAt: new Date()
              };
              
              localStorage.setItem('current_user', JSON.stringify(basicUser));
              this.currentUserSubject.next(basicUser);
              this.isAuthenticatedSubject.next(true);
              
              return [{ user: basicUser, token }];
            })
          );
        }),
        switchMap(innerObservable => innerObservable),
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
