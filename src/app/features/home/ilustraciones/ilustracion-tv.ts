import { Component } from '@angular/core';

// SVG copiado de diseno/index.html (líneas 171-193)
@Component({
  selector: 'app-ilustracion-tv',
  template: `
    <svg viewBox="0 0 220 140">
      <defs>
        <clipPath id="recorte-pantalla"><rect x="32" y="16" width="156" height="92" rx="8" /></clipPath>
        <linearGradient id="grad-pantalla" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stop-color="#22d3ee" stop-opacity="0.55" />
          <stop offset="1" stop-color="#8b5cf6" stop-opacity="0.55" />
        </linearGradient>
      </defs>
      <rect class="relleno-oscuro" x="30" y="14" width="160" height="96" rx="10" />
      <g clip-path="url(#recorte-pantalla)">
        <!-- Dos copias de la misma escena: al desplazarse 120px el loop no se nota -->
        <g class="pantalla-contenido">
          <rect x="32" y="16" width="240" height="92" fill="url(#grad-pantalla)" />
          <path d="M32 108 L62 70 L84 92 L110 60 L152 108 Z" fill="#05070f" opacity="0.55" />
          <path d="M152 108 L182 70 L204 92 L230 60 L272 108 Z" fill="#05070f" opacity="0.55" />
          <circle cx="70" cy="40" r="9" fill="#ffffff" opacity="0.7" />
          <circle cx="190" cy="40" r="9" fill="#ffffff" opacity="0.7" />
        </g>
      </g>
      <rect class="trazo" x="30" y="14" width="160" height="96" rx="10" />
      <path class="boton-play" d="M101 48 L101 76 L124 62 Z" />
      <path class="trazo" d="M110 110 V124 M88 126 H132" />
    </svg>
  `,
  // Sin caja propia: el SVG queda como hijo directo para los estilos de home.css
  host: { style: 'display: contents' },
})
export class IlustracionTv {}
