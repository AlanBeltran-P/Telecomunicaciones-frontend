import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { ClienteService } from './cliente.service';

describe('ClienteService', () => {
  let servicio: ClienteService;
  let backend: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    servicio = TestBed.inject(ClienteService);
    backend = TestBed.inject(HttpTestingController);
  });

  afterEach(() => backend.verify());

  it('sin texto pide todos los clientes', () => {
    servicio.buscar().subscribe();
    const pedido = backend.expectOne('/api/clientes');
    expect(pedido.request.params.has('busqueda')).toBe(false);
    pedido.flush([]);
  });

  it('con texto busca, sin los espacios de los costados', () => {
    servicio.buscar('  ana ').subscribe();
    const pedido = backend.expectOne((req) => req.url === '/api/clientes');
    expect(pedido.request.params.get('busqueda')).toBe('ana');
    pedido.flush([]);
  });

  it('ve, crea y edita un cliente', () => {
    const datos = { nombre: 'Ana', email: 'ana@mail.com', dni: '35123456', telefono: '11 5555-1234' };

    servicio.ver(10).subscribe();
    backend.expectOne({ method: 'GET', url: '/api/clientes/10' }).flush({});

    servicio.crear({ ...datos, contrasena: 'secreta123' }).subscribe();
    const alta = backend.expectOne({ method: 'POST', url: '/api/clientes' });
    expect(alta.request.body.contrasena).toBe('secreta123');
    alta.flush({});

    servicio.editar(10, datos).subscribe();
    const edicion = backend.expectOne({ method: 'PUT', url: '/api/clientes/10' });
    expect(edicion.request.body).toEqual(datos);
    edicion.flush({});
  });
});
