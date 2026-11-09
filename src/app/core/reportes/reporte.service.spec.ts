import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Reportes } from './reporte.model';
import { ReporteService } from './reporte.service';

describe('ReporteService', () => {
  it('pide los tres reportes con el mismo rango y los junta', () => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    const backend = TestBed.inject(HttpTestingController);
    let reportes: Reportes | undefined;

    TestBed.inject(ReporteService)
      .todos({ desde: '2026-11-01', hasta: '2026-11-30', agrupacion: 'DIA' })
      .subscribe((respuesta) => (reportes = respuesta));

    for (const servicio of ['usuarios', 'contrataciones', 'facturas']) {
      const pedido = backend.expectOne((req) => req.url === `/api/${servicio}/reporte`);
      expect(pedido.request.params.get('desde')).toBe('2026-11-01');
      expect(pedido.request.params.get('hasta')).toBe('2026-11-30');
      expect(pedido.request.params.get('agrupacion')).toBe('DIA');
      pedido.flush({ deQuien: servicio });
    }

    expect(reportes).toEqual({
      usuarios: { deQuien: 'usuarios' },
      contrataciones: { deQuien: 'contrataciones' },
      facturacion: { deQuien: 'facturas' },
    });
    backend.verify();
  });
});
