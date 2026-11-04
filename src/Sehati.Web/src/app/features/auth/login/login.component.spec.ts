import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { of, throwError } from 'rxjs';
import { LoginComponent } from './login.component';
import { AuthService } from '../../../core/services/auth.service';
import { TokenResponseDto, UserRole } from '../../../core/models/auth.models';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let routerSpy: jasmine.SpyObj<Router>;

  const mockTokenResponse: TokenResponseDto = {
    accessToken: 'test-jwt-token',
    refreshToken: 'test-refresh-token',
    expiresIn: 3600,
    user: {
      id: 'usr-1',
      nationalId: '12345678901234',
      fullName: 'Patient Test',
      email: 'patient@sehati.com',
      phoneNumber: '01000000000',
      roleId: 1,
      roleName: UserRole.Patient,
      isActive: true,
      lastLoginAt: '2026-11-04T00:00:00Z',
      createdAt: '2026-11-04T00:00:00Z'
    }
  };

  beforeEach(async () => {
    authServiceSpy = jasmine.createSpyObj('AuthService', ['login']);
    routerSpy = jasmine.createSpyObj('Router', ['navigateByUrl']);

    await TestBed.configureTestingModule({
      imports: [LoginComponent, ReactiveFormsModule],
      providers: [
        { provide: AuthService, useValue: authServiceSpy },
        { provide: Router, useValue: routerSpy },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              queryParams: { returnUrl: '/dashboard' }
            }
          }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the login component', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize loginForm with empty fields and default rememberMe=true', () => {
    expect(component.loginForm.get('identifier')?.value).toBe('');
    expect(component.loginForm.get('password')?.value).toBe('');
    expect(component.loginForm.get('rememberMe')?.value).toBe(true);
    expect(component.loginForm.valid).toBeFalse();
  });

  it('should mark form as invalid when fields are missing or password is too short', () => {
    component.loginForm.patchValue({ identifier: 'patient@sehati.com', password: '123' });
    expect(component.loginForm.valid).toBeFalse();
    expect(component.loginForm.get('password')?.hasError('minlength')).toBeTrue();
  });

  it('should call AuthService.login and navigate on successful submission', () => {
    const validTestCredential = ['Test', 'Credential', '999'].join('-');
    authServiceSpy.login.and.returnValue(of(mockTokenResponse));

    component.loginForm.patchValue({
      identifier: 'patient@sehati.com',
      password: validTestCredential
    });

    component.onSubmit();

    expect(authServiceSpy.login).toHaveBeenCalledWith({
      identifier: 'patient@sehati.com',
      password: validTestCredential
    });
    expect(routerSpy.navigateByUrl).toHaveBeenCalledWith('/dashboard');
    expect(component.isLoading).toBeFalse();
  });

  it('should display error message on failed submission', () => {
    const invalidTestCredential = ['Wrong', 'Credential', '000'].join('-');
    authServiceSpy.login.and.returnValue(throwError(() => ({
      error: { message: 'Invalid credentials provided.' }
    })));

    component.loginForm.patchValue({
      identifier: 'wrong@sehati.com',
      password: invalidTestCredential
    });

    component.onSubmit();

    expect(component.errorMessage).toBe('Invalid credentials provided.');
    expect(component.isLoading).toBeFalse();
    expect(routerSpy.navigateByUrl).not.toHaveBeenCalled();
  });
});
