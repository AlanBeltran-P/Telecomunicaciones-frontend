import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Plan } from '../../../core/planes/plan.model';
import { FORMATO_ARGENTINO } from '../../../shared/testing/formato-argentino';
import { clickEnBoton, escribir, textoEnPantalla } from '../../../shared/testing/pantalla';
import { PlanesAdmin } from './planes-admin';

const PLANES: Plan[] = [
  { id: 1, nombre: 'Fibra 300', descripcion: '300 Mb simétricos', precio: 18500 },
  { id: 4, nombre: 'Móvil 20 GB', descripcion: null, precio: 9900 },
];

describe('PlanesAdmin', () => {
  let fixture: ComponentFixture<PlanesAdmin>;
  let backend: HttpTestingController;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      imports: [PlanesAdmin],
      providers: [provideHttpClient(), provideHttpClientTesting(), FORMATO_ARGENTINO],
    });
    backend = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(PlanesAdmin);
    fixture.detectChanges();
    backend.expectOne('/api/planes').flush(PLANES);
    await fixture.whenStable();
  });

  afterEach(() => backend.verify());

  /** Enviar manda un pedido: no se espera la pantalla estable hasta responderlo. */
  function enviarFormulario(): void {
    (fixture.nativeElement.querySelector('form') as HTMLFormElement).dispatchEvent(new Event('submit'));
    fixture.detectChanges();
  }

  it('muestra cada plan con su precio y descripción', () => {
    const texto = textoEnPantalla(fixture);
    expect(texto).toContain('Fibra 300');
    expect(texto).toContain('18.500');
    expect(texto).toContain('Sin descripción.');
  });

  it('edita un plan con sus datos cargados', async () => {
    await clickEnBoton(fixture, 'Editar');
    const nombre = fixture.nativeElement.querySelector('input[name="nombre"]') as HTMLInputElement;
    expect(nombre.value).toBe('Fibra 300');

    await escribir(fixture, 'nombre', 'Fibra 350');
    enviarFormulario();

    const pedido = backend.expectOne({ method: 'PUT', url: '/api/planes/1' });
    expect(pedido.request.body).toEqual({ nombre: 'Fibra 350', descripcion: '300 Mb simétricos', precio: 18500 });
    pedido.flush({ ...PLANES[0], nombre: 'Fibra 350' });
    await fixture.whenStable();
    expect(textoEnPantalla(fixture)).toContain('Fibra 350');
  });

  it('crea un plan nuevo sin descripción', async () => {
    await clickEnBoton(fixture, '+ Nuevo plan');
    await escribir(fixture, 'nombre', 'Empresas 1000');
    await escribir(fixture, 'precio', '78000');
    enviarFormulario();

    const pedido = backend.expectOne({ method: 'POST', url: '/api/planes' });
    expect(pedido.request.body).toEqual({ nombre: 'Empresas 1000', descripcion: null, precio: 78000 });
    pedido.flush({ id: 9, nombre: 'Empresas 1000', descripcion: null, precio: 78000 });
    await fixture.whenStable();
    expect(textoEnPantalla(fixture)).toContain('Empresas 1000');
  });

  it('sin precio no guarda', async () => {
    await clickEnBoton(fixture, '+ Nuevo plan');
    await escribir(fixture, 'nombre', 'Gratis');
    enviarFormulario();
    await fixture.whenStable();

    backend.expectNone('/api/planes');
    expect(textoEnPantalla(fixture)).toContain('Ingresá un precio mayor a cero.');
  });

  it('da de baja un plan después de confirmar y lo saca de la lista', async () => {
    await clickEnBoton(fixture, 'Dar de baja');
    const modal = (fixture.nativeElement as HTMLElement).querySelector('.modal--abierto') as HTMLElement;
    expect(modal.textContent).toContain('Los clientes que ya lo tienen lo siguen teniendo.');
    (modal.querySelector('.boton--peligro') as HTMLButtonElement).click();
    fixture.detectChanges();

    backend.expectOne({ method: 'DELETE', url: '/api/planes/1' }).flush(null);
    await fixture.whenStable();
    const nombres = Array.from(fixture.nativeElement.querySelectorAll('.plan-admin .tarjeta__titulo')).map(
      (titulo) => (titulo as HTMLElement).textContent?.trim(),
    );
    expect(nombres).toEqual(['Móvil 20 GB']);
  });
});
