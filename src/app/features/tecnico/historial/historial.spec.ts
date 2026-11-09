import { formatDate } from '@angular/common';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { Instalacion } from '../../../core/contrataciones/instalacion.model';
import { textoEnPantalla } from '../../../shared/testing/pantalla';
import { Historial } from './historial';

const HOY = formatDate(new Date(), 'yyyy-MM-dd', 'en');

function hecha(id: number, fechaInstalacion: string): Instalacion {
  return {
    contratacionId: id,
    clienteId: 10,
    planNombre: 'Fibra 300',
    direccion: `Calle ${id}`,
    fechaContratacion: '2026-01-01',
    tecnicoId: 3,
    tecnicoNombre: 'Carlos Gómez',
    estado: 'ACTIVA',
    fechaInstalacion,
  };
}

describe('Historial del técnico', () => {
  let fixture: ComponentFixture<Historial>;
  let backend: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [Historial],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    backend = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(Historial);
    fixture.detectChanges();
  });

  afterEach(() => {
    backend.verify();
    vi.unstubAllGlobals();
  });

  it('cuenta las de este mes y las de siempre', async () => {
    // Sin animación los números aparecen directo
    vi.stubGlobal('requestAnimationFrame', undefined);
    backend.expectOne('/api/instalaciones/realizadas').flush([hecha(1, HOY), hecha(2, '2020-03-15')]);
    await fixture.whenStable();

    const valores = Array.from(
      (fixture.nativeElement as HTMLElement).querySelectorAll('.kpi__valor'),
    ).map((valor) => valor.textContent?.trim());
    expect(valores).toEqual(['1', '2']);
    expect(textoEnPantalla(fixture)).toContain('Calle 2');
  });

  it('sin instalaciones lo dice', async () => {
    backend.expectOne('/api/instalaciones/realizadas').flush([]);
    await fixture.whenStable();
    expect(textoEnPantalla(fixture)).toContain('Todavía no hiciste instalaciones');
  });
});
