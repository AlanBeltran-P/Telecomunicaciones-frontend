import { Component, computed, input } from '@angular/core';

/** Trazos de los íconos del prototipo (24x24, línea de 2px). */
const TRAZOS = {
  inicio: 'M3 11 12 4l9 7v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z',
  wifi: 'M2 9a15 15 0 0 1 20 0M5.5 12.5a10 10 0 0 1 13 0M9 16a5 5 0 0 1 6 0',
  factura: 'M6 2h9l5 5v15H6zM14 2v6h6M9 13h7M9 17h5',
  debito: 'M21 12a9 9 0 1 1-3-6.7L21 8M21 3v5h-5',
  campana: 'M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9M10.3 21a1.94 1.94 0 0 0 3.4 0',
  personas:
    'M5 8a4 4 0 1 0 8 0a4 4 0 1 0-8 0M2 21a7 7 0 0 1 14 0M16 4a4 4 0 0 1 0 8M22 21a7 7 0 0 0-4-6.3',
  herramienta:
    'M14.7 6.3a4 4 0 0 0-5.4 5.4L3 18l3 3 6.3-6.3a4 4 0 0 0 5.4-5.4l-2.5 2.5-2.4-.6-.6-2.4z',
  pausa: 'M3 12a9 9 0 1 0 18 0a9 9 0 1 0-18 0M10 9v6M14 9v6',
  reloj: 'M3 12a9 9 0 1 0 18 0a9 9 0 1 0-18 0M12 7v5l3 2',
  grafico: 'M3 3v18h18M7 15l4-5 3 3 5-6',
  perfil: 'M8 8a4 4 0 1 0 8 0a4 4 0 1 0-8 0M4 21a8 8 0 0 1 16 0',
  salir: 'M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9',
  tarjeta: 'M4 5h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2zM2 10h20',
  calendario:
    'M6 4h12a3 3 0 0 1 3 3v12a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3V7a3 3 0 0 1 3-3zM16 2v4M8 2v4M3 10h18',
};

export type NombreIcono = keyof typeof TRAZOS;

@Component({
  selector: 'app-icono',
  template: `
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      aria-hidden="true"
    >
      <path [attr.d]="trazo()" />
    </svg>
  `,
  // Sin caja propia: los estilos del prototipo (".menu__item svg") siguen aplicando
  host: { style: 'display: contents' },
})
export class Icono {
  readonly nombre = input.required<NombreIcono>();
  protected readonly trazo = computed(() => TRAZOS[this.nombre()]);
}
