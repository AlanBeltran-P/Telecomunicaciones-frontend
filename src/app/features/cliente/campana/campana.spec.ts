import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { NOTIFICACIONES_MOCK } from '../../../core/mock/datos/notificaciones.mock';
import { NotificacionesService } from '../../../core/notificaciones/notificaciones.service';
import { Campana } from './campana';

describe('Campana', () => {
  let fixture: ComponentFixture<Campana>;
  let backend: HttpTestingController;

  async function abrirCon(avisos: unknown[]): Promise<void> {
    TestBed.inject(NotificacionesService).cargar();
    backend.expectOne('/api/notificaciones/mias').flush(avisos);
    fixture = TestBed.createComponent(Campana);
    await fixture.whenStable();
  }

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [Campana],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    });
    backend = TestBed.inject(HttpTestingController);
  });

  afterEach(() => backend.verify());

  function elemento(selector: string): HTMLElement | null {
    return (fixture.nativeElement as HTMLElement).querySelector(selector);
  }

  it('cuenta las no leídas', async () => {
    await abrirCon(NOTIFICACIONES_MOCK);
    expect(elemento('.campana__contador')?.textContent?.trim()).toBe('3');
  });

  it('abre el panel con las notificaciones', async () => {
    await abrirCon(NOTIFICACIONES_MOCK);
    elemento('.campana')?.click();
    await fixture.whenStable();

    expect(elemento('.panel-notificaciones')?.classList).toContain('desplegable--abierto');
    expect(elemento('.panel-notificaciones')?.textContent).toContain('Técnico asignado');
  });

  it('tocar una la marca como leída y baja el contador', async () => {
    await abrirCon(NOTIFICACIONES_MOCK);
    elemento('.notificacion')?.click();
    fixture.detectChanges();

    backend
      .expectOne({ method: 'PUT', url: '/api/notificaciones/1/leida' })
      .flush({ ...NOTIFICACIONES_MOCK[0], leida: true });
    await fixture.whenStable();

    expect(elemento('.campana__contador')?.textContent?.trim()).toBe('2');
  });

  it('sin avisos sin leer no muestra contador', async () => {
    await abrirCon([{ ...NOTIFICACIONES_MOCK[3] }]);
    expect(elemento('.campana__contador')).toBeNull();
  });
});
