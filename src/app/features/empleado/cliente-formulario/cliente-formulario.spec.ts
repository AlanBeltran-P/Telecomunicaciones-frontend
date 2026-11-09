import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { Cliente } from '../../../core/clientes/cliente.model';
import { escribir, textoEnPantalla } from '../../../shared/testing/pantalla';
import { ClienteFormulario } from './cliente-formulario';

const ANA: Cliente = { id: 10, nombre: 'Ana Pérez', email: 'cliente@systematele.com', dni: '35123456', telefono: '11 5555-1234', activo: true };

describe('ClienteFormulario', () => {
  let fixture: ComponentFixture<ClienteFormulario>;
  let backend: HttpTestingController;

  async function abrir(cliente: Cliente | null): Promise<void> {
    fixture = TestBed.createComponent(ClienteFormulario);
    fixture.componentRef.setInput('cliente', cliente);
    fixture.componentRef.setInput('abierto', true);
    await fixture.whenStable();
  }

  /** Enviar manda un pedido: no se espera la pantalla estable hasta responderlo. */
  function enviar(): void {
    (fixture.nativeElement.querySelector('form') as HTMLFormElement).dispatchEvent(new Event('submit'));
    fixture.detectChanges();
  }

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ClienteFormulario],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    backend = TestBed.inject(HttpTestingController);
  });

  afterEach(() => backend.verify());

  it('da de alta un cliente con su contraseña inicial', async () => {
    await abrir(null);
    const guardado = vi.fn();
    fixture.componentInstance.guardado.subscribe(guardado);
    await escribir(fixture, 'nombre', 'Pablo Sosa');
    await escribir(fixture, 'email', 'pablo@mail.com');
    await escribir(fixture, 'contrasena', 'secreta123');
    await escribir(fixture, 'dni', '30111222');
    await escribir(fixture, 'telefono', '11 4000-1000');
    enviar();

    const pedido = backend.expectOne({ method: 'POST', url: '/api/clientes' });
    expect(pedido.request.body).toEqual({
      nombre: 'Pablo Sosa',
      email: 'pablo@mail.com',
      contrasena: 'secreta123',
      dni: '30111222',
      telefono: '11 4000-1000',
    });
    pedido.flush({ ...ANA, id: 99, nombre: 'Pablo Sosa' });
    await fixture.whenStable();

    expect(guardado).toHaveBeenCalledWith(expect.objectContaining({ id: 99 }));
  });

  it('con datos inválidos no envía', async () => {
    await abrir(null);
    await escribir(fixture, 'dni', '12');
    enviar();
    await fixture.whenStable();

    backend.expectNone('/api/clientes');
    expect(textoEnPantalla(fixture)).toContain('Tiene que tener 7 u 8 números.');
  });

  it('edita sin pedir la contraseña', async () => {
    await abrir(ANA);
    expect(fixture.nativeElement.querySelector('input[name="contrasena"]')).toBeNull();
    expect((fixture.nativeElement.querySelector('input[name="nombre"]') as HTMLInputElement).value).toBe('Ana Pérez');

    await escribir(fixture, 'telefono', '11 6000-0000');
    enviar();

    const pedido = backend.expectOne({ method: 'PUT', url: '/api/clientes/10' });
    expect(pedido.request.body).toEqual({
      nombre: 'Ana Pérez',
      email: 'cliente@systematele.com',
      dni: '35123456',
      telefono: '11 6000-0000',
    });
    pedido.flush(ANA);
  });

  it('muestra el error del backend', async () => {
    await abrir(ANA);
    enviar();
    backend
      .expectOne('/api/clientes/10')
      .flush({ detail: 'El DNI 35123456 ya está registrado' }, { status: 409, statusText: 'Conflict' });
    await fixture.whenStable();

    expect(textoEnPantalla(fixture)).toContain('El DNI 35123456 ya está registrado');
  });
});
