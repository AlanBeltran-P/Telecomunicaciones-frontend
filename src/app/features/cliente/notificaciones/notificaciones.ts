import { DatePipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { NotificacionesService } from '../../../core/notificaciones/notificaciones.service';
import { Icono } from '../../../shared/icono/icono';

/** Todos los avisos del cliente. Tocar uno lo marca como leído. */
@Component({
  selector: 'app-notificaciones',
  imports: [DatePipe, Icono],
  templateUrl: './notificaciones.html',
  styleUrl: './notificaciones.css',
})
export class Notificaciones {
  protected readonly notificaciones = inject(NotificacionesService);

  constructor() {
    this.notificaciones.cargar();
  }
}
