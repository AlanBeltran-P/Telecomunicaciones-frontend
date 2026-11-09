import { Component } from '@angular/core';

// SVG copiado de diseno/index.html (líneas 236-254)
@Component({
  selector: 'app-ilustracion-empresa',
  template: `
    <svg viewBox="0 0 220 140">
      <path class="enlace-red" d="M120 46 L170 34 M120 80 L196 78 M120 112 L166 118 M170 34 L196 78 L166 118" />
      <rect class="trazo relleno-oscuro" x="40" y="18" width="80" height="116" rx="6" />
      <rect class="ventana" style="--retraso: 0s" x="52" y="30" width="14" height="10" rx="2" />
      <rect class="ventana" style="--retraso: 0.8s" x="73" y="30" width="14" height="10" rx="2" />
      <rect class="ventana" style="--retraso: 1.6s" x="94" y="30" width="14" height="10" rx="2" />
      <rect class="ventana" style="--retraso: 1.2s" x="52" y="50" width="14" height="10" rx="2" />
      <rect class="ventana" style="--retraso: 0.4s" x="73" y="50" width="14" height="10" rx="2" />
      <rect class="ventana" style="--retraso: 2s" x="94" y="50" width="14" height="10" rx="2" />
      <rect class="ventana" style="--retraso: 2.4s" x="52" y="70" width="14" height="10" rx="2" />
      <rect class="ventana" style="--retraso: 1s" x="73" y="70" width="14" height="10" rx="2" />
      <rect class="ventana" style="--retraso: 0.2s" x="94" y="70" width="14" height="10" rx="2" />
      <rect class="ventana" style="--retraso: 1.4s" x="52" y="90" width="14" height="10" rx="2" />
      <rect class="ventana" style="--retraso: 2.2s" x="94" y="90" width="14" height="10" rx="2" />
      <path class="trazo" d="M72 134 V112 H88 V134" />
      <circle class="nodo" style="--retraso: 0s" cx="170" cy="34" r="7" />
      <circle class="nodo" style="--retraso: 0.6s" cx="196" cy="78" r="7" />
      <circle class="nodo" style="--retraso: 1.2s" cx="166" cy="118" r="7" />
    </svg>
  `,
  // Sin caja propia: el SVG queda como hijo directo para los estilos de home.css
  host: { style: 'display: contents' },
})
export class IlustracionEmpresa {}
