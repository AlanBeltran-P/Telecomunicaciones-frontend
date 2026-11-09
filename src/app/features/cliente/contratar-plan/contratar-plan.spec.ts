import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { vi } from 'vitest';
import { Plan } from '../../../core/planes/plan.model';
import { FORMATO_ARGENTINO } from '../../../shared/testing/formato-argentino';
import { escribir, textoEnPantalla } from '../../../shared/testing/pantalla';
import { ContratarPlan } from './contratar-plan';

const PLANES: Plan[] = [
  { id: 1, nombre: 'Fibra 300', descripcion: null, precio: 18500 },
  { id: 4, nombre: 'Móvil 20 GB', descripcion: null, precio: 9900 },
];

describe('ContratarPlan', () => {
  let fixture: ComponentFixture<ContratarPlan>;
  let backend: HttpTestingController;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      imports: [ContratarPlan],
      providers: [
        provideRouter([{ path: 'cliente/planes', children: [] }]),
        provideHttpClient(),
        provideHttpClientTesting(),
        FORMATO_ARGENTINO,
      ],
    });
    backend = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(ContratarPlan);
    fixture.componentRef.setInput('abierto', true);
    fixture.detectChanges();
    backend.expectOne('/api/planes').flush(PLANES);
    await fixture.whenStable();
  });

  afterEach(() => backend.verify());

  function elegirPlan(nombre: string): void {
    const select = (fixture.nativeElement as HTMLElement).querySelector('select') as HTMLSelectElement;
    const opcion = Array.from(select.options).find((o) => o.textContent?.includes(nombre));
    select.value = opcion?.value ?? '';
    select.dispatchEvent(new Event('change'));
  }

  /** Enviar manda un pedido: no se espera la pantalla estable hasta responderlo. */
  function enviar(): void {
    const formulario = (fixture.nativeElement as HTMLElement).querySelector('form') as HTMLFormElement;
    formulario.dispatchEvent(new Event('submit'));
    fixture.detectChanges();
  }

  it('ofrece los planes del catálogo con su precio', () => {
    expect(textoEnPantalla(fixture)).toContain('Móvil 20 GB');
    expect(textoEnPantalla(fixture)).toContain('9.900');
  });

  it('sin plan ni dirección no envía y marca los campos', async () => {
    enviar();
    await fixture.whenStable();

    backend.expectNone('/api/contrataciones');
    expect(textoEnPantalla(fixture)).toContain('Ingresá la dirección donde hacemos la instalación.');
  });

  it('contrata el plan elegido en la dirección indicada', async () => {
    const cerrado = vi.fn();
    fixture.componentInstance.cerrar.subscribe(cerrado);
    elegirPlan('Móvil 20 GB');
    await escribir(fixture, 'direccion', 'Mitre 10');
    enviar();

    const pedido = backend.expectOne({ method: 'POST', url: '/api/contrataciones' });
    expect(pedido.request.body).toEqual({ planId: 4, direccion: 'Mitre 10' });
    pedido.flush({}, { status: 201, statusText: 'Created' });
    await fixture.whenStable();

    expect(cerrado).toHaveBeenCalled();
  });

  it('si ya lo tiene muestra el mensaje del backend', async () => {
    elegirPlan('Fibra 300');
    await escribir(fixture, 'direccion', 'Mitre 10');
    enviar();

    backend
      .expectOne('/api/contrataciones')
      .flush({ detail: 'Ya tenés contratado el plan Fibra 300' }, { status: 409, statusText: 'Conflict' });
    await fixture.whenStable();

    expect(textoEnPantalla(fixture)).toContain('Ya tenés contratado el plan Fibra 300');
  });

  it('un empleado contrata para el cliente que se le pasa', async () => {
    fixture.componentRef.setInput('cliente', { id: 11, nombre: 'Juan Torres' });
    await fixture.whenStable();
    expect(textoEnPantalla(fixture)).toContain('Contratar para Juan Torres');

    elegirPlan('Móvil 20 GB');
    await escribir(fixture, 'direccion', 'Mitre 890');
    enviar();

    const pedido = backend.expectOne({ method: 'POST', url: '/api/contrataciones/clientes/11' });
    expect(pedido.request.body).toEqual({ planId: 4, direccion: 'Mitre 890' });
    pedido.flush({}, { status: 201, statusText: 'Created' });
    await fixture.whenStable();
  });
});
