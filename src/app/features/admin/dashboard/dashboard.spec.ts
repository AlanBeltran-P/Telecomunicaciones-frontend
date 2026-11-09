import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, TestRequest, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
  reporteDeContrataciones,
  reporteDeFacturacion,
  reporteDeUsuarios,
} from '../../../core/mock/datos/reportes.mock';
import { clickEnBoton, textoEnPantalla } from '../../../shared/testing/pantalla';
import { Dashboard } from './dashboard';
import { desdeIso } from './periodo';

describe('Dashboard', () => {
  let fixture: ComponentFixture<Dashboard>;
  let backend: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [Dashboard],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    backend = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(Dashboard);
    fixture.detectChanges();
  });

  afterEach(() => backend.verify());

  /** Botón que manda pedidos: no se espera la pantalla estable hasta responderlos. */
  function tocar(texto: string): void {
    const botones = Array.from((fixture.nativeElement as HTMLElement).querySelectorAll('button'));
    botones.find((boton) => boton.textContent?.trim() === texto)?.click();
    fixture.detectChanges();
  }

  function pedidosDeReportes(): TestRequest[] {
    return backend.match((req) => req.url.endsWith('/reporte'));
  }

  /** Responde cada reporte con los datos de ejemplo del mismo rango que pidió. */
  async function responder(pedidos: TestRequest[]): Promise<void> {
    for (const pedido of pedidos) {
      const desde = desdeIso(pedido.request.params.get('desde') ?? '');
      const hasta = desdeIso(pedido.request.params.get('hasta') ?? '');
      const agrupacion = pedido.request.params.get('agrupacion') === 'MES' ? 'MES' : 'DIA';
      if (pedido.request.url.includes('usuarios')) {
        pedido.flush(reporteDeUsuarios(desde, hasta, agrupacion));
      } else if (pedido.request.url.includes('contrataciones')) {
        pedido.flush(reporteDeContrataciones(desde, hasta, agrupacion));
      } else {
        pedido.flush(reporteDeFacturacion(desde, hasta, agrupacion));
      }
    }
    await fixture.whenStable();
  }

  it('arranca con el mes actual: pide los tres reportes una sola vez', async () => {
    const pedidos = pedidosDeReportes();
    expect(pedidos.length).toBe(3);
    expect(pedidos[0].request.params.get('agrupacion')).toBe('DIA');
    await responder(pedidos);

    const texto = textoEnPantalla(fixture);
    expect(texto).toContain('Cobrado');
    expect(texto).toContain('Facturas por estado');
    expect(texto).toContain('Débitos automáticos activos');
  });

  it('con un día elegido pide los totales del día y la evolución del mes', async () => {
    await responder(pedidosDeReportes());
    tocar('Día');

    const pedidos = pedidosDeReportes();
    expect(pedidos.length).toBe(6);
    const rangos = new Set(pedidos.map((p) => p.request.params.get('desde') + '…' + p.request.params.get('hasta')));
    expect(rangos.size).toBe(2);
    await responder(pedidos);
  });

  it('el año se agrupa por mes', async () => {
    await responder(pedidosDeReportes());
    tocar('Año');

    const pedidos = pedidosDeReportes();
    expect(pedidos.every((p) => p.request.params.get('agrupacion') === 'MES')).toBe(true);
    await responder(pedidos);
    expect(textoEnPantalla(fixture)).toContain(`Año ${new Date().getFullYear()}`);
  });

  it('muestra la tabla de la serie cuando se pide', async () => {
    await responder(pedidosDeReportes());
    await clickEnBoton(fixture, 'Ver tabla');
    expect((fixture.nativeElement as HTMLElement).querySelector('.tabla-serie table')).not.toBeNull();
  });

  it('si fallan los reportes muestra un aviso', async () => {
    // Con que falle uno alcanza: los otros dos se cancelan solos
    const [primero] = pedidosDeReportes();
    primero.flush(null, { status: 500, statusText: 'Error' });
    await fixture.whenStable();
    expect(textoEnPantalla(fixture)).toContain('No pudimos cargar los reportes');
  });
});
