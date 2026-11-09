import { Component, computed, effect, inject, input, output, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { mensajeDeError } from '../../../core/http/mensaje-error';
import { Plan, PlanRequest } from '../../../core/planes/plan.model';
import { PlanService } from '../../../core/planes/plan.service';
import { Modal } from '../../../shared/modal/modal';
import { ToastService } from '../../../shared/toast/toast.service';

type Campo = 'nombre' | 'precio';

/** Alta (POST /api/planes) o edición (PUT /api/planes/{id}) de un plan. */
@Component({
  selector: 'app-plan-formulario',
  imports: [ReactiveFormsModule, Modal],
  templateUrl: './plan-formulario.html',
})
export class PlanFormulario {
  private readonly planes = inject(PlanService);
  private readonly toasts = inject(ToastService);

  readonly abierto = input(false);
  /** El plan a editar; null para crear uno nuevo. */
  readonly plan = input<Plan | null>(null);
  readonly guardado = output<Plan>();
  readonly cerrar = output<void>();

  protected readonly titulo = computed(() => (this.plan() ? 'Editar plan' : 'Nuevo plan'));
  protected readonly enviando = signal(false);
  protected readonly error = signal<string | null>(null);

  // Mismas reglas que PlanRequest en el backend: nombre obligatorio y precio positivo
  protected readonly formulario = new FormGroup({
    nombre: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    descripcion: new FormControl('', { nonNullable: true }),
    precio: new FormControl<number | null>(null, {
      validators: [Validators.required, Validators.min(0.01)],
    }),
  });

  constructor() {
    // Cada vez que se abre, arranca con los datos del plan (o vacío para uno nuevo)
    effect(() => {
      if (this.abierto()) {
        this.cargarDatos(this.plan());
      }
    });
  }

  protected campoInvalido(campo: Campo): boolean {
    const control = this.formulario.controls[campo];
    return control.invalid && control.touched;
  }

  protected guardar(): void {
    const { nombre, descripcion, precio } = this.formulario.getRawValue();
    if (this.formulario.invalid || precio === null) {
      this.formulario.markAllAsTouched();
      return;
    }
    this.enviando.set(true);
    this.error.set(null);
    this.pedido({ nombre, descripcion: descripcion.trim() || null, precio }).subscribe({
      next: (plan) => {
        this.enviando.set(false);
        this.toasts.mostrar('Plan guardado');
        this.guardado.emit(plan);
      },
      error: (error: unknown) => {
        this.error.set(mensajeDeError(error));
        this.enviando.set(false);
      },
    });
  }

  private pedido(datos: PlanRequest): Observable<Plan> {
    const plan = this.plan();
    return plan ? this.planes.actualizar(plan.id, datos) : this.planes.crear(datos);
  }

  private cargarDatos(plan: Plan | null): void {
    this.error.set(null);
    this.formulario.reset({
      nombre: plan?.nombre ?? '',
      descripcion: plan?.descripcion ?? '',
      precio: plan?.precio ?? null,
    });
  }
}
