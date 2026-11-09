import { Component } from '@angular/core';

// SVG copiado de diseno/index.html (líneas 145-156)
@Component({
  selector: 'app-ilustracion-internet',
  template: `
    <svg viewBox="0 0 220 140">
      <path class="onda" style="--retraso: 0s" d="M92 58 Q110 44 128 58" />
      <path class="onda" style="--retraso: 0.25s" d="M80 45 Q110 22 140 45" />
      <path class="onda" style="--retraso: 0.5s" d="M68 32 Q110 0 152 32" />
      <circle cx="110" cy="68" r="4" fill="#22d3ee" />
      <path class="trazo trazo--suave" d="M72 82 L62 50 M148 82 L158 50" />
      <rect class="trazo relleno-oscuro" x="40" y="82" width="140" height="38" rx="12" />
      <circle class="led" cx="62" cy="101" r="4" style="--retraso: 0s" />
      <circle class="led" cx="78" cy="101" r="4" style="--retraso: 0.35s" />
      <circle class="led" cx="94" cy="101" r="4" style="--retraso: 0.7s" />
      <path class="trazo trazo--suave" d="M140 101 H162" />
    </svg>
  `,
  // Sin caja propia: el SVG queda como hijo directo para los estilos de home.css
  host: { style: 'display: contents' },
})
export class IlustracionInternet {}
