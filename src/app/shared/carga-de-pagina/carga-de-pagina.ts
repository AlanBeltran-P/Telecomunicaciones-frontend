import { Component, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  Event as EventoDeRuta,
  NavigationCancel,
  NavigationEnd,
  NavigationError,
  NavigationStart,
  Router,
} from '@angular/router';

/** Tiempo mínimo visible, para que la pantalla no parpadee. */
export const DURACION_MINIMA_MS = 400;

const sinFragmento = (url: string) => url.split('#')[0];

const esFinDeNavegacion = (evento: EventoDeRuta) =>
  evento instanceof NavigationEnd ||
  evento instanceof NavigationCancel ||
  evento instanceof NavigationError;

/** Pantalla con el logo que tapa el cambio de una página a otra. */
@Component({
  selector: 'app-carga-de-pagina',
  template: `
    @if (visible()) {
      <div class="carga-de-pagina" role="status" aria-label="Cargando página">
        <span class="logo__marca carga-de-pagina__logo">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="#04121a"
            stroke-width="2.4"
            stroke-linecap="round"
          >
            <path d="M5 12a7 7 0 0 1 14 0M8.5 12a3.5 3.5 0 0 1 7 0" />
            <circle cx="12" cy="12" r="1.2" fill="#04121a" />
          </svg>
        </span>
      </div>
    }
  `,
})
export class CargaDePagina {
  private readonly router = inject(Router);
  private inicio = 0;

  protected readonly visible = signal(false);

  constructor() {
    this.router.events.pipe(takeUntilDestroyed()).subscribe((evento) => {
      if (evento instanceof NavigationStart && this.cambiaDePagina(evento.url)) {
        this.mostrar();
      }
      if (esFinDeNavegacion(evento) && this.visible()) {
        this.ocultarRespetandoElMinimo();
      }
    });
  }

  private cambiaDePagina(urlNueva: string): boolean {
    return sinFragmento(urlNueva) !== sinFragmento(this.router.url);
  }

  private mostrar(): void {
    this.inicio = Date.now();
    this.visible.set(true);
  }

  private ocultarRespetandoElMinimo(): void {
    const restante = Math.max(0, DURACION_MINIMA_MS - (Date.now() - this.inicio));
    setTimeout(() => this.visible.set(false), restante);
  }
}
