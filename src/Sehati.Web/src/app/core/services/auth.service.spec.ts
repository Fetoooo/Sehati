import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { AuthService } from './auth.service';
import { StorageService } from './storage.service';
import { TokenResponseDto, UserRole } from '../models/auth.models';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;
  let storageSpy: jasmine.SpyObj<StorageService>;

  const mockTokenResponse: TokenResponseDto = {
    accessToken: 'test-access-token',
    refreshToken: 'test-refresh-token',
    expiresIn: 3600,
    user: {
      id: 'user-123',
      nationalId: '12345678901234',
      fullName: 'Dr. Sarah Ahmed',
      email: 'sarah@sehati.com',
      phoneNumber: '01012345678',
      roleId: 2,
      roleName: UserRole.Doctor,
      isActive: true,
      lastLoginAt: '2026-11-04T12:00:00Z',
      createdAt: '2026-11-01T10:00:00Z'
    }
  };

  beforeEach(() => {
    storageSpy = jasmine.createSpyObj('StorageService', ['getItem', 'setItem', 'removeItem', 'clear']);

    TestBed.configureTestingModule({
      providers: [
        AuthService,
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        { provide: StorageService, useValue: storageSpy }
      ]
    });

    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should start unauthenticated when no stored data exists', () => {
    expect(service.isAuthenticated()).toBeFalse();
    expect(service.currentUser()).toBeNull();
    expect(service.userRole()).toBeNull();
  });

  it('should handle successful login', () => {
    const dummyAuthKey = ['Test', 'Credential', Date.now()].join('_');
    service.login({ identifier: 'sarah@sehati.com', password: dummyAuthKey }).subscribe((res) => {
      expect(res).toEqual(mockTokenResponse);
    });

    const req = httpMock.expectOne('/api/v1/auth/login');
    expect(req.request.method).toBe('POST');
    req.flush(mockTokenResponse);

    expect(storageSpy.setItem).toHaveBeenCalledWith('sehati_access_token', 'test-access-token');
    expect(storageSpy.setItem).toHaveBeenCalledWith('sehati_refresh_token', 'test-refresh-token');
    expect(service.isAuthenticated()).toBeTrue();
    expect(service.currentUser()?.email).toBe('sarah@sehati.com');
    expect(service.userRole()).toBe(UserRole.Doctor);
  });

  it('should clear stored credentials on logout', () => {
    storageSpy.getItem.and.returnValue('test-refresh-token');

    service.logout();

    const req = httpMock.expectOne('/api/v1/auth/logout');
    expect(req.request.method).toBe('POST');
    req.flush({ success: true });

    expect(storageSpy.removeItem).toHaveBeenCalledWith('sehati_access_token');
    expect(storageSpy.removeItem).toHaveBeenCalledWith('sehati_refresh_token');
    expect(storageSpy.removeItem).toHaveBeenCalledWith('sehati_user');
    expect(service.isAuthenticated()).toBeFalse();
  });
});
