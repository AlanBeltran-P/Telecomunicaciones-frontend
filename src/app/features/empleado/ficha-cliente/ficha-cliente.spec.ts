import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { PlanService } from '../../../core/planes/plan.service';
import { CONTRATACIONES_MOCK } from '../../../core/mock/datos/contrataciones.mock';
import { clickEnBoton, textoEnPantalla } from '../../../shared/testing/pantalla';
import { FichaCliente } from './ficha-cliente';

const ANA = { id: 10, nombre: 'Ana Pérez', email: 'cliente@systematele.com', dni: '35123456', telefono: '11 5555-1234', activo: true };
const DE_ANA = CONTRATACIONES_MOCK.filter((c) => c.clienteId === 10);

describe('FichaCliente', () => {
  let fixture: ComponentFixture<FichaCliente>;
  let backend: HttpTestingController;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      imports: [FichaCliente],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        // El modal de contratar pide el catálogo: acá no hace falta
        { provide: PlanService, useValue: { listar: () => of([]) } },
      ],
    });
    backend = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(FichaCliente);
    fixture.componentRef.setInput('id', '10');
    fixture.detectChanges();
    backend.expectOne('/api/clientes/10').flush(ANA);
    backend.expectOne('/api/contrataciones/clientes/10').flush(DE_ANA);
    await fixture.whenStable();
  });

  afterEach(() => backend.verify());

  /** Botón que manda un pedido: no se espera la pantalla estable hasta responderlo. */
  function tocar(texto: string): void {
    const botones = Array.from((fixture.nativeElement as HTMLElement).querySelectorAll('button'));
    botones.find((boton) => boton.textContent?.trim() === texto)?.click();
    fixture.detectChanges();
  }

  it('muestra los datos del cliente y sus contrataciones', () => {
    const texto = textoEnPantalla(fixture);
    expect(texto).toContain('Ana Pérez');
    expect(texto).toContain('35123456');
    expect(texto).toContain('Fibra 1000');
    expect(texto).toContain('suspendida el 03/11/2026');
  });

  it('reactiva una contratación suspendida', async () => {
    tocar('Reactivar');
    backend
      .expectOne({ method: 'PUT', url: '/api/contrataciones/3/reactivacion' })
      .flush({ ...DE_ANA[2], estado: 'ACTIVA', fechaSuspension: null });
    await fixture.whenStable();

    expect(textoEnPantalla(fixture)).not.toContain('Reactivar');
  });

  it('pide confirmación antes de dar de baja', async () => {
    await clickEnBoton(fixture, 'Dar de baja');
    backend.expectNone('/api/contrataciones/1/baja');
    expect(textoEnPantalla(fixture)).toContain('¿Dar de baja el plan?');

    const modal = (fixture.nativeElement as HTMLElement).querySelector('.modal--abierto') as HTMLElement;
    (modal.querySelector('.boton--peligro') as HTMLButtonElement).click();
    fixture.detectChanges();

    backend
      .expectOne({ method: 'PUT', url: '/api/contrataciones/1/baja' })
      .flush({ ...DE_ANA[0], estado: 'BAJA', fechaBaja: '2026-11-09' });
    await fixture.whenStable();
    expect(textoEnPantalla(fixture)).toContain('Dada de baja');
  });
});
