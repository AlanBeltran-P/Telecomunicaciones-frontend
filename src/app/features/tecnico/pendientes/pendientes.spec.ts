import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Instalacion } from '../../../core/contrataciones/instalacion.model';
import { textoEnPantalla } from '../../../shared/testing/pantalla';
import { Pendientes } from './pendientes';

const PENDIENTE: Instalacion = {
  contratacionId: 2,
  clienteId: 10,
  planNombre: 'Fibra + TV',
  direccion: 'Calle Falsa 742, Springfield',
  fechaContratacion: '2026-11-02',
  tecnicoId: 3,
  tecnicoNombre: 'Carlos Gómez',
  estado: 'PENDIENTE_INSTALACION',
  fechaInstalacion: null,
};

describe('Pendientes del técnico', () => {
  let fixture: ComponentFixture<Pendientes>;
  let backend: HttpTestingController;

  async function abrirCon(lista: Instalacion[]): Promise<void> {
    fixture = TestBed.createComponent(Pendientes);
    fixture.detectChanges();
    backend.expectOne('/api/instalaciones/mias').flush(lista);
    await fixture.whenStable();
  }

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [Pendientes],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    backend = TestBed.inject(HttpTestingController);
  });

  afterEach(() => backend.verify());

  it('muestra dirección, plan y fecha de cada instalación', async () => {
    await abrirCon([PENDIENTE]);
    const texto = textoEnPantalla(fixture);
    expect(texto).toContain('Calle Falsa 742, Springfield');
    expect(texto).toContain('Fibra + TV · contratado el 02/11/2026');
  });

  it('al marcarla realizada queda como instalada', async () => {
    await abrirCon([PENDIENTE]);
    (fixture.nativeElement.querySelector('.trabajo button') as HTMLButtonElement).click();
    fixture.detectChanges();

    backend
      .expectOne({ method: 'PUT', url: '/api/instalaciones/2/realizada' })
      .flush({ ...PENDIENTE, estado: 'ACTIVA', fechaInstalacion: '2026-11-09' });
    await fixture.whenStable();

    expect(textoEnPantalla(fixture)).toContain('Instalada');
    expect(fixture.nativeElement.querySelector('.trabajo button')).toBeNull();
  });

  it('sin pendientes lo dice', async () => {
    await abrirCon([]);
    expect(textoEnPantalla(fixture)).toContain('No tenés instalaciones pendientes');
  });
});
