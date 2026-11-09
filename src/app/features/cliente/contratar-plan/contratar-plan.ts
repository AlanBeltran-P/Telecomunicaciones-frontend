import { CurrencyPipe } from '@angular/common';
import { Component, inject, input, output, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ContratacionService } from '../../../core/contrataciones/contratacion.service';
import { mensajeDeError } from '../../../core/http/mensaje-error';
import { PlanService } from '../../../core/planes/plan.service';
import { Modal } from '../../../shared/modal/modal';
import { ToastService } from '../../../shared/toast/toast.service';

type Campo = 'planId' | 'direccion';

/** Modal para contratar un plan del catálogo (POST /api/contrataciones). */
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
  readonly cerrar = output<void>();

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
    this.contrataciones.contratar({ planId, direccion }).subscribe({
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

  private terminar(): void {
    this.toasts.mostrar('Plan contratado. Te avisamos cuando haya un técnico asignado.');
    this.cancelar();
    void this.router.navigate(['/cliente/planes']);
  }
}
