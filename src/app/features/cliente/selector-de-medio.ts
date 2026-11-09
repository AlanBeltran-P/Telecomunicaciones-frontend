import { Component, input, model } from '@angular/core';
import { MedioDePago } from '../../core/facturacion/factura.model';
import { MEDIOS_DE_PAGO } from '../../core/facturacion/medio-de-pago';

/** Los cuatro medios de pago como opciones: <app-selector-de-medio [(medio)]="medio" /> */
@Component({
  selector: 'app-selector-de-medio',
  template: `
    <div class="medios">
      @for (opcion of opciones; track opcion.medio) {
        <label class="medio">
          <input
            type="radio"
            [name]="nombre()"
            [checked]="opcion.medio === medio()"
            (change)="medio.set(opcion.medio)"
          />
          <span class="medio__icono" [style.color]="opcion.color">{{ opcion.sigla }}</span>
          {{ opcion.nombre }}
        </label>
      }
    </div>
  `,
})
export class SelectorDeMedio {
  readonly medio = model.required<MedioDePago>();
  /** name de los radios: distinto en cada formulario de la pantalla. */
  readonly nombre = input('medio');
  protected readonly opciones = MEDIOS_DE_PAGO;
}
