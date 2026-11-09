import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { vi } from 'vitest';
import { AuthService } from '../auth/auth.service';
import { sesionVencidaInterceptor } from './sesion-vencida.interceptor';

describe('sesionVencidaInterceptor', () => {
  let http: HttpClient;
  let backend: HttpTestingController;
  let auth: AuthService;
  let cerrarSesionLocal: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        provideHttpClient(withInterceptors([sesionVencidaInterceptor])),
        provideHttpClientTesting(),
      ],
    });
    http = TestBed.inject(HttpClient);
    backend = TestBed.inject(HttpTestingController);
    auth = TestBed.inject(AuthService);
    cerrarSesionLocal = vi.spyOn(auth, 'cerrarSesionLocal').mockImplementation(() => {});
  });

  afterEach(() => backend.verify());

  function responderCon(status: number): void {
    http.get('/api/facturas/mias').subscribe({ error: () => {} });
    backend.expectOne('/api/facturas/mias').flush(null, { status, statusText: 'Error' });
  }

  function loguear(): void {
    auth.perfil.set({ id: 10, nombre: 'Ana Pérez', email: 'ana@mail.com', rol: 'CLIENTE', dni: null, telefono: null });
  }

  it('si había sesión y llega un 401, cierra la sesión', () => {
    loguear();
    responderCon(401);
    expect(cerrarSesionLocal).toHaveBeenCalled();
  });

  it('un 401 sin sesión (ej. contraseña incorrecta) no hace nada', () => {
    responderCon(401);
    expect(cerrarSesionLocal).not.toHaveBeenCalled();
  });

  it('otros errores no cierran la sesión', () => {
    loguear();
    responderCon(403);
    expect(cerrarSesionLocal).not.toHaveBeenCalled();
  });
});
