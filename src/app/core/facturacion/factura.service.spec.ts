import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { FacturaService } from './factura.service';

describe('FacturaService', () => {
  let servicio: FacturaService;
  let backend: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    servicio = TestBed.inject(FacturaService);
    backend = TestBed.inject(HttpTestingController);
  });

  afterEach(() => backend.verify());

  it('pide las facturas del cliente logueado', () => {
    servicio.mias().subscribe();
    backend.expectOne({ method: 'GET', url: '/api/facturas/mias' }).flush([]);
  });

  it('paga una factura con el medio y el token', () => {
    servicio.pagar(7, { medio: 'PAYPAL', tokenDePago: 'tok-1' }).subscribe();

    const pedido = backend.expectOne({ method: 'POST', url: '/api/facturas/7/pagos' });
    expect(pedido.request.body).toEqual({ medio: 'PAYPAL', tokenDePago: 'tok-1' });
    pedido.flush({});
  });
});
