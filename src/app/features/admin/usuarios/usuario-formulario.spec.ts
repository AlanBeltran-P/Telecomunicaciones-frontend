import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { escribir, textoEnPantalla } from '../../../shared/testing/pantalla';
import { UsuarioFormulario } from './usuario-formulario';

describe('UsuarioFormulario', () => {
  let fixture: ComponentFixture<UsuarioFormulario>;
  let backend: HttpTestingController;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      imports: [UsuarioFormulario],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    backend = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(UsuarioFormulario);
    fixture.componentRef.setInput('abierto', true);
    await fixture.whenStable();
  });

  afterEach(() => backend.verify());

  /** Enviar manda un pedido: no se espera la pantalla estable hasta responderlo. */
  function enviar(): void {
    (fixture.nativeElement.querySelector('form') as HTMLFormElement).dispatchEvent(new Event('submit'));
    fixture.detectChanges();
  }

  it('solo ofrece roles del personal (los clientes se registran solos)', () => {
    const opciones = Array.from(
      (fixture.nativeElement as HTMLElement).querySelectorAll('select option'),
    ).map((opcion) => opcion.textContent?.trim());
    expect(opciones).toEqual(['Administrador', 'Empleado', 'Técnico']);
  });

  it('crea el usuario con el rol elegido', async () => {
    const creado = vi.fn();
    fixture.componentInstance.creado.subscribe(creado);
    await escribir(fixture, 'nombre', 'Julieta Sosa');
    await escribir(fixture, 'email', 'julieta@systematele.com');
    await escribir(fixture, 'contrasena', 'secreta123');
    const rol = fixture.nativeElement.querySelector('select') as HTMLSelectElement;
    rol.value = 'TECNICO';
    rol.dispatchEvent(new Event('change'));
    enviar();

    const pedido = backend.expectOne({ method: 'POST', url: '/api/usuarios' });
    expect(pedido.request.body).toEqual({
      nombre: 'Julieta Sosa',
      email: 'julieta@systematele.com',
      contrasena: 'secreta123',
      rol: 'TECNICO',
    });
    pedido.flush({ id: 9, nombre: 'Julieta Sosa', email: 'julieta@systematele.com', rol: 'TECNICO', activo: true });
    await fixture.whenStable();
    expect(creado).toHaveBeenCalled();
  });

  it('con la contraseña corta no envía', async () => {
    await escribir(fixture, 'nombre', 'Julieta Sosa');
    await escribir(fixture, 'email', 'julieta@systematele.com');
    await escribir(fixture, 'contrasena', 'corta');
    enviar();
    await fixture.whenStable();

    backend.expectNone('/api/usuarios');
    expect(textoEnPantalla(fixture)).toContain('Tiene que tener al menos 8 caracteres.');
  });
});
