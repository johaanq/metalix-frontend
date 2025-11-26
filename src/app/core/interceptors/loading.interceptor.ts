import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';
import { finalize, delay } from 'rxjs/operators';
import { LoadingService } from '../services/loading.service';

@Injectable()
export class LoadingInterceptor implements HttpInterceptor {
  private loadingTimeout: any;

  constructor(private loadingService: LoadingService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Exclude certain endpoints from global loading (they handle their own loading states)
    const excludedPaths = [
      '/municipalities',
      '/users',
      '/waste-collections',
      '/reward-transactions',
    ];
    
    const shouldShowLoading = !excludedPaths.some(path => req.url.includes(path));
    
    if (shouldShowLoading) {
      // Only show loading for requests that take longer than 150ms
      this.loadingTimeout = setTimeout(() => {
        this.loadingService.show();
      }, 150);
    }
    
    return next.handle(req).pipe(
      finalize(() => {
        if (this.loadingTimeout) {
          clearTimeout(this.loadingTimeout);
          this.loadingTimeout = null;
        }
        if (shouldShowLoading) {
          this.loadingService.hide();
        }
      })
    );
  }
}
