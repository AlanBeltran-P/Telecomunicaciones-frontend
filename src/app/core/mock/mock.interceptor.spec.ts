import {
  HttpClient,
  HttpErrorResponse,
  provideHttpClient,
  withInterceptors,
} from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { Observable, firstValueFrom } from 'rxjs';
import { Perfil } from '../auth/auth.model';
import { Cliente } from '../clientes/cliente.model';
import { Contratacion } from '../contrataciones/contratacion.model';
import { Instalacion } from '../contrataciones/instalacion.model';
import { DebitoAutomatico, Factura } from '../facturacion/factura.model';
import { Notificacion } from '../notificaciones/notificacion.model';
import { ReporteFacturacion } from '../reportes/reporte.model';
import { Usuario } from '../usuarios/usuario.model';
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

  describe('área del cliente', () => {
    beforeEach(async () => {
      await firstValueFrom(http.post('/api/auth/login', ANA));
    });

    it('Ana ve solo sus contrataciones, la más nueva primero', async () => {
      const suyas = await firstValueFrom(http.get<Contratacion[]>('/api/contrataciones/mias'));
      expect(suyas.map((c) => c.planNombre)).toEqual(['Fibra + TV', 'Fibra 1000', 'Fibra 300']);
    });

    it('contrata un plan nuevo y queda pendiente de instalación', async () => {
      const nueva = await firstValueFrom(
        http.post<Contratacion>('/api/contrataciones', { planId: 4, direccion: 'Mitre 10' }),
      );
      expect(nueva.estado).toBe('PENDIENTE_INSTALACION');
      const suyas = await firstValueFrom(http.get<Contratacion[]>('/api/contrataciones/mias'));
      expect(suyas.length).toBe(4);
    });

    it('no deja contratar dos veces el mismo plan', async () => {
      const error = await errorDe(
        http.post('/api/contrataciones', { planId: 1, direccion: 'Mitre 10' }),
      );
      expect(error.status).toBe(409);
      expect(error.error.detail).toBe('Ya tenés contratado el plan Fibra 300');
    });

    it('paga una factura y no deja pagarla dos veces', async () => {
      const pago = { medio: 'MERCADO_PAGO', tokenDePago: 'tok' };
      const pagada = await firstValueFrom(http.post<Factura>('/api/facturas/1/pagos', pago));
      expect(pagada.estado).toBe('PAGADA');
      expect(pagada.medioDePago).toBe('MERCADO_PAGO');

      const error = await errorDe(http.post('/api/facturas/1/pagos', pago));
      expect(error.status).toBe(409);
      expect(error.error.detail).toBe('La factura 1 ya está pagada');
    });

    it('rechaza el pago con el token "rechazado", como la pasarela simulada', async () => {
      const error = await errorDe(
        http.post('/api/facturas/2/pagos', { medio: 'PAYPAL', tokenDePago: 'rechazado' }),
      );
      expect(error.status).toBe(402);
    });

    it('no deja pagar la factura de otro cliente', async () => {
      const error = await errorDe(
        http.post('/api/facturas/5/pagos', { medio: 'PAYPAL', tokenDePago: 'tok' }),
      );
      expect(error.status).toBe(404);
      expect(error.error.detail).toBe('No existe la factura 5');
    });

    it('activa, consulta y desactiva el débito automático', async () => {
      const sinDebito = await errorDe(http.get('/api/facturas/debito-automatico'));
      expect(sinDebito.status).toBe(404);

      const pago = { medio: 'TARJETA_CREDITO', tokenDePago: 'tok' };
      await firstValueFrom(http.put('/api/facturas/debito-automatico', pago));
      const activo = await firstValueFrom(
        http.get<DebitoAutomatico>('/api/facturas/debito-automatico'),
      );
      expect(activo.medio).toBe('TARJETA_CREDITO');

      await firstValueFrom(http.delete('/api/facturas/debito-automatico'));
      const otraVez = await errorDe(http.get('/api/facturas/debito-automatico'));
      expect(otraVez.status).toBe(404);
    });

    it('marca una notificación como leída', async () => {
      await firstValueFrom(http.put('/api/notificaciones/1/leida', null));
      const avisos = await firstValueFrom(http.get<Notificacion[]>('/api/notificaciones/mias'));
      expect(avisos.find((aviso) => aviso.id === 1)?.leida).toBe(true);
      expect(avisos[0].asunto).toBe('Nueva factura de Fibra 300');
    });
  });

  describe('áreas del empleado y del técnico', () => {
    const EMPLEADO = { email: 'empleado@systematele.com', contrasena: 'demo1234' };
    const TECNICO = { email: 'tecnico@systematele.com', contrasena: 'demo1234' };

    it('busca clientes por nombre, email o DNI', async () => {
      await firstValueFrom(http.post('/api/auth/login', EMPLEADO));
      const todos = await firstValueFrom(http.get<Cliente[]>('/api/clientes'));
      const porDni = await firstValueFrom(
        http.get<Cliente[]>('/api/clientes', { params: { busqueda: '33999' } }),
      );
      expect(todos.length).toBe(4);
      expect(porDni.map((c) => c.nombre)).toEqual(['Diego Fernández']);
    });

    it('no deja dar de alta un cliente con un DNI repetido', async () => {
      await firstValueFrom(http.post('/api/auth/login', EMPLEADO));
      const repetido = { nombre: 'Otro', email: 'otro@mail.com', contrasena: 'secreta123', dni: '35123456', telefono: '11 4000-1000' };
      const error = await errorDe(http.post('/api/clientes', repetido));
      expect(error.status).toBe(409);
      expect(error.error.detail).toBe('El DNI 35123456 ya está registrado');
    });

    it('asigna un técnico a una instalación sin técnico', async () => {
      await firstValueFrom(http.post('/api/auth/login', EMPLEADO));
      const asignada = await firstValueFrom(
        http.put<Instalacion>('/api/instalaciones/7/tecnico', { tecnicoId: 4 }),
      );
      expect(asignada.tecnicoNombre).toBe('Sofía Díaz');
    });

    it('reactiva una suspendida y no deja reactivarla dos veces', async () => {
      await firstValueFrom(http.post('/api/auth/login', EMPLEADO));
      const reactivada = await firstValueFrom(http.put<Contratacion>('/api/contrataciones/3/reactivacion', null));
      expect(reactivada.estado).toBe('ACTIVA');
      const error = await errorDe(http.put('/api/contrataciones/3/reactivacion', null));
      expect(error.status).toBe(409);
    });

    it('el técnico marca su instalación y pasa al historial', async () => {
      await firstValueFrom(http.post('/api/auth/login', TECNICO));
      const pendientes = await firstValueFrom(http.get<Instalacion[]>('/api/instalaciones/mias'));
      expect(pendientes.map((i) => i.contratacionId)).toEqual([2]);

      await firstValueFrom(http.put('/api/instalaciones/2/realizada', null));
      const historial = await firstValueFrom(http.get<Instalacion[]>('/api/instalaciones/realizadas'));
      expect(historial[0].contratacionId).toBe(2);
      expect(historial.length).toBe(5);
    });

    it('un técnico no puede marcar la instalación de otro', async () => {
      await firstValueFrom(http.post('/api/auth/login', TECNICO));
      await firstValueFrom(http.put('/api/instalaciones/6/tecnico', { tecnicoId: 4 }));
      const error = await errorDe(http.put('/api/instalaciones/6/realizada', null));
      expect(error.status).toBe(403);
    });
  });

  describe('área del administrador', () => {
    const ADMIN = { email: 'admin@systematele.com', contrasena: 'demo1234' };

    beforeEach(async () => {
      await firstValueFrom(http.post('/api/auth/login', ADMIN));
    });

    it('lista solo al personal, sin clientes', async () => {
      const personal = await firstValueFrom(http.get<Usuario[]>('/api/usuarios'));
      expect(personal.every((u) => u.rol !== 'CLIENTE')).toBe(true);
      expect(personal.length).toBe(5);
    });

    it('no deja dar de alta un cliente desde la gestión de usuarios', async () => {
      const cliente = { nombre: 'X', email: 'x@mail.com', contrasena: 'secreta123', rol: 'CLIENTE' };
      const error = await errorDe(http.post('/api/usuarios', cliente));
      expect(error.status).toBe(400);
      expect(error.error.detail).toBe('El rol CLIENTE no se asigna desde la gestión de usuarios');
    });

    it('el administrador no puede cambiarse su propio rol', async () => {
      const error = await errorDe(http.put('/api/usuarios/1/rol', { rol: 'EMPLEADO' }));
      expect(error.status).toBe(400);
    });

    it('un plan dado de baja deja de aparecer en el catálogo', async () => {
      await firstValueFrom(http.delete('/api/planes/5'));
      const planes = await firstValueFrom(http.get<Plan[]>('/api/planes'));
      expect(planes.map((p) => p.nombre)).not.toContain('Empresas 500');
    });

    it('los reportes respetan el rango y la agrupación', async () => {
      const params = { desde: '2026-01-01', hasta: '2026-12-31', agrupacion: 'MES' };
      const reporte = await firstValueFrom(http.get<ReporteFacturacion>('/api/facturas/reporte', { params }));
      expect(reporte.serie.length).toBe(12);
      expect(reporte.serie[0].periodo).toBe('2026-01');
    });

    it('un rango al revés da el error del backend', async () => {
      const params = { desde: '2026-12-01', hasta: '2026-11-01', agrupacion: 'DIA' };
      const error = await errorDe(http.get('/api/usuarios/reporte', { params }));
      expect(error.status).toBe(400);
      expect(error.error.detail).toBe('La fecha desde (2026-12-01) no puede ser posterior a la fecha hasta (2026-11-01)');
    });
  });
});
