import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Cliente } from '../../../core/clientes/cliente.model';
import { textoEnPantalla } from '../../../shared/testing/pantalla';
import { Clientes } from './clientes';

const ANA: Cliente = { id: 10, nombre: 'Ana Pérez', email: 'cliente@systematele.com', dni: '35123456', telefono: '11 5555-1234', activo: true };
const DIEGO: Cliente = { id: 13, nombre: 'Diego Fernández', email: 'diego.f@mail.com', dni: '33999888', telefono: '341 555-2020', activo: false };

describe('Clientes', () => {
  let fixture: ComponentFixture<Clientes>;
  let backend: HttpTestingController;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      imports: [Clientes],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    });
    backend = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(Clientes);
    fixture.detectChanges();
    backend.expectOne('/api/clientes').flush([ANA, DIEGO]);
    await fixture.whenStable();
  });

  afterEach(() => backend.verify());

  it('lista los clientes con su estado y el enlace a la ficha', () => {
    const texto = textoEnPantalla(fixture);
    expect(texto).toContain('Ana Pérez');
    expect(texto).toContain('Inactivo');
    const enlace = (fixture.nativeElement as HTMLElement).querySelector('tbody a');
    expect(enlace?.getAttribute('href')).toBe('/empleado/clientes/10');
  });

  it('al escribir busca en el backend', async () => {
    const input = (fixture.nativeElement as HTMLElement).querySelector('input') as HTMLInputElement;
    input.value = 'diego';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    const pedido = backend.expectOne((req) => req.url === '/api/clientes');
    expect(pedido.request.params.get('busqueda')).toBe('diego');
    pedido.flush([DIEGO]);
    await fixture.whenStable();

    expect(textoEnPantalla(fixture)).not.toContain('Ana Pérez');
  });

  it('sin resultados lo dice', async () => {
    const input = (fixture.nativeElement as HTMLElement).querySelector('input') as HTMLInputElement;
    input.value = 'zzz';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    backend.expectOne((req) => req.url === '/api/clientes').flush([]);
    await fixture.whenStable();

    expect(textoEnPantalla(fixture)).toContain('No encontramos clientes');
  });
});
