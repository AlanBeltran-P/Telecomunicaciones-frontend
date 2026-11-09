import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { vi } from 'vitest';
import { Perfil } from '../../../core/auth/auth.model';
import { escribir, textoEnPantalla } from '../../../shared/testing/pantalla';
import { Acceso } from './acceso';

const ANA: Perfil = {
  id: 10,
  nombre: 'Ana Pérez',
  email: 'ana@mail.com',
  rol: 'CLIENTE',
  dni: '35123456',
  telefono: '11 5555-1234',
};

describe('Acceso', () => {
  let fixture: ComponentFixture<Acceso>;
  let backend: HttpTestingController;
  let router: Router;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      imports: [Acceso],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    });
    backend = TestBed.inject(HttpTestingController);
    router = TestBed.inject(Router);
    vi.spyOn(router, 'navigateByUrl').mockResolvedValue(true);
    fixture = TestBed.createComponent(Acceso);
    await fixture.whenStable();
  });

  afterEach(() => backend.verify());

  function botonEnviar(): HTMLButtonElement {
    return (fixture.nativeElement as HTMLElement).querySelector('button[type="submit"]')!;
  }

  async function completarIngreso(): Promise<void> {
    await escribir(fixture, 'email', 'ana@mail.com');
    await escribir(fixture, 'contrasena', 'secreta123');
  }

  // El pedido queda pendiente: se responde antes de esperar a que la pantalla esté estable
  async function responderLogin(): Promise<void> {
    backend.expectOne('/api/auth/login').flush({ id: 10, email: 'ana@mail.com', rol: 'CLIENTE' });
    backend.expectOne('/api/usuarios/yo').flush(ANA);
    await fixture.whenStable();
  }

  it('el botón Ingresar se habilita al completar email y contraseña', async () => {
    expect(botonEnviar().disabled).toBe(true);
    await completarIngreso();
    expect(botonEnviar().disabled).toBe(false);
  });

  it('al ingresar va a la pantalla de su rol', async () => {
    await completarIngreso();
    botonEnviar().click();
    await responderLogin();
    expect(router.navigateByUrl).toHaveBeenCalledWith('/cliente');
  });

  it('si venía de otra pantalla, vuelve ahí', async () => {
    fixture.componentRef.setInput('volver', '/cliente/facturas');
    await completarIngreso();
    botonEnviar().click();
    await responderLogin();
    expect(router.navigateByUrl).toHaveBeenCalledWith('/cliente/facturas');
  });

  it('muestra el error del backend', async () => {
    await completarIngreso();
    botonEnviar().click();
    backend
      .expectOne('/api/auth/login')
      .flush({ status: 401, detail: 'Email o contraseña incorrectos' }, { status: 401, statusText: 'Unauthorized' });
    await fixture.whenStable();
    expect(textoEnPantalla(fixture)).toContain('Email o contraseña incorrectos');
    expect(botonEnviar().disabled).toBe(false);
  });

  it('la ruta /registro abre la pestaña Crear cuenta', async () => {
    fixture.componentRef.setInput('pestana', 'registro');
    await fixture.whenStable();
    expect(textoEnPantalla(fixture)).toContain('Creá tu cuenta');
  });

  it('marca el DNI inválido al salir del campo', async () => {
    fixture.componentRef.setInput('pestana', 'registro');
    await fixture.whenStable();
    await escribir(fixture, 'dni', '12345');
    const dni = (fixture.nativeElement as HTMLElement).querySelector<HTMLInputElement>('input[name="dni"]')!;
    dni.dispatchEvent(new Event('blur'));
    await fixture.whenStable();
    expect(dni.closest('.campo')?.classList).toContain('campo--error');
    expect(textoEnPantalla(fixture)).toContain('Tiene que tener 7 u 8 números.');
  });

  it('al crear la cuenta queda logueado como cliente', async () => {
    fixture.componentRef.setInput('pestana', 'registro');
    await fixture.whenStable();
    await escribir(fixture, 'nombre', 'Ana Pérez');
    await escribir(fixture, 'email', 'ana@mail.com');
    await escribir(fixture, 'contrasena', 'secreta123');
    await escribir(fixture, 'dni', '35123456');
    await escribir(fixture, 'telefono', '11 5555-1234');
    botonEnviar().click();

    const registro = backend.expectOne('/api/auth/registro');
    expect(registro.request.body).toEqual({
      nombre: 'Ana Pérez',
      email: 'ana@mail.com',
      contrasena: 'secreta123',
      dni: '35123456',
      telefono: '11 5555-1234',
    });
    registro.flush({ id: 10, email: 'ana@mail.com', rol: 'CLIENTE' });
    backend.expectOne('/api/usuarios/yo').flush(ANA);
    await fixture.whenStable();
    expect(router.navigateByUrl).toHaveBeenCalledWith('/cliente');
  });

  it('sin modo mock no muestra las cuentas demo', () => {
    expect(textoEnPantalla(fixture)).not.toContain('Modo demo');
  });
});
