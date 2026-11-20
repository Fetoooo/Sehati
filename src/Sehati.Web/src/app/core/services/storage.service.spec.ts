import { TestBed } from '@angular/core/testing';
import { StorageService } from './storage.service';

describe('StorageService', () => {
  let service: StorageService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [StorageService]
    });
    service = TestBed.inject(StorageService);
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should set and get item from localStorage', () => {
    service.setItem('test_key', 'test_value');
    expect(service.getItem('test_key')).toBe('test_value');
  });

  it('should remove item from localStorage', () => {
    service.setItem('test_key', 'test_value');
    service.removeItem('test_key');
    expect(service.getItem('test_key')).toBeNull();
  });

  it('should clear all items in localStorage', () => {
    service.setItem('key1', 'val1');
    service.setItem('key2', 'val2');
    service.clear();
    expect(service.getItem('key1')).toBeNull();
    expect(service.getItem('key2')).toBeNull();
  });
});
