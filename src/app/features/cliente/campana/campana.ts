import { DatePipe } from '@angular/common';
import { Component, ElementRef, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NotificacionesService } from '../../../core/notificaciones/notificaciones.service';
import { Icono } from '../../../shared/icono/icono';

/** En el panel entran las más nuevas; el resto está en "Ver todas". */
const MAXIMO_EN_PANEL = 5;

@Component({
  selector: 'app-campana',
  imports: [DatePipe, RouterLink, Icono],
  templateUrl: './campana.html',
  styleUrl: './campana.css',
  host: {
    class: 'zona-campana',
    '(document:click)': 'cerrarSiTocoAfuera($event)',
    '(document:keydown.escape)': 'abierto.set(false)',
  },
})
export class Campana {
  private readonly elemento = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  protected readonly notificaciones = inject(NotificacionesService);
  protected readonly abierto = signal(false);
  protected readonly ultimas = computed(() =>
    this.notificaciones.lista().slice(0, MAXIMO_EN_PANEL),
  );

  protected alternar(): void {
    this.abierto.update((abierto) => !abierto);
  }

  protected cerrarSiTocoAfuera(evento: MouseEvent): void {
    if (!this.elemento.contains(evento.target as Node)) {
      this.abierto.set(false);
    }
  }
}
