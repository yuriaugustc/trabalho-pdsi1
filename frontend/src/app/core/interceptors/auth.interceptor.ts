// shared/interceptors/auth-expired.interceptor.ts
import {
  HttpInterceptor, 
  HttpHandler, 
  HttpRequest, 
  HttpEvent, 
  HttpErrorResponse
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, EMPTY, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from '@shared/services/auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(
    private auth: AuthService,
    private router: Router,
  ) { }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (!this.validRoute() && !this.auth.isAuthenticated()) {
      this.handleSessionExpired();
      return EMPTY;
    }

    return next.handle(req)
      .pipe(
        catchError(err => {
          if (err instanceof HttpErrorResponse && [401, 403].includes(err.status)) {
            this.handleSessionExpired();
          }
          return throwError(() => err);
        }),
      );
  }

  private handleSessionExpired(): void {
    this.auth.forceLogout();
    // evita loop infinito
    if (!this.validRoute()) {
      this.router.navigate(['/login']);
    }
  }

  private validRoute() {
    return ['', '/login'].includes(this.router.url);
  }
}