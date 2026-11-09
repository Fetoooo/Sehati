import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap, catchError, throwError, of } from 'rxjs';
import { StorageService } from './storage.service';
import {
  LoginRequestDto,
  RegisterRequestDto,
  TokenResponseDto,
  UserDto,
  UserRole
} from '../models/auth.models';

const ACCESS_TOKEN_KEY = 'sehati_access_token';
const REFRESH_TOKEN_KEY = 'sehati_refresh_token';
const USER_KEY = 'sehati_user';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private storage = inject(StorageService);
  private router = inject(Router);

  // Base API endpoint URL (supports relative path in production or localhost during dev)
  private readonly baseUrl = '/api/v1/auth';

  // Signals for reactive state management
  private currentUserSignal = signal<UserDto | null>(this.loadStoredUser());
  private tokenSignal = signal<string | null>(this.storage.getItem(ACCESS_TOKEN_KEY));

  public readonly currentUser = this.currentUserSignal.asReadonly();
  public readonly isAuthenticated = computed(() => !!this.tokenSignal() && !!this.currentUserSignal());
  public readonly userRole = computed(() => this.currentUserSignal()?.roleName ?? null);

  private loadStoredUser(): UserDto | null {
    const raw = this.storage.getItem(USER_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as UserDto;
    } catch {
      return null;
    }
  }

  public getToken(): string | null {
    return this.tokenSignal() || this.storage.getItem(ACCESS_TOKEN_KEY);
  }

  public getRefreshToken(): string | null {
    return this.storage.getItem(REFRESH_TOKEN_KEY);
  }

  public login(dto: LoginRequestDto): Observable<TokenResponseDto> {
    const emailOrPhoneVal = (dto.emailOrPhone || dto.identifier || '').trim();
    const payload = {
      emailOrPhone: emailOrPhoneVal,
      identifier: emailOrPhoneVal,
      password: dto.password
    };
    return this.http.post<TokenResponseDto>(`${this.baseUrl}/login`, payload).pipe(
      tap((res) => this.handleAuthSuccess(res))
    );
  }

  public register(dto: RegisterRequestDto): Observable<TokenResponseDto> {
    return this.http.post<TokenResponseDto>(`${this.baseUrl}/register`, dto).pipe(
      tap((res) => this.handleAuthSuccess(res))
    );
  }

  public refreshToken(): Observable<TokenResponseDto> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      this.logout();
      return throwError(() => new Error('No refresh token available'));
    }

    return this.http.post<TokenResponseDto>(`${this.baseUrl}/refresh-token`, { refreshToken }).pipe(
      tap((res) => this.handleAuthSuccess(res)),
      catchError((err) => {
        this.logout();
        return throwError(() => err);
      })
    );
  }

  public logout(): void {
    const refreshToken = this.getRefreshToken();
    if (refreshToken) {
      this.http.post(`${this.baseUrl}/logout`, { refreshToken }).subscribe({
        error: () => { /* ignore logout failure */ }
      });
    }

    this.storage.removeItem(ACCESS_TOKEN_KEY);
    this.storage.removeItem(REFRESH_TOKEN_KEY);
    this.storage.removeItem(USER_KEY);
    this.currentUserSignal.set(null);
    this.tokenSignal.set(null);
    this.router.navigate(['/auth/login']);
  }

  private handleAuthSuccess(response: TokenResponseDto): void {
    if (response.accessToken) {
      this.storage.setItem(ACCESS_TOKEN_KEY, response.accessToken);
      this.tokenSignal.set(response.accessToken);
    }
    if (response.refreshToken) {
      this.storage.setItem(REFRESH_TOKEN_KEY, response.refreshToken);
    }
    if (response.user) {
      this.storage.setItem(USER_KEY, JSON.stringify(response.user));
      this.currentUserSignal.set(response.user);
    }
  }

  public hasRole(role: UserRole | string): boolean {
    const current = this.currentUserSignal();
    return !!current && current.roleName === role;
  }
}
