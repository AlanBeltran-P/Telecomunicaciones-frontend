import { Component } from '@angular/core';

/** Avance de una instalación pendiente: ya está contratado y falta que vaya el técnico. */
@Component({
  selector: 'app-pasos-de-instalacion',
  template: `
    <div class="pasos">
      <div class="paso paso--hecho"><span class="paso__barra"></span>Contratado</div>
      <div class="paso paso--actual"><span class="paso__barra"></span>Instalación</div>
      <div class="paso"><span class="paso__barra"></span>Servicio activo</div>
    </div>
  `,
})
export class PasosDeInstalacion {}
