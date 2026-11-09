import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { AuthService } from '../../../core/auth/auth.service';
import { Usuario } from '../../../core/usuarios/usuario.model';
import { textoEnPantalla } from '../../../shared/testing/pantalla';
import { ToastService } from '../../../shared/toast/toast.service';
import { Usuarios } from './usuarios';

const PERSONAL: Usuario[] = [
  { id: 1, nombre: 'Laura Méndez', email: 'admin@systematele.com', rol: 'ADMINISTRADOR', activo: true },
  { id: 2, nombre: 'Martín Ruiz', email: 'empleado@systematele.com', rol: 'EMPLEADO', activo: true },
  { id: 5, nombre: 'Pablo Rossi', email: 'pablo.rossi@systematele.com', rol: 'EMPLEADO', activo: false },
];

describe('Usuarios', () => {
  let fixture: ComponentFixture<Usuarios>;
  let backend: HttpTestingController;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      imports: [Usuarios],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    backend = TestBed.inject(HttpTestingController);
    TestBed.inject(AuthService).perfil.set({ ...PERSONAL[0], dni: null, telefono: null });
    fixture = TestBed.createComponent(Usuarios);
    fixture.detectChanges();
    backend.expectOne('/api/usuarios').flush(PERSONAL);
    await fixture.whenStable();
  });

  afterEach(() => backend.verify());

  function fila(nombre: string): HTMLElement {
    const filas = Array.from((fixture.nativeElement as HTMLElement).querySelectorAll<HTMLElement>('tbody tr'));
    return filas.find((f) => f.textContent?.includes(nombre)) as HTMLElement;
  }

  it('el administrador no puede cambiarse el rol ni desactivarse', () => {
    const propia = fila('Laura Méndez');
    expect(propia.textContent).toContain('(vos)');
    expect((propia.querySelector('select') as HTMLSelectElement).disabled).toBe(true);
    expect(propia.querySelector('button')).toBeNull();
  });

  it('un usuario inactivo no se puede editar', () => {
    const inactivo = fila('Pablo Rossi');
    expect(inactivo.textContent).toContain('Inactivo');
    expect((inactivo.querySelector('select') as HTMLSelectElement).disabled).toBe(true);
  });

  it('cambia el rol al elegir otro', async () => {
    const selector = fila('Martín Ruiz').querySelector('select') as HTMLSelectElement;
    selector.value = 'TECNICO';
    selector.dispatchEvent(new Event('change'));

    const pedido = backend.expectOne({ method: 'PUT', url: '/api/usuarios/2/rol' });
    expect(pedido.request.body).toEqual({ rol: 'TECNICO' });
    pedido.flush({ ...PERSONAL[1], rol: 'TECNICO' });
    await fixture.whenStable();
  });

  it('si el backend rechaza el cambio, vuelve al rol que tenía', async () => {
    const toast = vi.spyOn(TestBed.inject(ToastService), 'mostrar');
    const selector = fila('Martín Ruiz').querySelector('select') as HTMLSelectElement;
    selector.value = 'ADMINISTRADOR';
    selector.dispatchEvent(new Event('change'));

    backend
      .expectOne('/api/usuarios/2/rol')
      .flush({ detail: 'No se pudo' }, { status: 400, statusText: 'Bad Request' });
    await fixture.whenStable();

    expect(selector.value).toBe('EMPLEADO');
    expect(toast).toHaveBeenCalledWith('No se pudo');
  });

  it('desactiva después de confirmar', async () => {
    (fila('Martín Ruiz').querySelector('button') as HTMLButtonElement).click();
    await fixture.whenStable();
    expect(textoEnPantalla(fixture)).toContain('Martín Ruiz no va a poder entrar más al sistema.');

    const modal = (fixture.nativeElement as HTMLElement).querySelector('.modal--abierto') as HTMLElement;
    (modal.querySelector('.boton--peligro') as HTMLButtonElement).click();
    fixture.detectChanges();

    backend.expectOne({ method: 'PUT', url: '/api/usuarios/2/desactivar' }).flush(null);
    await fixture.whenStable();
    expect(fila('Martín Ruiz').textContent).toContain('Inactivo');
  });
});
