import { Component } from '@angular/core';

// SVG copiado de diseno/index.html (líneas 65-130)
@Component({
  selector: 'app-red-fibra',
  template: `
    <div class="red-fibra" aria-hidden="true">
      <svg viewBox="0 0 560 480">
        <defs>
          <linearGradient id="grad-marca" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stop-color="#22d3ee" />
            <stop offset="1" stop-color="#8b5cf6" />
          </linearGradient>
        </defs>

        <circle class="anillo-giratorio" cx="280" cy="240" r="200" />
        <circle class="anillo-giratorio anillo-giratorio--inverso" cx="280" cy="240" r="135" />
        <circle class="anillo-giratorio" cx="280" cy="240" r="92" />

        <!-- Fibras y sus pulsos de luz (van de cada dispositivo al núcleo) -->
        <path class="fibra" d="M110 110 C190 110 200 240 280 240" />
        <path class="fibra" d="M450 100 C370 100 360 240 280 240" />
        <path class="fibra" d="M450 380 C370 380 360 240 280 240" />
        <path class="fibra" d="M110 370 C190 370 200 240 280 240" />
        <path class="fibra" d="M20 240 H280" />
        <path class="fibra" d="M540 240 H280" />

        <path class="fibra-pulso fibra-pulso--cian" d="M110 110 C190 110 200 240 280 240" />
        <path class="fibra-pulso fibra-pulso--violeta" style="animation-delay: -0.8s" d="M450 100 C370 100 360 240 280 240" />
        <path class="fibra-pulso fibra-pulso--cian" style="animation-delay: -1.6s" d="M450 380 C370 380 360 240 280 240" />
        <path class="fibra-pulso fibra-pulso--violeta" style="animation-delay: -2.4s" d="M110 370 C190 370 200 240 280 240" />
        <path class="fibra-pulso fibra-pulso--cian" style="animation-delay: -1.2s" d="M20 240 H280" />
        <path class="fibra-pulso fibra-pulso--violeta" style="animation-delay: -2s" d="M540 240 H280" />

        <!-- Núcleo -->
        <circle class="nucleo" cx="280" cy="240" r="58" fill="url(#grad-marca)" />
        <g fill="none" stroke="#04121a" stroke-width="5" stroke-linecap="round">
          <path d="M252 232 a40 40 0 0 1 56 0" />
          <path d="M262 244 a24 24 0 0 1 36 0" />
          <circle cx="280" cy="256" r="3" fill="#04121a" />
        </g>

        <!-- Dispositivos: casa, TV, celular y empresa -->
        <g transform="translate(54 82)">
          <g class="dispositivo" style="--retraso: 0s">
            <rect width="56" height="56" rx="16" />
            <path d="M16 30 L28 19 L40 30 M20 27 V39 H36 V27" />
          </g>
        </g>
        <g transform="translate(450 72)">
          <g class="dispositivo" style="--retraso: -1.2s">
            <rect width="56" height="56" rx="16" />
            <path d="M15 19 H41 V35 H15 Z M23 40 H33" />
          </g>
        </g>
        <g transform="translate(450 352)">
          <g class="dispositivo" style="--retraso: -2.4s">
            <rect width="56" height="56" rx="16" />
            <path d="M21 14 H35 V42 H21 Z M26 37 H30" />
          </g>
        </g>
        <g transform="translate(54 342)">
          <g class="dispositivo" style="--retraso: -3.6s">
            <rect width="56" height="56" rx="16" />
            <path d="M17 41 V17 H31 V41 M31 25 H39 V41 M14 41 H42 M21 22 H27 M21 28 H27 M21 34 H27" />
          </g>
        </g>
      </svg>
      <span class="chip" style="top: 10%; left: 30%; --retraso: -1s">Fibra 1 Gb</span>
      <span class="chip" style="top: 47%; right: -2%; --color: var(--violeta); --retraso: -3s">+120 canales HD</span>
      <span class="chip" style="bottom: 8%; left: 34%; --color: var(--exito); --retraso: -2s">Datos móviles</span>
    </div>
  `,
  // Sin caja propia: el SVG queda como hijo directo para los estilos de home.css
  host: { style: 'display: contents' },
})
export class RedFibra {}
