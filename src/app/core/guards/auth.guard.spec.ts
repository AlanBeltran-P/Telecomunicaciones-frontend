import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import {
  ActivatedRouteSnapshot,
  CanActivateFn,
  Router,
  RouterStateSnapshot,
  UrlTree,
  provideRouter,
} from '@angular/router';
import { Perfil } from '../auth/auth.model';
import { AuthService } from '../auth/auth.service';
import { Rol } from '../auth/rol';
import { authGuard, invitadoGuard, rolGuard } from './auth.guard';

function perfilCon(rol: Rol): Perfil {
  return { id: 1, nombre: 'Ana Pérez', email: 'ana@mail.com', rol, dni: null, telefono: null };
}

describe('guards', () => {
  let auth: AuthService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    });
    auth = TestBed.inject(AuthService);
  });

  function ejecutar(guard: CanActivateFn, url = '/cliente/facturas') {
    return TestBed.runInInjectionContext(() =>
      guard({} as ActivatedRouteSnapshot, { url } as RouterStateSnapshot),
    );
  }

  function rutaDe(resultado: unknown): string {
    return TestBed.inject(Router).serializeUrl(resultado as UrlTree);
  }

  it('authGuard manda al login recordando a dónde quería ir', () => {
    const resultado = ejecutar(authGuard) as UrlTree;
    expect(resultado.root.children['primary'].segments[0].path).toBe('login');
    expect(resultado.queryParams['volver']).toBe('/cliente/facturas');
  });

  it('authGuard deja pasar con sesión', () => {
    auth.perfil.set(perfilCon('CLIENTE'));
    expect(ejecutar(authGuard)).toBe(true);
  });

  it('rolGuard manda a otro rol a su propia pantalla', () => {
    auth.perfil.set(perfilCon('TECNICO'));
    expect(rutaDe(ejecutar(rolGuard('CLIENTE')))).toBe('/tecnico');
  });

  it('rolGuard deja pasar al rol correcto', () => {
    auth.perfil.set(perfilCon('CLIENTE'));
    expect(ejecutar(rolGuard('CLIENTE'))).toBe(true);
  });

  it('invitadoGuard manda al usuario logueado a su pantalla', () => {
    auth.perfil.set(perfilCon('ADMINISTRADOR'));
    expect(rutaDe(ejecutar(invitadoGuard))).toBe('/admin');
  });

  it('invitadoGuard deja pasar sin sesión', () => {
    expect(ejecutar(invitadoGuard)).toBe(true);
  });
});
