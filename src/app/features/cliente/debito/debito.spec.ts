import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { clickEnBoton, textoEnPantalla } from '../../../shared/testing/pantalla';
import { Debito } from './debito';

const URL = '/api/facturas/debito-automatico';

describe('Debito', () => {
  let fixture: ComponentFixture<Debito>;
  let backend: HttpTestingController;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      imports: [Debito],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    backend = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(Debito);
    fixture.detectChanges();
    backend
      .expectOne(URL)
      .flush({ detail: 'No tenés el débito automático activado' }, { status: 404, statusText: 'Not Found' });
    await fixture.whenStable();
  });

  afterEach(() => backend.verify());

  /** Botón que manda un pedido: no se espera la pantalla estable hasta responderlo. */
  function tocar(texto: string): void {
    const botones = Array.from((fixture.nativeElement as HTMLElement).querySelectorAll('button'));
    botones.find((boton) => boton.textContent?.includes(texto))?.click();
    fixture.detectChanges();
  }

  function medioActivo(): string {
    const titulo = (fixture.nativeElement as HTMLElement).querySelector('.debito__titulo');
    return titulo?.textContent?.trim() ?? '';
  }

  it('sin débito invita a agregar un medio de pago', () => {
    expect(textoEnPantalla(fixture)).toContain('Todavía no agregaste un medio de pago');
  });

  it('agrega un medio y queda activo', async () => {
    await clickEnBoton(fixture, '+ Agregar medio de pago');
    tocar('Guardar y activar');

    const pedido = backend.expectOne({ method: 'PUT', url: URL });
    expect(pedido.request.body.medio).toBe('TARJETA_CREDITO');
    expect(pedido.request.body.tokenDePago).toBeTruthy();
    pedido.flush({ medio: 'TARJETA_CREDITO', fechaAlta: '2026-11-09' });
    await fixture.whenStable();

    expect(medioActivo()).toBe('Tarjeta de crédito');
    expect(textoEnPantalla(fixture)).toContain('activo desde el 09/11/2026');
  });

  it('al quitarlo vuelve a no tener débito', async () => {
    await clickEnBoton(fixture, '+ Agregar medio de pago');
    tocar('Guardar y activar');
    backend.expectOne(URL).flush({ medio: 'TARJETA_CREDITO', fechaAlta: '2026-11-09' });
    await fixture.whenStable();

    tocar('Quitar y desactivar');
    backend.expectOne({ method: 'DELETE', url: URL }).flush(null, { status: 204, statusText: 'No Content' });
    await fixture.whenStable();

    expect(medioActivo()).toBe('');
    expect(textoEnPantalla(fixture)).toContain('Todavía no agregaste un medio de pago');
  });
});
