import {
  HttpClient,
  HttpErrorResponse,
  provideHttpClient,
  withInterceptors,
} from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { Observable, firstValueFrom } from 'rxjs';
import { Perfil } from '../auth/auth.model';
import { Plan } from '../planes/plan.model';
import { mockInterceptor } from './mock.interceptor';

const ANA = { email: 'cliente@systematele.com', contrasena: 'demo1234' };

describe('mockInterceptor', () => {
  let http: HttpClient;

  beforeEach(() => {
    sessionStorage.clear();
    TestBed.configureTestingModule({
      providers: [provideHttpClient(withInterceptors([mockInterceptor]))],
    });
    http = TestBed.inject(HttpClient);
  });

  async function errorDe(pedido: Observable<unknown>): Promise<HttpErrorResponse> {
    try {
      await firstValueFrom(pedido);
    } catch (error) {
      return error as HttpErrorResponse;
    }
    throw new Error('Se esperaba un error');
  }

  it('inicia sesión con una cuenta de ejemplo y devuelve su perfil', async () => {
    await firstValueFrom(http.post('/api/auth/login', ANA));
    const perfil = await firstValueFrom(http.get<Perfil>('/api/usuarios/yo'));
    expect(perfil.nombre).toBe('Ana Pérez');
    expect(perfil.rol).toBe('CLIENTE');
  });

  it('rechaza una contraseña incorrecta con el mensaje del backend', async () => {
    const error = await errorDe(http.post('/api/auth/login', { ...ANA, contrasena: 'otra' }));
    expect(error.status).toBe(401);
    expect(error.error.detail).toBe('Email o contraseña incorrectos');
  });

  it('sin sesión, /usuarios/yo responde 401', async () => {
    const error = await errorDe(http.get('/api/usuarios/yo'));
    expect(error.status).toBe(401);
  });

  it('registra un cliente nuevo y lo deja logueado', async () => {
    const nuevo = { nombre: 'Pablo Sosa', email: 'pablo@mail.com', contrasena: 'secreta123', dni: '30111222', telefono: '11 4000-1000' };
    await firstValueFrom(http.post('/api/auth/registro', nuevo));
    const perfil = await firstValueFrom(http.get<Perfil>('/api/usuarios/yo'));
    expect(perfil).toEqual(expect.objectContaining({ nombre: 'Pablo Sosa', rol: 'CLIENTE' }));
  });

  it('no deja registrar un email en uso', async () => {
    const repetido = { nombre: 'Otra Ana', email: ANA.email, contrasena: 'secreta123', dni: '30111222', telefono: '11 4000-1000' };
    const error = await errorDe(http.post('/api/auth/registro', repetido));
    expect(error.status).toBe(409);
    expect(error.error.detail).toBe('El email cliente@systematele.com ya está en uso');
  });

  it('después del logout ya no hay sesión', async () => {
    await firstValueFrom(http.post('/api/auth/login', ANA));
    await firstValueFrom(http.post('/api/auth/logout', null));
    const error = await errorDe(http.get('/api/usuarios/yo'));
    expect(error.status).toBe(401);
  });

  it('lista solo los planes activos', async () => {
    const planes = await firstValueFrom(http.get<Plan[]>('/api/planes'));
    expect(planes.length).toBe(5);
    expect(planes.map((plan) => plan.nombre)).not.toContain('Fibra 100');
  });

  it('un plan dado de baja da 404 con el mensaje del backend', async () => {
    const error = await errorDe(http.get('/api/planes/6'));
    expect(error.status).toBe(404);
    expect(error.error.detail).toBe('No existe un plan activo con id 6');
  });

  it('avisa cuando una ruta no está simulada', async () => {
    const error = await errorDe(http.get('/api/no-existe'));
    expect(error.status).toBe(404);
    expect(error.error.detail).toBe('El modo mock no tiene GET /no-existe');
  });
});
