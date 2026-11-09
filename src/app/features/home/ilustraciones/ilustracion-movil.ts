import { Component } from '@angular/core';

// SVG copiado de diseno/index.html (líneas 208-221)
@Component({
  selector: 'app-ilustracion-movil',
  template: `
    <svg viewBox="0 0 220 140">
      <rect class="trazo relleno-oscuro" x="72" y="8" width="76" height="126" rx="14" />
      <path class="trazo trazo--suave" d="M100 18 H120" />
      <rect class="barra-senal" style="--retraso: 0s" x="86" y="96" width="10" height="16" rx="2" />
      <rect class="barra-senal" style="--retraso: 0.15s" x="100" y="86" width="10" height="26" rx="2" />
      <rect class="barra-senal" style="--retraso: 0.3s" x="114" y="76" width="10" height="36" rx="2" />
      <rect class="barra-senal" style="--retraso: 0.45s" x="128" y="66" width="10" height="46" rx="2" />
      <g class="burbuja">
        <rect x="146" y="18" width="58" height="28" rx="12" fill="#8b5cf6" />
        <circle cx="163" cy="32" r="3" fill="#ffffff" />
        <circle cx="175" cy="32" r="3" fill="#ffffff" />
        <circle cx="187" cy="32" r="3" fill="#ffffff" />
      </g>
    </svg>
  `,
  // Sin caja propia: el SVG queda como hijo directo para los estilos de home.css
  host: { style: 'display: contents' },
})
export class IlustracionMovil {}
