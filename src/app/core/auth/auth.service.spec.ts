import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { vi } from 'vitest';
import { Perfil } from './auth.model';
import { AuthService } from './auth.service';

const ANA: Perfil = {
  id: 10,
  nombre: 'Ana Pérez',
  email: 'ana@mail.com',
  rol: 'CLIENTE',
  dni: '35123456',
  telefono: '11 5555-1234',
};

describe('AuthService', () => {
  let auth: AuthService;
  let backend: HttpTestingController;
  let router: Router;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    });
    auth = TestBed.inject(AuthService);
    backend = TestBed.inject(HttpTestingController);
    router = TestBed.inject(Router);
    vi.spyOn(router, 'navigate').mockResolvedValue(true);
  });

  afterEach(() => backend.verify());

  it('recupera la sesión si la cookie sigue vigente', async () => {
    const carga = auth.cargarSesion();
    backend.expectOne('/api/usuarios/yo').flush(ANA);
    await carga;
    expect(auth.perfil()).toEqual(ANA);
  });

  it('sin cookie arranca sin sesión', async () => {
    const carga = auth.cargarSesion();
    backend.expectOne('/api/usuarios/yo').flush(null, { status: 401, statusText: 'Unauthorized' });
    await carga;
    expect(auth.autenticado()).toBe(false);
  });

  it('al iniciar sesión pide el perfil y lo guarda', () => {
    auth.login({ email: 'ana@mail.com', contrasena: 'secreta123' }).subscribe();
    const login = backend.expectOne('/api/auth/login');
    expect(login.request.body).toEqual({ email: 'ana@mail.com', contrasena: 'secreta123' });
    login.flush({ id: 10, email: 'ana@mail.com', rol: 'CLIENTE' });
    backend.expectOne('/api/usuarios/yo').flush(ANA);
    expect(auth.perfil()).toEqual(ANA);
  });

  it('al registrarse queda logueado', () => {
    const datos = { nombre: 'Ana Pérez', email: 'ana@mail.com', contrasena: 'secreta123', dni: '35123456', telefono: '1155551234' };
    auth.registrar(datos).subscribe();
    backend.expectOne('/api/auth/registro').flush({ id: 10, email: 'ana@mail.com', rol: 'CLIENTE' });
    backend.expectOne('/api/usuarios/yo').flush(ANA);
    expect(auth.autenticado()).toBe(true);
  });

  it('al cerrar sesión borra el perfil y va al login', () => {
    auth.perfil.set(ANA);
    auth.cerrarSesion();
    backend.expectOne('/api/auth/logout').flush(null);
    expect(auth.autenticado()).toBe(false);
    expect(router.navigate).toHaveBeenCalledWith(['/login']);
  });

  it('cierra la sesión local aunque el logout falle', () => {
    auth.perfil.set(ANA);
    auth.cerrarSesion();
    backend.expectOne('/api/auth/logout').error(new ProgressEvent('error'));
    expect(auth.autenticado()).toBe(false);
    expect(router.navigate).toHaveBeenCalledWith(['/login']);
  });

  it('la pantalla de inicio depende del rol', () => {
    expect(auth.rutaDeInicio()).toBe('/');
    auth.perfil.set({ ...ANA, rol: 'TECNICO' });
    expect(auth.rutaDeInicio()).toBe('/tecnico');
    expect(auth.tieneRol('TECNICO', 'EMPLEADO')).toBe(true);
    expect(auth.tieneRol('CLIENTE')).toBe(false);
  });
});
