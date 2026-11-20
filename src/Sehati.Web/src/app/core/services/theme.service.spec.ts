import { TestBed } from '@angular/core/testing';
import { ThemeService } from './theme.service';
import { StorageService } from './storage.service';

describe('ThemeService', () => {
  let service: ThemeService;
  let storageSpy: jasmine.SpyObj<StorageService>;

  beforeEach(() => {
    storageSpy = jasmine.createSpyObj('StorageService', ['getItem', 'setItem']);
    storageSpy.getItem.and.returnValue(null);

    TestBed.configureTestingModule({
      providers: [
        ThemeService,
        { provide: StorageService, useValue: storageSpy }
      ]
    });

    service = TestBed.inject(ThemeService);
  });

  it('should be created with default light theme', () => {
    expect(service).toBeTruthy();
    expect(service.currentTheme()).toBe('light');
    expect(service.isDark()).toBeFalse();
  });

  it('should toggle theme between light and dark', () => {
    service.toggleTheme();
    expect(service.currentTheme()).toBe('dark');
    expect(service.isDark()).toBeTrue();
    expect(storageSpy.setItem).toHaveBeenCalledWith('sehati_theme', 'dark');

    service.toggleTheme();
    expect(service.currentTheme()).toBe('light');
    expect(service.isDark()).toBeFalse();
    expect(storageSpy.setItem).toHaveBeenCalledWith('sehati_theme', 'light');
  });

  it('should set specific theme', () => {
    service.setTheme('dark');
    expect(service.currentTheme()).toBe('dark');
    expect(service.isDark()).toBeTrue();

    service.setTheme('light');
    expect(service.currentTheme()).toBe('light');
    expect(service.isDark()).toBeFalse();
  });
});
