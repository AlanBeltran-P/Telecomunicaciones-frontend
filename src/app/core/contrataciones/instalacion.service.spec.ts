import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { InstalacionService } from './instalacion.service';

describe('InstalacionService', () => {
  let servicio: InstalacionService;
  let backend: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    servicio = TestBed.inject(InstalacionService);
    backend = TestBed.inject(HttpTestingController);
  });

  afterEach(() => backend.verify());

  it('el empleado ve las pendientes y asigna un técnico', () => {
    servicio.pendientes().subscribe();
    backend.expectOne({ method: 'GET', url: '/api/instalaciones/pendientes' }).flush([]);

    servicio.asignarTecnico(7, 3).subscribe();
    const pedido = backend.expectOne({ method: 'PUT', url: '/api/instalaciones/7/tecnico' });
    expect(pedido.request.body).toEqual({ tecnicoId: 3 });
    pedido.flush({});
  });

  it('el técnico ve las suyas, su historial y marca una como realizada', () => {
    servicio.mias().subscribe();
    backend.expectOne({ method: 'GET', url: '/api/instalaciones/mias' }).flush([]);

    servicio.realizadas().subscribe();
    backend.expectOne({ method: 'GET', url: '/api/instalaciones/realizadas' }).flush([]);

    servicio.marcarRealizada(2).subscribe();
    backend.expectOne({ method: 'PUT', url: '/api/instalaciones/2/realizada' }).flush({});
  });
});
