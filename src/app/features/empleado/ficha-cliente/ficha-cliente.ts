import { DatePipe } from '@angular/common';
import { Component, computed, inject, input, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { Observable } from 'rxjs';
import { Cliente } from '../../../core/clientes/cliente.model';
import { ClienteService } from '../../../core/clientes/cliente.service';
import {
  Contratacion,
  INSIGNIA_DE_CONTRATACION,
} from '../../../core/contrataciones/contratacion.model';
import { ContratacionService } from '../../../core/contrataciones/contratacion.service';
import { mensajeDeError } from '../../../core/http/mensaje-error';
import { Modal } from '../../../shared/modal/modal';
import { ToastService } from '../../../shared/toast/toast.service';
import { ContratarPlan } from '../../cliente/contratar-plan/contratar-plan';
import { ClienteFormulario } from '../cliente-formulario/cliente-formulario';

/**
 * Ficha de un cliente: sus datos (GET /api/clientes/{id}) y sus contrataciones
 * (GET /api/contrataciones/clientes/{id}). Desde acá se contrata, se da de baja y se reactiva.
 */
@Component({
  selector: 'app-ficha-cliente',
  imports: [DatePipe, RouterLink, Modal, ContratarPlan, ClienteFormulario],
  templateUrl: './ficha-cliente.html',
  styleUrl: './ficha-cliente.css',
})
export class FichaCliente {
  private readonly clientes = inject(ClienteService);
  private readonly contrataciones = inject(ContratacionService);
  private readonly toasts = inject(ToastService);

  /** Viene de la ruta /empleado/clientes/:id */
  readonly id = input.required<string>();
  private readonly clienteId = computed(() => Number(this.id()));

  protected readonly cliente = rxResource({
    params: () => this.clienteId(),
    stream: ({ params }) => this.clientes.ver(params),
  });
  protected readonly lista = rxResource({
    params: () => ({ id: this.clienteId(), cambios: this.contrataciones.cambios() }),
    stream: ({ params }) => this.contrataciones.delCliente(params.id),
    defaultValue: [],
  });

  protected readonly insignia = INSIGNIA_DE_CONTRATACION;
  protected readonly editando = signal(false);
  protected readonly contratando = signal(false);
  /** La que se está por dar de baja (espera confirmación). */
  protected readonly aDarDeBaja = signal<Contratacion | null>(null);
  protected readonly enviando = signal(false);

  protected datosGuardados(cliente: Cliente): void {
    this.cliente.set(cliente);
    this.editando.set(false);
  }

  protected confirmarBaja(contratacion: Contratacion): void {
    this.aDarDeBaja.set(null);
    this.cambiarEstado(this.contrataciones.darDeBaja(contratacion.id), 'Contratación dada de baja');
  }

  protected reactivar(contratacion: Contratacion): void {
    this.cambiarEstado(this.contrataciones.reactivar(contratacion.id), 'Contratación reactivada');
  }

  private cambiarEstado(pedido: Observable<Contratacion>, aviso: string): void {
    this.enviando.set(true);
    pedido.subscribe({
      next: (actualizada) => {
        this.lista.update((lista) => lista.map((c) => (c.id === actualizada.id ? actualizada : c)));
        this.enviando.set(false);
        this.toasts.mostrar(aviso);
      },
      error: (error: unknown) => {
        this.enviando.set(false);
        this.toasts.mostrar(mensajeDeError(error));
      },
    });
  }
}
