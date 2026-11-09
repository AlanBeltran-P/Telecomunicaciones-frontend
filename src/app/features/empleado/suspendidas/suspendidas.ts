import { DatePipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { nombreDelCliente } from '../../../core/clientes/cliente.model';
import { ClienteService } from '../../../core/clientes/cliente.service';
import {
  Contratacion,
  INSIGNIA_DE_CONTRATACION,
} from '../../../core/contrataciones/contratacion.model';
import { ContratacionService } from '../../../core/contrataciones/contratacion.service';
import { mensajeDeError } from '../../../core/http/mensaje-error';
import { Icono } from '../../../shared/icono/icono';
import { ToastService } from '../../../shared/toast/toast.service';

/**
 * Contrataciones suspendidas por falta de pago (GET /api/contrataciones/suspendidas)
 * y su reactivación (PUT /api/contrataciones/{id}/reactivacion).
 * Las reactivadas quedan en la tabla con su estado nuevo hasta salir de la pantalla.
 */
@Component({
  selector: 'app-suspendidas',
  imports: [DatePipe, RouterLink, Icono],
  templateUrl: './suspendidas.html',
  styleUrl: './suspendidas.css',
})
export class Suspendidas {
  private readonly contrataciones = inject(ContratacionService);
  private readonly clientes = inject(ClienteService);
  private readonly toasts = inject(ToastService);

  protected readonly datos = rxResource({
    stream: () =>
      forkJoin({
        suspendidas: this.contrataciones.suspendidas(),
        clientes: this.clientes.buscar(),
      }),
  });
  protected readonly nombreDelCliente = nombreDelCliente;
  protected readonly insignia = INSIGNIA_DE_CONTRATACION;
  protected readonly guardando = signal<number | null>(null);

  protected reactivar(contratacion: Contratacion): void {
    this.guardando.set(contratacion.id);
    this.contrataciones.reactivar(contratacion.id).subscribe({
      next: (reactivada) => {
        this.reemplazar(reactivada);
        this.guardando.set(null);
        this.toasts.mostrar('Contratación reactivada');
      },
      error: (error: unknown) => {
        this.guardando.set(null);
        this.toasts.mostrar(mensajeDeError(error));
      },
    });
  }

  private reemplazar(reactivada: Contratacion): void {
    this.datos.update((datos) =>
      datos && {
        ...datos,
        suspendidas: datos.suspendidas.map((c) => (c.id === reactivada.id ? reactivada : c)),
      },
    );
  }
}
