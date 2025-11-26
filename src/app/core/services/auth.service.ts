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

export interface AuthenticationResponse {
  token: string;
  userId: number;
  email: string;
  role: string;
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
  role?: string;
  phone?: string;
  address?: string;
  city?: string;
  zipCode?: string;
  municipalityId?: number;
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
    const loginRequest: LoginRequest = { email, password };
    
    return this.http.post<AuthenticationResponse>(
      `${environment.apiUrl}${environment.endpoints.auth}/login`,
      loginRequest
    ).pipe(
      switchMap(authResponse => {
        // Guardar el token INMEDIATAMENTE para que el interceptor lo use en la siguiente petición
        localStorage.setItem('auth_token', authResponse.token);
        
        // Obtener el usuario completo usando el userId
        return this.http.get<any>(`${environment.apiUrl}${environment.endpoints.users}/${authResponse.userId}`).pipe(
          map(userResponse => {
            // Mapear la respuesta del backend al modelo User del frontend
            const user: User = {
              id: userResponse.id?.toString() || '',
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
            
            const loginResponse: LoginResponse = {
              user: user,
              token: authResponse.token
            };
            
            // Guardar el usuario completo en localStorage
            localStorage.setItem('current_user', JSON.stringify(user));
            
            this.currentUserSubject.next(user);
            this.isAuthenticatedSubject.next(true);
            
            console.log('Login successful:', user);
            return loginResponse;
          }),
          catchError(error => {
            // Si falla la obtención del usuario, limpiar el token
            localStorage.removeItem('auth_token');
            console.error('Error getting user after login:', error);
            return throwError(() => error);
          })
        );
      }),
      catchError(error => {
        console.error('Login error:', error);
        return throwError(() => error);
      })
    );
  }

  register(registerData: RegisterRequest): Observable<LoginResponse> {
    return this.http.post<AuthenticationResponse>(
      `${environment.apiUrl}${environment.endpoints.auth}/register`,
      registerData
    ).pipe(
      map(authResponse => {
        // Construir el usuario directamente desde los datos del registro
        // Esto evita el problema del 403 al intentar obtener el usuario
        const user: User = {
          id: authResponse.userId?.toString() || '',
          email: authResponse.email || registerData.email,
          firstName: registerData.firstName || '',
          lastName: registerData.lastName || '',
          role: (authResponse.role as UserRole) || UserRole.CITIZEN,
          municipalityId: registerData.municipalityId?.toString(),
          phone: registerData.phone,
          address: registerData.address,
          city: registerData.city,
          zipCode: registerData.zipCode,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
          rfidCard: undefined,
          totalPoints: 0
        };
        
        const loginResponse: LoginResponse = {
          user: user,
          token: authResponse.token
        };
        
        // Guardar token y usuario en localStorage
        localStorage.setItem('auth_token', authResponse.token);
        localStorage.setItem('current_user', JSON.stringify(user));
        
        // Actualizar observables
        this.currentUserSubject.next(user);
        this.isAuthenticatedSubject.next(true);
        
        console.log('Registration successful:', user);
        return loginResponse;
      }),
      catchError(error => {
        console.error('Registration error:', error);
        // Limpiar el token si el registro falla
        localStorage.removeItem('auth_token');
        localStorage.removeItem('current_user');
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
