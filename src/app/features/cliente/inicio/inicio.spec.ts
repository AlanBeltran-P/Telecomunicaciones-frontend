import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';
import { CONTRATACIONES_MOCK } from '../../../core/mock/datos/contrataciones.mock';
import { FACTURAS_MOCK } from '../../../core/mock/datos/facturas.mock';
import { FORMATO_ARGENTINO } from '../../../shared/testing/formato-argentino';
import { textoEnPantalla } from '../../../shared/testing/pantalla';
import { Inicio } from './inicio';

const CONTRATACIONES_DE_ANA = CONTRATACIONES_MOCK.filter((c) => c.clienteId === 10);
const FACTURAS_DE_ANA = FACTURAS_MOCK.filter((f) => f.clienteId === 10);

describe('Inicio del cliente', () => {
  let fixture: ComponentFixture<Inicio>;
  let backend: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [Inicio],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting(), FORMATO_ARGENTINO],
    });
    backend = TestBed.inject(HttpTestingController);
    TestBed.inject(AuthService).perfil.set({
      id: 10,
      nombre: 'Ana Pérez',
      email: 'cliente@systematele.com',
      rol: 'CLIENTE',
      dni: '35123456',
      telefono: null,
    });
    fixture = TestBed.createComponent(Inicio);
    fixture.detectChanges();
  });

  afterEach(() => backend.verify());

  async function responder(contrataciones: unknown[], facturas: unknown[], conDebito: boolean): Promise<void> {
    backend.expectOne('/api/contrataciones/mias').flush(contrataciones);
    backend.expectOne('/api/facturas/mias').flush(facturas);
    const debito = backend.expectOne('/api/facturas/debito-automatico');
    if (conDebito) {
      debito.flush({ medio: 'PAYPAL', fechaAlta: '2026-11-01' });
    } else {
      debito.flush({ detail: 'No tenés el débito automático activado' }, { status: 404, statusText: 'Not Found' });
    }
    await fixture.whenStable();
  }

  it('saluda por el primer nombre', async () => {
    await responder([], [], true);
    expect(textoEnPantalla(fixture)).toContain('Hola, Ana');
  });

  it('muestra lo que debe y lo que requiere atención', async () => {
    await responder(CONTRATACIONES_DE_ANA, FACTURAS_DE_ANA, false);
    const texto = textoEnPantalla(fixture);

    expect(texto).toContain('46.400');
    expect(texto).toContain('Requiere tu atención');
    expect(texto).toContain('Factura de octubre vencida');
    expect(texto).toContain('Fibra 1000 suspendida');
    expect(texto).toContain('No agregaste un medio de pago');
    expect(texto).toContain('Tu instalación');
  });

  it('sin deudas y con débito activo está todo en orden', async () => {
    await responder([], [], true);
    expect(textoEnPantalla(fixture)).toContain('Todo en orden');
  });

  it('si falla algún pedido muestra un aviso', async () => {
    backend.expectOne('/api/contrataciones/mias').flush(null, { status: 500, statusText: 'Error' });
    backend.match('/api/facturas/mias');
    backend.match('/api/facturas/debito-automatico');
    await fixture.whenStable();

    expect(textoEnPantalla(fixture)).toContain('No pudimos cargar tu resumen');
  });
});
