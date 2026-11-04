import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute, provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { LoginComponent } from './login.component';
import { AuthService } from '../../../core/services/auth.service';
import { TokenResponseDto, UserRole } from '../../../core/models/auth.models';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let router: Router;

  const mockTokenResponse: TokenResponseDto = {
    accessToken: 'test-jwt-token',
    refreshToken: 'test-refresh-token',
    expiresIn: 3600,
    tokenType: 'Bearer',
    user: {
      userId: 1,
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

    await TestBed.configureTestingModule({
      imports: [LoginComponent, ReactiveFormsModule],
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: authServiceSpy },
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

    router = TestBed.inject(Router);
    spyOn(router, 'navigateByUrl').and.returnValue(Promise.resolve(true));

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
    expect(router.navigateByUrl).toHaveBeenCalledWith('/dashboard');
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
    expect(router.navigateByUrl).not.toHaveBeenCalled();
  });
});
