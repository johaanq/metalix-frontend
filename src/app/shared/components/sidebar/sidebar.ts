import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { AuthService } from '../../../core/services/auth.service';
import { User, UserRole } from '../../models';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatIconModule,
    MatButtonModule
  ],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css'
})
export class SidebarComponent {
  @Input() currentUser: User | null = null;
  @Input() isCollapsed: boolean = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  logout(): void {
    this.authService.logout();
  }

  navigateToProfile(): void {
    this.router.navigate(['/user-identification/profile']);
  }

  getUserDisplayName(): string {
    if (!this.currentUser) return 'User';
    return `${this.currentUser.firstName} ${this.currentUser.lastName}`;
  }

  getUserRoleDisplay(): string {
    if (!this.currentUser) return '';
    
    switch (this.currentUser.role) {
      case UserRole.CITIZEN:
        return 'Citizen';
      case UserRole.MUNICIPALITY_ADMIN:
        return 'Municipality Admin';
      case UserRole.SYSTEM_ADMIN:
        return 'System Admin';
      default:
        return this.currentUser.role;
    }
  }

  isAdmin(): boolean {
    return this.currentUser?.role === UserRole.MUNICIPALITY_ADMIN || 
           this.currentUser?.role === UserRole.SYSTEM_ADMIN;
  }

  isCitizen(): boolean {
    return this.currentUser?.role === UserRole.CITIZEN;
  }
}
