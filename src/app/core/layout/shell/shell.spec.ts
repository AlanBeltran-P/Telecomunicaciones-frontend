import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { vi } from 'vitest';
import { AuthService } from '../../auth/auth.service';
import { clickEnBoton, textoEnPantalla } from '../../../shared/testing/pantalla';
import { Shell } from './shell';

describe('Shell', () => {
  let fixture: ComponentFixture<Shell>;
  let auth: AuthService;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      imports: [Shell],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    });
    auth = TestBed.inject(AuthService);
    auth.perfil.set({ id: 10, nombre: 'Ana Pérez', email: 'ana@mail.com', rol: 'CLIENTE', dni: null, telefono: null });
    fixture = TestBed.createComponent(Shell);
    fixture.componentRef.setInput('menu', [
      { ruta: 'inicio', texto: 'Inicio', icono: 'inicio' },
      { ruta: 'facturas', texto: 'Facturas', icono: 'factura' },
    ]);
    await fixture.whenStable();
  });

  function elemento(selector: string): HTMLElement {
    return (fixture.nativeElement as HTMLElement).querySelector(selector) as HTMLElement;
  }

  function menuPerfilAbierto(): boolean {
    return elemento('.desplegable').classList.contains('desplegable--abierto');
  }

  it('muestra el menú del rol', () => {
    const items = Array.from((fixture.nativeElement as HTMLElement).querySelectorAll('.menu__item'));
    expect(items.map((item) => item.textContent?.trim())).toEqual(['Inicio', 'Facturas']);
  });

  it('muestra el nombre, las iniciales y el rol', () => {
    expect(elemento('.avatar').textContent).toBe('AP');
    expect(elemento('.perfil__nombre').textContent).toBe('Ana Pérez');
    expect(elemento('.perfil__rol').textContent).toBe('Cliente');
  });

  it('el avatar abre el menú de perfil y se cierra tocando afuera', async () => {
    elemento('.perfil').click();
    await fixture.whenStable();
    expect(menuPerfilAbierto()).toBe(true);

    document.body.click();
    await fixture.whenStable();
    expect(menuPerfilAbierto()).toBe(false);
  });

  it('cerrar sesión pide confirmación antes de salir', async () => {
    const cerrarSesion = vi.spyOn(auth, 'cerrarSesion').mockImplementation(() => {});

    await clickEnBoton(fixture, 'Cerrar sesión');
    expect(elemento('.modal').classList).toContain('modal--abierto');
    expect(textoEnPantalla(fixture)).toContain('¿Cerrar sesión?');
    expect(cerrarSesion).not.toHaveBeenCalled();

    elemento('.modal .boton--primario').click();
    await fixture.whenStable();
    expect(cerrarSesion).toHaveBeenCalled();
    expect(elemento('.modal').classList).not.toContain('modal--abierto');
  });
});
