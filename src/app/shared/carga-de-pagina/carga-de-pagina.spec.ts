import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { vi } from 'vitest';
import { CargaDePagina, DURACION_MINIMA_MS } from './carga-de-pagina';

@Component({ template: '' })
class PaginaVacia {}

describe('CargaDePagina', () => {
  let fixture: ComponentFixture<CargaDePagina>;
  let router: Router;
  let dejarPasar: (valor: boolean) => void;
  let avisarQueLlegoAlGuard: () => void;
  let llegoAlGuard: Promise<void>;

  // La navegación a /otra queda en curso hasta que el test la deje pasar
  function guardQueEspera(): Promise<boolean> {
    avisarQueLlegoAlGuard();
    return new Promise<boolean>((resolver) => (dejarPasar = resolver));
  }

  beforeEach(async () => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'Date'] });
    llegoAlGuard = new Promise<void>((resolver) => (avisarQueLlegoAlGuard = resolver));
    TestBed.configureTestingModule({
      imports: [CargaDePagina],
      providers: [
        provideRouter([
          { path: '', component: PaginaVacia },
          { path: 'otra', component: PaginaVacia, canActivate: [guardQueEspera] },
        ]),
      ],
    });
    router = TestBed.inject(Router);
    fixture = TestBed.createComponent(CargaDePagina);
    await router.navigateByUrl('/');
    vi.advanceTimersByTime(DURACION_MINIMA_MS);
    fixture.detectChanges();
  });

  afterEach(() => vi.useRealTimers());

  function estaVisible(): boolean {
    fixture.detectChanges();
    return (fixture.nativeElement as HTMLElement).querySelector('.carga-de-pagina') !== null;
  }

  function esperarQueEmpieceLaNavegacion(): Promise<void> {
    return llegoAlGuard;
  }

  it('aparece mientras se cambia de página', async () => {
    const navegacion = router.navigateByUrl('/otra');
    await esperarQueEmpieceLaNavegacion();
    expect(estaVisible()).toBe(true);

    dejarPasar(true);
    await navegacion;
    vi.advanceTimersByTime(DURACION_MINIMA_MS);
    expect(estaVisible()).toBe(false);
  });

  it('se queda el tiempo mínimo aunque la página cargue al instante', async () => {
    const navegacion = router.navigateByUrl('/otra');
    await esperarQueEmpieceLaNavegacion();
    dejarPasar(true);
    await navegacion;

    vi.advanceTimersByTime(DURACION_MINIMA_MS - 1);
    expect(estaVisible()).toBe(true);
    vi.advanceTimersByTime(1);
    expect(estaVisible()).toBe(false);
  });

  it('se oculta si la navegación se cancela', async () => {
    const navegacion = router.navigateByUrl('/otra');
    await esperarQueEmpieceLaNavegacion();
    dejarPasar(false);
    await navegacion;
    vi.advanceTimersByTime(DURACION_MINIMA_MS);
    expect(estaVisible()).toBe(false);
  });

  it('no aparece al saltar a una sección de la misma página', async () => {
    await router.navigateByUrl('/#planes');
    expect(estaVisible()).toBe(false);
  });
});
