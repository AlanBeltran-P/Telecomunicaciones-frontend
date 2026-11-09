import { Component } from '@angular/core';

// SVG copiado de diseno/index.html (líneas 322-339)
@Component({
  selector: 'app-mapa-red',
  template: `
    <svg viewBox="0 0 420 400">
      <path class="tramo" d="M150 40 L175 95 L195 190 L255 205 L310 245 L320 320" />
      <path class="tramo" d="M195 190 L85 215 L120 330 Q220 385 320 320" />
      <path class="tramo" d="M195 190 Q265 255 310 245" />

      <path class="tramo-pulso" style="--retraso: 0s" d="M150 40 L175 95 L195 190 L255 205 L310 245 L320 320" />
      <path class="tramo-pulso" style="--retraso: -1.2s" d="M195 190 L85 215 L120 330 Q220 385 320 320" />
      <path class="tramo-pulso" style="--retraso: -0.6s" d="M195 190 Q265 255 310 245" />

      <g class="ciudad"><circle class="ciudad__radar" cx="150" cy="40" r="6" style="--retraso: 0s" /><circle class="ciudad__punto" cx="150" cy="40" r="6" /><text class="ciudad__nombre" x="164" y="44">Salta</text></g>
      <g class="ciudad"><circle class="ciudad__radar" cx="175" cy="95" r="6" style="--retraso: -0.4s" /><circle class="ciudad__punto" cx="175" cy="95" r="6" /><text class="ciudad__nombre" x="189" y="99">Tucumán</text></g>
      <g class="ciudad"><circle class="ciudad__radar" cx="195" cy="190" r="6" style="--retraso: -0.8s" /><circle class="ciudad__punto" cx="195" cy="190" r="6" /><text class="ciudad__nombre" x="150" y="176">Córdoba</text></g>
      <g class="ciudad"><circle class="ciudad__radar" cx="255" cy="205" r="6" style="--retraso: -1.2s" /><circle class="ciudad__punto" cx="255" cy="205" r="6" /><text class="ciudad__nombre" x="262" y="194">Rosario</text></g>
      <g class="ciudad ciudad--principal"><circle class="ciudad__radar" cx="310" cy="245" r="8" style="--retraso: -1.6s" /><circle class="ciudad__punto" cx="310" cy="245" r="8" /><text class="ciudad__nombre" x="326" y="249">CABA</text></g>
      <g class="ciudad"><circle class="ciudad__radar" cx="320" cy="320" r="6" style="--retraso: -2s" /><circle class="ciudad__punto" cx="320" cy="320" r="6" /><text class="ciudad__nombre" x="334" y="324">Mar del Plata</text></g>
      <g class="ciudad"><circle class="ciudad__radar" cx="85" cy="215" r="6" style="--retraso: -0.2s" /><circle class="ciudad__punto" cx="85" cy="215" r="6" /><text class="ciudad__nombre" x="30" y="203">Mendoza</text></g>
      <g class="ciudad"><circle class="ciudad__radar" cx="120" cy="330" r="6" style="--retraso: -1s" /><circle class="ciudad__punto" cx="120" cy="330" r="6" /><text class="ciudad__nombre" x="62" y="350">Neuquén</text></g>
    </svg>
  `,
  // Sin caja propia: el SVG queda como hijo directo para los estilos de home.css
  host: { style: 'display: contents' },
})
export class MapaRed {}
