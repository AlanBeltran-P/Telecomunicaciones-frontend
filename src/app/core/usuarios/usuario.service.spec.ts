import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { UsuarioService } from './usuario.service';

describe('UsuarioService', () => {
  let servicio: UsuarioService;
  let backend: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    servicio = TestBed.inject(UsuarioService);
    backend = TestBed.inject(HttpTestingController);
  });

  afterEach(() => backend.verify());

  it('pide los técnicos activos', () => {
    servicio.tecnicosActivos().subscribe();
    backend.expectOne({ method: 'GET', url: '/api/tecnicos' }).flush([]);
  });

  it('lista y crea personal', () => {
    servicio.listar().subscribe();
    backend.expectOne({ method: 'GET', url: '/api/usuarios' }).flush([]);

    const nuevo = { nombre: 'Pablo', email: 'pablo@systematele.com', contrasena: 'secreta123', rol: 'TECNICO' as const };
    servicio.crear(nuevo).subscribe();
    const alta = backend.expectOne({ method: 'POST', url: '/api/usuarios' });
    expect(alta.request.body).toEqual(nuevo);
    alta.flush({});
  });

  it('cambia el rol y desactiva', () => {
    servicio.cambiarRol(2, 'ADMINISTRADOR').subscribe();
    const cambio = backend.expectOne({ method: 'PUT', url: '/api/usuarios/2/rol' });
    expect(cambio.request.body).toEqual({ rol: 'ADMINISTRADOR' });
    cambio.flush({});

    servicio.desactivar(2).subscribe();
    backend.expectOne({ method: 'PUT', url: '/api/usuarios/2/desactivar' }).flush(null);
  });
});
