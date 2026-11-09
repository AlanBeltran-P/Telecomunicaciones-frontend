import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Notificacion } from './notificacion.model';
import { NotificacionesService } from './notificaciones.service';

const AVISOS: Notificacion[] = [
  { id: 1, asunto: 'Factura nueva', mensaje: 'Vence el 18/11', fecha: '2026-11-08T02:00:00', leida: false },
  { id: 2, asunto: 'Técnico asignado', mensaje: 'Carlos Gómez', fecha: '2026-11-06T11:24:00', leida: false },
  { id: 3, asunto: 'Pago recibido', mensaje: '$ 18.500', fecha: '2026-10-15T18:02:00', leida: true },
];

describe('NotificacionesService', () => {
  let servicio: NotificacionesService;
  let backend: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    servicio = TestBed.inject(NotificacionesService);
    backend = TestBed.inject(HttpTestingController);
    servicio.cargar();
    backend.expectOne({ method: 'GET', url: '/api/notificaciones/mias' }).flush(AVISOS);
  });

  afterEach(() => backend.verify());

  it('carga los avisos y cuenta los no leídos', () => {
    expect(servicio.lista().length).toBe(3);
    expect(servicio.noLeidas()).toBe(2);
    expect(servicio.cargando()).toBe(false);
  });

  it('marcar uno como leído lo reemplaza por la respuesta del backend', () => {
    servicio.marcarLeida(AVISOS[0]);
    backend.expectOne({ method: 'PUT', url: '/api/notificaciones/1/leida' }).flush({ ...AVISOS[0], leida: true });

    expect(servicio.lista()[0].leida).toBe(true);
    expect(servicio.noLeidas()).toBe(1);
  });

  it('uno ya leído no se vuelve a marcar', () => {
    servicio.marcarLeida(AVISOS[2]);
    backend.expectNone('/api/notificaciones/3/leida');
  });

  it('marcar todas manda un pedido por cada no leído', () => {
    servicio.marcarTodas();

    const pedidos = backend.match((pedido) => pedido.method === 'PUT');
    expect(pedidos.map((pedido) => pedido.request.url)).toEqual([
      '/api/notificaciones/1/leida',
      '/api/notificaciones/2/leida',
    ]);
    pedidos.forEach((pedido, i) => pedido.flush({ ...AVISOS[i], leida: true }));
    expect(servicio.noLeidas()).toBe(0);
  });

  it('si no se pueden cargar, guarda el mensaje de error', () => {
    servicio.cargar();
    backend.expectOne('/api/notificaciones/mias').flush(null, { status: 0, statusText: 'Unknown' });

    expect(servicio.error()).toContain('No se pudo conectar');
  });
});
