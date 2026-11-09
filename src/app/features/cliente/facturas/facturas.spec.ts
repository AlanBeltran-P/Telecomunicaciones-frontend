import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FACTURAS_MOCK } from '../../../core/mock/datos/facturas.mock';
import { FORMATO_ARGENTINO } from '../../../shared/testing/formato-argentino';
import { clickEnBoton, textoEnPantalla } from '../../../shared/testing/pantalla';
import { Facturas } from './facturas';

const FACTURAS_DE_ANA = FACTURAS_MOCK.filter((f) => f.clienteId === 10);

describe('Facturas', () => {
  let fixture: ComponentFixture<Facturas>;
  let backend: HttpTestingController;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      imports: [Facturas],
      providers: [provideHttpClient(), provideHttpClientTesting(), FORMATO_ARGENTINO],
    });
    backend = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(Facturas);
    fixture.detectChanges();
    backend.expectOne('/api/facturas/mias').flush(FACTURAS_DE_ANA);
    await fixture.whenStable();
  });

  afterEach(() => backend.verify());

  function filas(): HTMLElement[] {
    return Array.from((fixture.nativeElement as HTMLElement).querySelectorAll('tbody tr'));
  }

  /** Confirmar manda un pedido: no se espera la pantalla estable hasta responderlo. */
  function confirmarPago(): void {
    const botones = Array.from((fixture.nativeElement as HTMLElement).querySelectorAll('button'));
    botones.find((boton) => boton.textContent?.includes('Confirmar pago'))?.click();
    fixture.detectChanges();
  }

  it('muestra cada factura con período, monto y estado', () => {
    const primera = filas()[0].textContent ?? '';

    expect(filas().length).toBe(4);
    expect(primera).toContain('Noviembre 2026');
    expect(primera).toContain('18.500');
    expect(primera).toContain('18/11/2026');
    expect(primera).toContain('Pendiente');
  });

  it('las pagadas muestran cuándo y con qué se pagaron', () => {
    expect(filas()[2].textContent).toContain('15/10 · Mercado Pago');
  });

  it('paga una factura y la fila pasa a pagada', async () => {
    await clickEnBoton(fixture, 'Pagar');
    confirmarPago();

    const pedido = backend.expectOne({ method: 'POST', url: '/api/facturas/1/pagos' });
    expect(pedido.request.body.medio).toBe('TARJETA_DEBITO');
    pedido.flush({ ...FACTURAS_DE_ANA[0], estado: 'PAGADA', fechaPago: '2026-11-09', medioDePago: 'TARJETA_DEBITO' });
    await fixture.whenStable();

    expect(filas()[0].textContent).toContain('Pagada');
    expect(filas()[0].textContent).toContain('Tarjeta de débito');
  });

  it('si el pago se rechaza muestra el motivo en el modal', async () => {
    await clickEnBoton(fixture, 'Pagar');
    confirmarPago();

    backend
      .expectOne('/api/facturas/1/pagos')
      .flush(
        { detail: 'El pago de la factura 1 fue rechazado. Probá con otro medio de pago' },
        { status: 402, statusText: 'Payment Required' },
      );
    await fixture.whenStable();

    expect(textoEnPantalla(fixture)).toContain('fue rechazado. Probá con otro medio de pago');
    expect(filas()[0].textContent).toContain('Pendiente');
  });
});
