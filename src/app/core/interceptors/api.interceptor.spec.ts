import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { apiInterceptor } from './api.interceptor';

describe('apiInterceptor', () => {
  let http: HttpClient;
  let backend: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(withInterceptors([apiInterceptor])), provideHttpClientTesting()],
    });
    http = TestBed.inject(HttpClient);
    backend = TestBed.inject(HttpTestingController);
  });

  afterEach(() => backend.verify());

  it('manda la cookie y pide los errores en español', () => {
    http.get('/api/planes').subscribe();
    const req = backend.expectOne('/api/planes');
    expect(req.request.withCredentials).toBe(true);
    expect(req.request.headers.get('Accept-Language')).toBe('es');
    req.flush([]);
  });

  it('no toca los pedidos a otros sitios', () => {
    http.get('https://fonts.googleapis.com/css2').subscribe();
    const req = backend.expectOne('https://fonts.googleapis.com/css2');
    expect(req.request.withCredentials).toBe(false);
    expect(req.request.headers.has('Accept-Language')).toBe(false);
    req.flush('');
  });
});
