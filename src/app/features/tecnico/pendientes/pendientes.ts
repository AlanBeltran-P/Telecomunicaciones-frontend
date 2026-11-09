import { DatePipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { Instalacion } from '../../../core/contrataciones/instalacion.model';
import { InstalacionService } from '../../../core/contrataciones/instalacion.service';
import { mensajeDeError } from '../../../core/http/mensaje-error';
import { Icono } from '../../../shared/icono/icono';
import { ToastService } from '../../../shared/toast/toast.service';

/**
 * Instalaciones asignadas al técnico (GET /api/instalaciones/mias).
 * Al marcarla realizada (PUT /api/instalaciones/{id}/realizada) el plan queda activo;
 * la tarjeta sigue en pantalla como "Instalada" hasta salir.
 */
@Component({
  selector: 'app-pendientes',
  imports: [DatePipe, Icono],
  templateUrl: './pendientes.html',
})
export class Pendientes {
  private readonly instalaciones = inject(InstalacionService);
  private readonly toasts = inject(ToastService);

  protected readonly hoy = new Date();
  protected readonly lista = rxResource({
    stream: () => this.instalaciones.mias(),
    defaultValue: [],
  });
  protected readonly guardando = signal<number | null>(null);

  protected marcarRealizada(instalacion: Instalacion): void {
    this.guardando.set(instalacion.contratacionId);
    this.instalaciones.marcarRealizada(instalacion.contratacionId).subscribe({
      next: (hecha) => {
        this.lista.update((lista) =>
          lista.map((i) => (i.contratacionId === hecha.contratacionId ? hecha : i)),
        );
        this.guardando.set(null);
        this.toasts.mostrar('Instalación registrada. El plan ya está activo.');
      },
      error: (error: unknown) => {
        this.guardando.set(null);
        this.toasts.mostrar(mensajeDeError(error));
      },
    });
  }
}
