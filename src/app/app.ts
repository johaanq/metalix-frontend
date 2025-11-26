import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { LoadingService } from './core/services/loading.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    MatProgressSpinnerModule
  ],
  templateUrl: './app.html',
  styleUrl: './app.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppComponent implements OnInit {
  title = 'Metalix - Smart Recycling Platform';
  isLoading$: Observable<boolean>;

  constructor(private loadingService: LoadingService) {
    this.isLoading$ = this.loadingService.loading$;
  }

  ngOnInit(): void {
    // App initialization logic
  }
}
