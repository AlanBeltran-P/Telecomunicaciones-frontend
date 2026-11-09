import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';
import { textoEnPantalla } from '../../../shared/testing/pantalla';
import { InicioEmpleado } from './inicio-empleado';

describe('InicioEmpleado', () => {
  let fixture: ComponentFixture<InicioEmpleado>;
  let backend: HttpTestingController;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      imports: [InicioEmpleado],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    });
    backend = TestBed.inject(HttpTestingController);
    TestBed.inject(AuthService).perfil.set({
      id: 2,
      nombre: 'Martín Ruiz',
      email: 'empleado@systematele.com',
      rol: 'EMPLEADO',
      dni: null,
      telefono: null,
    });
    fixture = TestBed.createComponent(InicioEmpleado);
    fixture.detectChanges();
    backend.expectOne('/api/clientes').flush([
      { id: 13, nombre: 'Diego Fernández', email: 'd@mail.com', dni: '1', telefono: '1', activo: true },
    ]);
    backend.expectOne('/api/instalaciones/pendientes').flush([
      { contratacionId: 7, clienteId: 13, planNombre: 'Fibra 300', direccion: 'Pellegrini 1200', fechaContratacion: '2026-10-30', tecnicoId: null, tecnicoNombre: null, estado: 'PENDIENTE_INSTALACION', fechaInstalacion: null },
    ]);
    backend.expectOne('/api/contrataciones/suspendidas').flush([]);
    await fixture.whenStable();
  });

  afterEach(() => backend.verify());

  it('saluda y muestra quién espera técnico con el nombre del cliente', () => {
    const texto = textoEnPantalla(fixture);
    expect(texto).toContain('Hola, Martín');
    expect(texto).toContain('Diego Fernández · Pellegrini 1200');
    expect(texto).toContain('Sin técnico');
  });

  it('sin suspendidas lo dice', () => {
    expect(textoEnPantalla(fixture)).toContain('No hay contrataciones suspendidas.');
  });
});
