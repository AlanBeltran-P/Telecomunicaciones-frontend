import { DatePipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { forkJoin } from 'rxjs';
import { nombreDelCliente } from '../../../core/clientes/cliente.model';
import { ClienteService } from '../../../core/clientes/cliente.service';
import { Instalacion } from '../../../core/contrataciones/instalacion.model';
import { InstalacionService } from '../../../core/contrataciones/instalacion.service';
import { mensajeDeError } from '../../../core/http/mensaje-error';
import { UsuarioService } from '../../../core/usuarios/usuario.service';
import { Icono } from '../../../shared/icono/icono';
import { ToastService } from '../../../shared/toast/toast.service';

/**
 * Instalaciones pendientes (GET /api/instalaciones/pendientes) y asignación de técnico
 * (PUT /api/instalaciones/{id}/tecnico). También se puede cambiar el técnico asignado.
 */
@Component({
  selector: 'app-instalaciones',
  imports: [DatePipe, Icono],
  templateUrl: './instalaciones.html',
  styleUrl: './instalaciones.css',
})
export class Instalaciones {
  private readonly instalaciones = inject(InstalacionService);
  private readonly usuarios = inject(UsuarioService);
  private readonly clientes = inject(ClienteService);
  private readonly toasts = inject(ToastService);

  protected readonly datos = rxResource({
    stream: () =>
      forkJoin({
        pendientes: this.instalaciones.pendientes(),
        tecnicos: this.usuarios.tecnicosActivos(),
        clientes: this.clientes.buscar(),
      }),
  });
  protected readonly nombreDelCliente = nombreDelCliente;
  /** Contratación que se está guardando, para desactivar solo su botón. */
  protected readonly guardando = signal<number | null>(null);

  protected asignar(instalacion: Instalacion, selector: HTMLSelectElement): void {
    const tecnicoId = Number(selector.value);
    if (!tecnicoId) {
      return;
    }
    this.guardando.set(instalacion.contratacionId);
    this.instalaciones.asignarTecnico(instalacion.contratacionId, tecnicoId).subscribe({
      next: (actualizada) => {
        this.reemplazar(actualizada);
        this.guardando.set(null);
        this.toasts.mostrar(`Técnico asignado: ${actualizada.tecnicoNombre}`);
      },
      error: (error: unknown) => {
        this.guardando.set(null);
        this.toasts.mostrar(mensajeDeError(error));
      },
    });
  }

  private reemplazar(actualizada: Instalacion): void {
    this.datos.update((datos) =>
      datos && {
        ...datos,
        pendientes: datos.pendientes.map((i) =>
          i.contratacionId === actualizada.contratacionId ? actualizada : i,
        ),
      },
    );
  }
}
