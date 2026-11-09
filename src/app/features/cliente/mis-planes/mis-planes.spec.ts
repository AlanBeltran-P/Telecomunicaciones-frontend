import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { CONTRATACIONES_MOCK } from '../../../core/mock/datos/contrataciones.mock';
import { FORMATO_ARGENTINO } from '../../../shared/testing/formato-argentino';
import { textoEnPantalla } from '../../../shared/testing/pantalla';
import { MisPlanes } from './mis-planes';

describe('MisPlanes', () => {
  let fixture: ComponentFixture<MisPlanes>;
  let backend: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [MisPlanes],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting(), FORMATO_ARGENTINO],
    });
    backend = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(MisPlanes);
    fixture.detectChanges();
  });

  afterEach(() => backend.verify());

  async function responder(contrataciones: unknown[]): Promise<void> {
    backend.expectOne('/api/contrataciones/mias').flush(contrataciones);
    await fixture.whenStable();
  }

  it('muestra cada plan con su estado', async () => {
    await responder(CONTRATACIONES_MOCK.filter((c) => c.clienteId === 10));
    const insignias = Array.from(
      (fixture.nativeElement as HTMLElement).querySelectorAll('.contratacion .insignia'),
    ).map((insignia) => insignia.textContent?.trim());

    expect(insignias).toEqual(['Activa', 'Pendiente de instalación', 'Suspendida']);
  });

  it('explica por qué está suspendido y cómo reactivarlo', async () => {
    await responder(CONTRATACIONES_MOCK.filter((c) => c.clienteId === 10));
    const texto = textoEnPantalla(fixture);

    expect(texto).toContain('Suspendida el 03/11/2026 por falta de pago');
    expect(texto).toContain('Ver factura');
  });

  it('sin planes invita a contratar', async () => {
    await responder([]);
    expect(textoEnPantalla(fixture)).toContain('Todavía no contrataste ningún plan');
  });
});
