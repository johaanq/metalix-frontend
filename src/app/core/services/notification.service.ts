import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

export interface NotificationConfig {
  message: string;
  action?: string;
  duration?: number;
  horizontalPosition?: 'start' | 'center' | 'end' | 'left' | 'right';
  verticalPosition?: 'top' | 'bottom';
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  constructor(private snackBar: MatSnackBar) { }

  showSuccess(message: string, action?: string, duration: number = 3000): void {
    this.snackBar.open(message, action, {
      duration,
      panelClass: ['success-snackbar'],
      horizontalPosition: 'right',
      verticalPosition: 'top'
    });
  }

  showError(message: string, action?: string, duration: number = 5000): void {
    this.snackBar.open(message, action, {
      duration,
      panelClass: ['error-snackbar'],
      horizontalPosition: 'right',
      verticalPosition: 'top'
    });
  }

  showWarning(message: string, action?: string, duration: number = 4000): void {
    this.snackBar.open(message, action, {
      duration,
      panelClass: ['warning-snackbar'],
      horizontalPosition: 'right',
      verticalPosition: 'top'
    });
  }

  showInfo(message: string, action?: string, duration: number = 3000): void {
    this.snackBar.open(message, action, {
      duration,
      panelClass: ['info-snackbar'],
      horizontalPosition: 'right',
      verticalPosition: 'top'
    });
  }

  showCustom(config: NotificationConfig): void {
    this.snackBar.open(
      config.message,
      config.action,
      {
        duration: config.duration || 3000,
        horizontalPosition: config.horizontalPosition || 'right',
        verticalPosition: config.verticalPosition || 'top'
      }
    );
  }
}
