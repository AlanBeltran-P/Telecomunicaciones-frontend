import { CurrencyPipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { mensajeDeError } from '../../../core/http/mensaje-error';
import { Plan } from '../../../core/planes/plan.model';
import { PlanService } from '../../../core/planes/plan.service';
import { Icono } from '../../../shared/icono/icono';
import { Modal } from '../../../shared/modal/modal';
import { ToastService } from '../../../shared/toast/toast.service';
import { PlanFormulario } from './plan-formulario';

/** Catálogo de planes (GET/POST/PUT/DELETE /api/planes): lo que ven los clientes. */
@Component({
  selector: 'app-planes-admin',
  imports: [CurrencyPipe, Icono, Modal, PlanFormulario],
  templateUrl: './planes-admin.html',
  styleUrl: './planes-admin.css',
})
export class PlanesAdmin {
  private readonly planes = inject(PlanService);
  private readonly toasts = inject(ToastService);

  protected readonly lista = rxResource({ stream: () => this.planes.listar(), defaultValue: [] });
  protected readonly formularioAbierto = signal(false);
  /** El plan a editar; null para crear uno nuevo. */
  protected readonly editando = signal<Plan | null>(null);
  protected readonly aDarDeBaja = signal<Plan | null>(null);

  protected nuevo(): void {
    this.editando.set(null);
    this.formularioAbierto.set(true);
  }

  protected editar(plan: Plan): void {
    this.editando.set(plan);
    this.formularioAbierto.set(true);
  }

  protected guardado(plan: Plan): void {
    const existe = this.lista.value().some((p) => p.id === plan.id);
    this.lista.update((lista) =>
      existe ? lista.map((p) => (p.id === plan.id ? plan : p)) : [...lista, plan],
    );
    this.formularioAbierto.set(false);
  }

  protected confirmarBaja(plan: Plan): void {
    this.aDarDeBaja.set(null);
    this.planes.darDeBaja(plan.id).subscribe({
      next: () => {
        this.lista.update((lista) => lista.filter((p) => p.id !== plan.id));
        this.toasts.mostrar(`${plan.nombre} ya no se ofrece`);
      },
      error: (error: unknown) => this.toasts.mostrar(mensajeDeError(error)),
    });
  }
}
