import { Injectable, inject } from '@angular/core';
import {
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
  HttpErrorResponse,
  HTTP_INTERCEPTORS,
} from '@angular/common/http';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { catchError, filter, switchMap, take } from 'rxjs/operators';
import { Router } from '@angular/router';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private isRefreshing = false;
  private refreshTokenSubject = new BehaviorSubject<string | null>(null);
  private router = inject(Router);

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = sessionStorage.getItem('token');
    const authedReq = token
      ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
      : req;

    return next.handle(authedReq).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          return this.handle401(authedReq, next);
        }
        return throwError(() => error);
      })
    );
  }

  private handle401(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const refreshExpiry = sessionStorage.getItem('refreshExpiryDate');
    const refreshToken = sessionStorage.getItem('refreshTokenDate');
    const token = sessionStorage.getItem('token');

    if (!refreshToken || !refreshExpiry || new Date(refreshExpiry) <= new Date()) {
      this.logout();
      return throwError(() => new Error('Refresh token expired'));
    }

    if (this.isRefreshing) {
      return this.refreshTokenSubject.pipe(
        filter((t) => t !== null),
        take(1),
        switchMap((newToken) => {
          const retryReq = req.clone({ setHeaders: { Authorization: `Bearer ${newToken}` } });
          return next.handle(retryReq);
        })
      );
    }

    this.isRefreshing = true;
    this.refreshTokenSubject.next(null);

    return this.callRefreshEndpoint(token!, refreshToken!).pipe(
      switchMap((resp: any) => {
        const newToken = resp?.data?.token || resp?.token;
        const newExpiry = resp?.data?.expiryDate || resp?.expiryDate;
        const newRefresh = resp?.data?.refreshTokenDate || resp?.refreshTokenDate;
        const newRefreshExpiry = resp?.data?.refreshExpiryDate || resp?.refreshExpiryDate;

        if (!newToken) {
          this.logout();
          return throwError(() => new Error('Failed to refresh token'));
        }

        sessionStorage.setItem('token', newToken);
        if (newExpiry) sessionStorage.setItem('expiryDate', new Date(newExpiry).toString());
        if (newRefresh) sessionStorage.setItem('refreshTokenDate', newRefresh);
        if (newRefreshExpiry) sessionStorage.setItem('refreshExpiryDate', new Date(newRefreshExpiry).toString());

        this.refreshTokenSubject.next(newToken);
        const retryReq = req.clone({ setHeaders: { Authorization: `Bearer ${newToken}` } });
        this.isRefreshing = false;
        return next.handle(retryReq);
      }),
      catchError(err => {
        this.isRefreshing = false;
        this.logout();
        return throwError(() => err);
      })
    );
  }

  private callRefreshEndpoint(token: string, refreshToken: string): Observable<any> {
    // Use fetch to avoid circular HttpClient -> interceptor recursion
    const baseUrl = 'http://173.208.167.153:4443/';
    return new Observable((observer) => {
      fetch(baseUrl + 'auth/Auth/RefreshToken', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token, refreshToken }),
      })
        .then(async (res) => {
          if (!res.ok) throw new Error('Refresh failed');
          const json = await res.json();
          observer.next(json);
          observer.complete();
        })
        .catch((e) => observer.error(e));
    });
  }

  private logout() {
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('expiryDate');
    sessionStorage.removeItem('refreshTokenDate');
    sessionStorage.removeItem('refreshExpiryDate');
    localStorage.removeItem('userId');
    this.router.navigate(['/authentication/login']);
  }
}

export const AUTH_INTERCEPTOR_PROVIDER = {
  provide: HTTP_INTERCEPTORS,
  useClass: AuthInterceptor,
  multi: true,
};


