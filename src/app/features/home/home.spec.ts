import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';
import { Plan } from '../../core/planes/plan.model';
import { FORMATO_ARGENTINO } from '../../shared/testing/formato-argentino';
import { textoEnPantalla } from '../../shared/testing/pantalla';
import { Home } from './home';

const PLANES: Plan[] = [
  { id: 2, nombre: 'Fibra 1000', descripcion: '1 Gb simétrico', precio: 27900 },
  { id: 1, nombre: 'Fibra 300', descripcion: '300 Mb simétricos', precio: 18500 },
  { id: 3, nombre: 'Fibra + TV', descripcion: 'Fibra y 120 canales', precio: 34200 },
];

describe('Home', () => {
  let fixture: ComponentFixture<Home>;
  let backend: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [Home],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        FORMATO_ARGENTINO,
      ],
    });
    backend = TestBed.inject(HttpTestingController);
  });

  afterEach(() => backend.verify());

  // El pedido de planes queda pendiente: no se espera a que la pantalla esté estable antes de responderlo
  function abrir(): void {
    fixture = TestBed.createComponent(Home);
    fixture.detectChanges();
  }

  async function responderPlanes(planes: Plan[]): Promise<void> {
    backend.expectOne('/api/planes').flush(planes);
    await fixture.whenStable();
  }

  function todos(selector: string): HTMLElement[] {
    return Array.from((fixture.nativeElement as HTMLElement).querySelectorAll(selector));
  }

  it('muestra esqueletos mientras cargan los planes', async () => {
    abrir();
    expect(todos('.plan-esqueleto').length).toBe(3);
    await responderPlanes([]);
  });

  it('ordena los planes por precio y recomienda el del medio', async () => {
    abrir();
    await responderPlanes(PLANES);

    const nombres = todos('.plan__nombre').map((nombre) => nombre.textContent);
    expect(nombres).toEqual(['Fibra 300', 'Fibra 1000', 'Fibra + TV']);
    const recomendado = todos('.plan').find((plan) => plan.querySelector('.plan__cinta'));
    expect(recomendado?.querySelector('.plan__nombre')?.textContent).toBe('Fibra 1000');
    expect(todos('.plan__precio')[0].textContent).toMatch(/\$\s18\.500/);
  });

  it('avisa si no se pudieron cargar los planes', async () => {
    abrir();
    backend.expectOne('/api/planes').flush(null, { status: 500, statusText: 'Error' });
    await fixture.whenStable();
    expect(textoEnPantalla(fixture)).toContain('No pudimos cargar los planes');
  });

  it('sin sesión ofrece ingresar y crear cuenta', async () => {
    abrir();
    await responderPlanes(PLANES);
    const acciones = todos('.navegacion__acciones a').map((a) => a.textContent?.trim());
    expect(acciones).toEqual(['Ingresar', 'Crear cuenta']);
    expect(todos('.plan a')[0].getAttribute('href')).toBe('/registro');
  });

  it('con sesión lleva a la cuenta del usuario', async () => {
    TestBed.inject(AuthService).perfil.set({
      id: 10,
      nombre: 'Ana Pérez',
      email: 'ana@mail.com',
      rol: 'CLIENTE',
      dni: null,
      telefono: null,
    });
    abrir();
    await responderPlanes(PLANES);
    const acciones = todos('.navegacion__acciones a');
    expect(acciones.map((a) => a.textContent?.trim())).toEqual(['Mi cuenta']);
    expect(acciones[0].getAttribute('href')).toBe('/cliente');
  });
});
