import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { ContratacionService } from './contratacion.service';

describe('ContratacionService', () => {
  let servicio: ContratacionService;
  let backend: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    servicio = TestBed.inject(ContratacionService);
    backend = TestBed.inject(HttpTestingController);
  });

  afterEach(() => backend.verify());

  it('pide las contrataciones del cliente logueado', () => {
    servicio.misContrataciones().subscribe();
    backend.expectOne({ method: 'GET', url: '/api/contrataciones/mias' }).flush([]);
  });

  it('al contratar manda el plan y la dirección, y avisa que la lista cambió', () => {
    servicio.contratar({ planId: 4, direccion: 'Mitre 10' }).subscribe();

    const pedido = backend.expectOne({ method: 'POST', url: '/api/contrataciones' });
    expect(pedido.request.body).toEqual({ planId: 4, direccion: 'Mitre 10' });
    pedido.flush({});

    expect(servicio.cambios()).toBe(1);
  });

  it('un empleado contrata para un cliente y también avisa el cambio', () => {
    servicio.contratarParaCliente(11, { planId: 2, direccion: 'Mitre 890' }).subscribe();
    backend.expectOne({ method: 'POST', url: '/api/contrataciones/clientes/11' }).flush({});
    expect(servicio.cambios()).toBe(1);
  });

  it('un empleado ve, da de baja y reactiva contrataciones', () => {
    servicio.delCliente(10).subscribe();
    backend.expectOne({ method: 'GET', url: '/api/contrataciones/clientes/10' }).flush([]);

    servicio.suspendidas().subscribe();
    backend.expectOne({ method: 'GET', url: '/api/contrataciones/suspendidas' }).flush([]);

    servicio.darDeBaja(3).subscribe();
    backend.expectOne({ method: 'PUT', url: '/api/contrataciones/3/baja' }).flush({});

    servicio.reactivar(3).subscribe();
    backend.expectOne({ method: 'PUT', url: '/api/contrataciones/3/reactivacion' }).flush({});
  });

  it('si la contratación falla, la lista no cambia', () => {
    servicio.contratar({ planId: 1, direccion: 'Mitre 10' }).subscribe({ error: () => {} });
    backend
      .expectOne('/api/contrataciones')
      .flush({ detail: 'Ya tenés contratado el plan Fibra 300' }, { status: 409, statusText: 'Conflict' });

    expect(servicio.cambios()).toBe(0);
  });
});
