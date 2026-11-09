import { CurrencyPipe } from '@angular/common';
import { Component, computed, inject, input, output, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { Contratacion, ContratarPlanRequest } from '../../../core/contrataciones/contratacion.model';
import { ContratacionService } from '../../../core/contrataciones/contratacion.service';
import { mensajeDeError } from '../../../core/http/mensaje-error';
import { PlanService } from '../../../core/planes/plan.service';
import { Modal } from '../../../shared/modal/modal';
import { ToastService } from '../../../shared/toast/toast.service';

type Campo = 'planId' | 'direccion';

export interface ClienteQueContrata {
  id: number;
  nombre: string;
}

/**
 * Modal para contratar un plan del catálogo.
 * Sin cliente contrata el cliente logueado (POST /api/contrataciones);
 * con cliente, un empleado contrata por él (POST /api/contrataciones/clientes/{id}).
 */
@Component({
  selector: 'app-contratar-plan',
  imports: [CurrencyPipe, ReactiveFormsModule, Modal],
  templateUrl: './contratar-plan.html',
})
export class ContratarPlan {
  private readonly planService = inject(PlanService);
  private readonly contrataciones = inject(ContratacionService);
  private readonly toasts = inject(ToastService);
  private readonly router = inject(Router);

  readonly abierto = input(false);
  readonly cliente = input<ClienteQueContrata | null>(null);
  readonly cerrar = output<void>();

  protected readonly titulo = computed(() => {
    const cliente = this.cliente();
    return cliente ? `Contratar para ${cliente.nombre}` : 'Contratar un plan';
  });
  protected readonly descripcion = computed(() =>
    this.cliente()
      ? 'Queda pendiente de instalación hasta que se asigne un técnico.'
      : 'Te avisamos cuando asignemos un técnico para la instalación.',
  );

  protected readonly planes = rxResource({
    stream: () => this.planService.listar(),
    defaultValue: [],
  });
  protected readonly enviando = signal(false);
  protected readonly error = signal<string | null>(null);

  protected readonly formulario = new FormGroup({
    planId: new FormControl<number | null>(null, { validators: [Validators.required] }),
    direccion: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
  });

  protected campoInvalido(campo: Campo): boolean {
    const control = this.formulario.controls[campo];
    return control.invalid && control.touched;
  }

  protected contratar(): void {
    const { planId, direccion } = this.formulario.getRawValue();
    if (this.formulario.invalid || planId === null) {
      this.formulario.markAllAsTouched();
      return;
    }
    this.enviando.set(true);
    this.error.set(null);
    this.pedido({ planId, direccion }).subscribe({
      next: () => this.terminar(),
      error: (error: unknown) => {
        this.error.set(mensajeDeError(error));
        this.enviando.set(false);
      },
    });
  }

  protected cancelar(): void {
    this.formulario.reset();
    this.error.set(null);
    this.enviando.set(false);
    this.cerrar.emit();
  }

  private pedido(datos: ContratarPlanRequest): Observable<Contratacion> {
    const cliente = this.cliente();
    return cliente
      ? this.contrataciones.contratarParaCliente(cliente.id, datos)
      : this.contrataciones.contratar(datos);
  }

  private terminar(): void {
    const paraUnCliente = this.cliente() !== null;
    this.toasts.mostrar(
      paraUnCliente
        ? 'Plan contratado para el cliente'
        : 'Plan contratado. Te avisamos cuando haya un técnico asignado.',
    );
    this.cancelar();
    if (!paraUnCliente) {
      void this.router.navigate(['/cliente/planes']);
    }
  }
}
