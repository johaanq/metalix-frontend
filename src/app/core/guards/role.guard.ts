import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivate {

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> | Promise<boolean> | boolean {
    
    const expectedRoles = route.data['expectedRoles'] as string[];
    const user = this.authService.getCurrentUser();
    
    if (!user) {
      this.router.navigate(['/auth/login']);
      return false;
    }

    if (expectedRoles && expectedRoles.length > 0) {
      const hasRole = expectedRoles.includes(user.role);
      if (!hasRole) {
        this.router.navigate(['/unauthorized']);
        return false;
      }
    }

    return true;
  }
}
