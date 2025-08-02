import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { catchError, delay, map, Observable, of, tap } from 'rxjs';
import { environment } from 'src/environments/environment';
import type { AuthResponse } from '@auth/interfaces/auth-response.interface';
import type { User } from '@auth/interfaces/user.interface';
import { rxResource } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';

type AuthStatus = 'checking' | 'not-authenticated' | 'authenticated';
const baseUrl = environment.baseUrl;


@Injectable({
  providedIn: 'root'
})

export class AuthService {
  
  private _authStatus = signal<AuthStatus>('checking');
  private _user = signal<User | null>(null);
  private _token = signal<string | null>(localStorage.getItem('token'));

  private http = inject(HttpClient);
  private router = inject(Router);

  authStatus = computed<AuthStatus>(() => {
    if (this._authStatus() === 'checking') return 'checking';
    if (this._user()) return 'authenticated';
    return 'not-authenticated';
  });

  // GETTERS
  user  = computed<User | null>(() => this._user());
  token = computed<string | null>(() => this._token());
  isAdmin = computed<boolean>(() => this._user()?.roles.includes('admin') ?? false);


  checkStatusResource = rxResource({
    stream: () => this.checkAuthStatus() 
  })


  login(email: string, password: string): Observable<boolean> {
    return this.http.post<AuthResponse>(`${baseUrl}/auth/login`, { 
      email, 
      password 
    })
    .pipe(
      map((resp) => this.handleAuthSuccess(resp)),
      catchError((error: any) => this.handleAuthError(error))
    );
  }

  
  register(fullName: string, email: string, password: string): Observable<boolean> {
    return this.http.post<AuthResponse>(`${baseUrl}/auth/register`, { 
      fullName, 
      email, 
      password 
    })
    .pipe(
      map((resp) => this.handleAuthSuccess(resp)),
      catchError((error: any) => this.handleAuthError(error))
    );
  }

  // cache the auth status of the user can be implemented
  checkAuthStatus(): Observable<boolean> {
    const token = localStorage.getItem('token');

    if (!token) {
      this.logout();
      return of(false)
    };

    return this.http.get<AuthResponse>(`${baseUrl}/auth/check-status`, {
      // headers: {
      //   'Authorization': `Bearer ${token}`
      // }
    })
    .pipe(
      map((resp) => this.handleAuthSuccess(resp)),
      catchError((error: any) => this.handleAuthError(error))
    );
  }


  logout(redirect: boolean = false) {
    this._authStatus.set('not-authenticated');
    this._user.set(null);
    this._token.set(null);
    localStorage.clear();

    if (redirect) this.router.navigateByUrl('/');
  }


  private handleAuthSuccess(resp: AuthResponse) {
    this._user.set(resp.user);
    this._authStatus.set('authenticated');
    this._token.set(resp.token);

    localStorage.setItem('token', resp.token);
    return true;
  }


  private handleAuthError(error: any) {
    this.logout();
    return of(false);
  }
}
