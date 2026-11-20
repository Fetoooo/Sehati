import { TestBed } from '@angular/core/testing';
import { LanguageService } from './language.service';
import { StorageService } from './storage.service';

describe('LanguageService', () => {
  let service: LanguageService;
  let storageSpy: jasmine.SpyObj<StorageService>;

  beforeEach(() => {
    storageSpy = jasmine.createSpyObj('StorageService', ['getItem', 'setItem']);
    storageSpy.getItem.and.returnValue(null);

    TestBed.configureTestingModule({
      providers: [
        LanguageService,
        { provide: StorageService, useValue: storageSpy }
      ]
    });

    service = TestBed.inject(LanguageService);
  });

  it('should be created with default en language', () => {
    expect(service).toBeTruthy();
    expect(service.currentLang()).toBe('en');
    expect(service.isRtl()).toBeFalse();
  });

  it('should toggle language between en and ar', () => {
    service.toggleLanguage();
    expect(service.currentLang()).toBe('ar');
    expect(service.isRtl()).toBeTrue();
    expect(storageSpy.setItem).toHaveBeenCalledWith('sehati_lang', 'ar');

    service.toggleLanguage();
    expect(service.currentLang()).toBe('en');
    expect(service.isRtl()).toBeFalse();
    expect(storageSpy.setItem).toHaveBeenCalledWith('sehati_lang', 'en');
  });

  it('should translate known keys correctly', () => {
    expect(service.t('brandTitle')).toBe('SEHATI');
    service.setLanguage('ar');
    expect(service.t('brandTitle')).toBe('صِحّتي');
  });

  it('should return the key itself if not found in dictionary', () => {
    expect(service.t('non_existing_key_xyz')).toBe('non_existing_key_xyz');
  });
});
