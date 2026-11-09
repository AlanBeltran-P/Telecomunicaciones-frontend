import { Component, input, output } from '@angular/core';

/** Ventana modal del prototipo. Se cierra tocando el fondo o con Escape. */
@Component({
  selector: 'app-modal',
  template: `
    <div
      class="modal"
      [class.modal--abierto]="abierto()"
      [attr.inert]="abierto() ? null : ''"
      (click)="tocarFondo($event)"
    >
      <div
        class="tarjeta modal__caja"
        role="dialog"
        aria-modal="true"
        [attr.aria-label]="titulo()"
        [style.width]="ancho()"
      >
        <div>
          <h2 class="tarjeta__titulo">{{ titulo() }}</h2>
          @if (descripcion()) {
            <p class="texto-suave">{{ descripcion() }}</p>
          }
        </div>
        <ng-content />
      </div>
    </div>
  `,
  host: { '(document:keydown.escape)': 'cerrarSiEstaAbierto()' },
})
export class Modal {
  readonly abierto = input(false);
  readonly titulo = input.required<string>();
  readonly descripcion = input('');
  readonly ancho = input('min(480px, 100%)');
  readonly cerrar = output<void>();

  protected tocarFondo(evento: MouseEvent): void {
    if (evento.target === evento.currentTarget) {
      this.cerrar.emit();
    }
  }

  protected cerrarSiEstaAbierto(): void {
    if (this.abierto()) {
      this.cerrar.emit();
    }
  }
}
