import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NOTIFICACIONES_MOCK } from '../../../core/mock/datos/notificaciones.mock';
import { textoEnPantalla } from '../../../shared/testing/pantalla';
import { Notificaciones } from './notificaciones';

describe('Notificaciones', () => {
  let fixture: ComponentFixture<Notificaciones>;
  let backend: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [Notificaciones],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    backend = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(Notificaciones);
    fixture.detectChanges();
  });

  afterEach(() => backend.verify());

  function botonMarcarTodas(): HTMLButtonElement {
    return (fixture.nativeElement as HTMLElement).querySelector('.encabezado button') as HTMLButtonElement;
  }

  it('lista los avisos del cliente', async () => {
    backend.expectOne('/api/notificaciones/mias').flush(NOTIFICACIONES_MOCK);
    await fixture.whenStable();

    expect(textoEnPantalla(fixture)).toContain('Tu plan Fibra 1000 fue suspendido');
    expect(textoEnPantalla(fixture)).toContain('03/11 · 02:00');
  });

  it('"Marcar todas" se apaga cuando no queda ninguna sin leer', async () => {
    backend.expectOne('/api/notificaciones/mias').flush(NOTIFICACIONES_MOCK);
    await fixture.whenStable();
    expect(botonMarcarTodas().disabled).toBe(false);

    botonMarcarTodas().click();
    fixture.detectChanges();
    const pedidos = backend.match((pedido) => pedido.method === 'PUT');
    expect(pedidos.length).toBe(3);
    pedidos.forEach((pedido, i) => pedido.flush({ ...NOTIFICACIONES_MOCK[i], leida: true }));
    await fixture.whenStable();

    expect(botonMarcarTodas().disabled).toBe(true);
  });

  it('sin avisos lo dice', async () => {
    backend.expectOne('/api/notificaciones/mias').flush([]);
    await fixture.whenStable();

    expect(textoEnPantalla(fixture)).toContain('No tenés notificaciones');
  });
});
