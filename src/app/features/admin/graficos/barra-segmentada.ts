import { Component, computed, input } from '@angular/core';
import { numero } from '../dashboard/formatos';

export interface ParteDeBarra {
  nombre: string;
  valor: number;
  color: string;
}

/** Con menos espacio que esto, el porcentaje no entra dentro del segmento. */
const PORCENTAJE_MINIMO_PARA_ETIQUETA = 12;

/** Un total partido en partes (ej. facturas pagadas, pendientes y vencidas). */
@Component({
  selector: 'app-barra-segmentada',
  template: `
    <div class="segmentos" role="img" [attr.aria-label]="descripcion()">
      @for (parte of partesVisibles(); track parte.nombre) {
        <div
          class="segmento"
          tabindex="0"
          [style.flex-grow]="parte.valor"
          [style.background]="parte.color"
          [attr.title]="parte.nombre + ': ' + parte.texto + ' (' + parte.porcentaje + '%)'"
        >
          @if (parte.porcentaje >= minimoParaEtiqueta) {
            {{ parte.porcentaje }}%
          }
        </div>
      }
    </div>
    <div class="leyenda">
      @for (parte of partesVisibles(); track parte.nombre) {
        <span><span class="leyenda__cuadro" [style.background]="parte.color"></span>{{ parte.nombre }}</span>
      }
    </div>
  `,
})
export class BarraSegmentada {
  readonly partes = input.required<ParteDeBarra[]>();

  protected readonly minimoParaEtiqueta = PORCENTAJE_MINIMO_PARA_ETIQUETA;

  /** Las partes en cero no se dibujan. */
  protected readonly partesVisibles = computed(() => {
    const total = this.partes().reduce((suma, parte) => suma + parte.valor, 0) || 1;
    return this.partes()
      .filter((parte) => parte.valor > 0)
      .map((parte) => ({
        ...parte,
        texto: numero(parte.valor),
        porcentaje: Math.round((parte.valor / total) * 100),
      }));
  });

  protected readonly descripcion = computed(() =>
    this.partes()
      .map((parte) => `${parte.nombre}: ${numero(parte.valor)}`)
      .join(', '),
  );
}
