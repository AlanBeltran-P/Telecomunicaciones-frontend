import { Component, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NotificacionesService } from '../../../core/notificaciones/notificaciones.service';
import { Campana } from '../campana/campana';
import { ContratarPlan } from '../contratar-plan/contratar-plan';

/** Barra superior del cliente (campana y "Contratar plan") arriba de cada pantalla del área. */
@Component({
  selector: 'app-cliente-layout',
  imports: [RouterOutlet, Campana, ContratarPlan],
  templateUrl: './cliente-layout.html',
  // Mismo espaciado que .contenido, que es donde se dibuja
  host: { style: 'display: grid; gap: var(--espacio-6); align-content: start' },
})
export class ClienteLayout {
  protected readonly contratando = signal(false);

  constructor() {
    inject(NotificacionesService).cargar();
  }
}
