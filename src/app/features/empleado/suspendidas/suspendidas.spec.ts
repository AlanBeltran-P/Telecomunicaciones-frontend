import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { CONTRATACIONES_MOCK } from '../../../core/mock/datos/contrataciones.mock';
import { textoEnPantalla } from '../../../shared/testing/pantalla';
import { Suspendidas } from './suspendidas';

const SUSPENDIDA = CONTRATACIONES_MOCK[2];

describe('Suspendidas', () => {
  let fixture: ComponentFixture<Suspendidas>;
  let backend: HttpTestingController;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      imports: [Suspendidas],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    });
    backend = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(Suspendidas);
    fixture.detectChanges();
    backend.expectOne('/api/contrataciones/suspendidas').flush([SUSPENDIDA]);
    backend.expectOne('/api/clientes').flush([{ id: 10, nombre: 'Ana Pérez' }]);
    await fixture.whenStable();
  });

  afterEach(() => backend.verify());

  it('muestra cliente, plan y fecha de la suspensión', () => {
    const fila = (fixture.nativeElement as HTMLElement).querySelector('tbody tr')?.textContent ?? '';
    expect(fila).toContain('Ana Pérez');
    expect(fila).toContain('Fibra 1000');
    expect(fila).toContain('03/11/2026');
  });

  it('al reactivar la fila pasa a activa', async () => {
    (fixture.nativeElement.querySelector('tbody button') as HTMLButtonElement).click();
    fixture.detectChanges();

    backend
      .expectOne({ method: 'PUT', url: '/api/contrataciones/3/reactivacion' })
      .flush({ ...SUSPENDIDA, estado: 'ACTIVA', fechaSuspension: null });
    await fixture.whenStable();

    expect(textoEnPantalla(fixture)).toContain('Activa');
    expect(fixture.nativeElement.querySelector('tbody button')).toBeNull();
  });
});
