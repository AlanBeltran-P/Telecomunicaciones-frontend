import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Instalacion } from '../../../core/contrataciones/instalacion.model';
import { textoEnPantalla } from '../../../shared/testing/pantalla';
import { Instalaciones } from './instalaciones';

const SIN_TECNICO: Instalacion = {
  contratacionId: 7,
  clienteId: 13,
  planNombre: 'Fibra 300',
  direccion: 'Av. Pellegrini 1200, Rosario',
  fechaContratacion: '2026-10-30',
  tecnicoId: null,
  tecnicoNombre: null,
  estado: 'PENDIENTE_INSTALACION',
  fechaInstalacion: null,
};
const TECNICOS = [
  { id: 3, nombre: 'Carlos Gómez', email: 'c@st.com', rol: 'TECNICO', activo: true },
  { id: 4, nombre: 'Sofía Díaz', email: 's@st.com', rol: 'TECNICO', activo: true },
];

describe('Instalaciones', () => {
  let fixture: ComponentFixture<Instalaciones>;
  let backend: HttpTestingController;

  async function abrirCon(pendientes: Instalacion[]): Promise<void> {
    fixture = TestBed.createComponent(Instalaciones);
    fixture.detectChanges();
    backend.expectOne('/api/instalaciones/pendientes').flush(pendientes);
    backend.expectOne('/api/tecnicos').flush(TECNICOS);
    backend.expectOne('/api/clientes').flush([{ id: 13, nombre: 'Diego Fernández' }]);
    await fixture.whenStable();
  }

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [Instalaciones],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    backend = TestBed.inject(HttpTestingController);
  });

  afterEach(() => backend.verify());

  it('muestra cada instalación con el nombre del cliente', async () => {
    await abrirCon([SIN_TECNICO]);
    const texto = textoEnPantalla(fixture);
    expect(texto).toContain('Diego Fernández · Av. Pellegrini 1200, Rosario');
    expect(texto).toContain('Sin técnico');
  });

  it('asigna el técnico elegido', async () => {
    await abrirCon([SIN_TECNICO]);
    const pantalla = fixture.nativeElement as HTMLElement;
    const selector = pantalla.querySelector('select') as HTMLSelectElement;
    selector.value = '4';
    (pantalla.querySelector('.instalacion__asignar button') as HTMLButtonElement).click();
    fixture.detectChanges();

    const pedido = backend.expectOne({ method: 'PUT', url: '/api/instalaciones/7/tecnico' });
    expect(pedido.request.body).toEqual({ tecnicoId: 4 });
    pedido.flush({ ...SIN_TECNICO, tecnicoId: 4, tecnicoNombre: 'Sofía Díaz' });
    await fixture.whenStable();

    expect(textoEnPantalla(fixture)).toContain('Técnico asignado');
  });

  it('sin elegir un técnico no manda nada', async () => {
    await abrirCon([SIN_TECNICO]);
    (fixture.nativeElement.querySelector('.instalacion__asignar button') as HTMLButtonElement).click();
    backend.expectNone('/api/instalaciones/7/tecnico');
  });

  it('sin pendientes lo dice', async () => {
    await abrirCon([]);
    expect(textoEnPantalla(fixture)).toContain('No hay instalaciones pendientes');
  });
});
