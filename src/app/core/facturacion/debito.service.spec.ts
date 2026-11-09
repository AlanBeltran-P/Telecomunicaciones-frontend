import { HttpErrorResponse, provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { DebitoAutomatico } from './factura.model';
import { DebitoService } from './debito.service';

const URL = '/api/facturas/debito-automatico';

describe('DebitoService', () => {
  let servicio: DebitoService;
  let backend: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    servicio = TestBed.inject(DebitoService);
    backend = TestBed.inject(HttpTestingController);
  });

  afterEach(() => backend.verify());

  it('devuelve el débito activo', () => {
    let resultado: DebitoAutomatico | null | undefined;
    servicio.consultar().subscribe((debito) => (resultado = debito));

    backend.expectOne({ method: 'GET', url: URL }).flush({ medio: 'PAYPAL', fechaAlta: '2026-11-01' });

    expect(resultado).toEqual({ medio: 'PAYPAL', fechaAlta: '2026-11-01' });
  });

  it('sin débito activo (404) devuelve null', () => {
    let resultado: DebitoAutomatico | null | undefined;
    servicio.consultar().subscribe((debito) => (resultado = debito));

    backend
      .expectOne(URL)
      .flush({ detail: 'No tenés el débito automático activado' }, { status: 404, statusText: 'Not Found' });

    expect(resultado).toBeNull();
  });

  it('otros errores siguen como error', () => {
    let error: HttpErrorResponse | undefined;
    servicio.consultar().subscribe({ error: (e: HttpErrorResponse) => (error = e) });

    backend.expectOne(URL).flush(null, { status: 500, statusText: 'Server Error' });

    expect(error?.status).toBe(500);
  });

  it('activa con PUT y desactiva con DELETE', () => {
    servicio.activar({ medio: 'MERCADO_PAGO', tokenDePago: 'tok' }).subscribe();
    const activar = backend.expectOne({ method: 'PUT', url: URL });
    expect(activar.request.body).toEqual({ medio: 'MERCADO_PAGO', tokenDePago: 'tok' });
    activar.flush({ medio: 'MERCADO_PAGO', fechaAlta: '2026-11-09' });

    servicio.desactivar().subscribe();
    backend.expectOne({ method: 'DELETE', url: URL }).flush(null, { status: 204, statusText: 'No Content' });
  });
});
