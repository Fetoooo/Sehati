import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { PreviewComponent } from './preview.component';

describe('PreviewComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PreviewComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([])
      ]
    }).compileComponents();
  });

  it('should create the preview component', () => {
    const fixture = TestBed.createComponent(PreviewComponent);
    const component = fixture.componentInstance;
    expect(component).toBeTruthy();
  });

  it('should toggle language between English and Arabic', () => {
    const fixture = TestBed.createComponent(PreviewComponent);
    const component = fixture.componentInstance;
    expect(component.currentLang).toBe('en');

    component.toggleLanguage();
    expect(component.currentLang).toBe('ar');

    component.toggleLanguage();
    expect(component.currentLang).toBe('en');
  });

  it('should select active portal role', () => {
    const fixture = TestBed.createComponent(PreviewComponent);
    const component = fixture.componentInstance;
    expect(component.currentRole.id).toBe('patient');

    component.selectRole(1);
    expect(component.currentRole.id).toBe('doctor');
  });
});
