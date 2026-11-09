import { Component, computed, input } from '@angular/core';

export interface ItemDeBarra {
  nombre: string;
  valor: number;
  /** Valor completo, para el cuadrito y los lectores de pantalla. */
  texto: string;
  /** Valor corto que se ve al lado de la barra (si no, el texto). */
  textoCorto?: string;
  /** Aclaración del valor, ej. "34 pagos". */
  detalle?: string;
}

/** Barras horizontales: un ranking o un reparto por categoría. */
@Component({
  selector: 'app-barras',
  template: `
    <div class="barras">
      @for (item of filas(); track item.nombre) {
        <div class="barra" tabindex="0" [attr.aria-label]="item.nombre + ': ' + item.texto" [attr.title]="item.titulo">
          <span class="barra__nombre">{{ item.nombre }}</span>
          <div class="barra__pista">
            <div class="barra__relleno" [style.width.%]="item.porcentaje"></div>
          </div>
          <span class="barra__valor">{{ item.textoCorto ?? item.texto }}</span>
        </div>
      } @empty {
        <p class="texto-suave">Sin datos en el período.</p>
      }
    </div>
  `,
})
export class Barras {
  readonly items = input.required<ItemDeBarra[]>();

  /** El más grande ocupa toda la pista; el resto, en proporción. */
  protected readonly filas = computed(() => {
    const maximo = Math.max(1, ...this.items().map((item) => item.valor));
    return this.items().map((item) => ({
      ...item,
      porcentaje: (item.valor / maximo) * 100,
      titulo: item.detalle ? `${item.texto} · ${item.detalle}` : item.texto,
    }));
  });
}
