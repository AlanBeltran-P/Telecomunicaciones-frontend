import { CurrencyPipe } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { map } from 'rxjs';
import { AuthService } from '../../../core/auth/auth.service';
import { Plan } from '../../../core/planes/plan.model';
import { PlanService } from '../../../core/planes/plan.service';

/** Planes del catálogo (GET /api/planes) con esqueleto mientras cargan. */
@Component({
  selector: 'app-planes-home',
  imports: [CurrencyPipe, RouterLink],
  templateUrl: './planes-home.html',
})
export class PlanesHome {
  private readonly planService = inject(PlanService);
  private readonly auth = inject(AuthService);

  protected readonly planes = rxResource({
    stream: () => this.planService.listar().pipe(map(ordenarPorPrecio)),
    defaultValue: [],
  });
  protected readonly recomendado = computed(() => planDelMedio(this.planes.value()));
  /** Sin sesión, contratar empieza por crear la cuenta. */
  protected readonly destinoContratar = computed(() =>
    this.auth.autenticado() ? this.auth.rutaDeInicio() : '/registro',
  );
}

function ordenarPorPrecio(planes: Plan[]): Plan[] {
  return [...planes].sort((a, b) => a.precio - b.precio);
}

/** El de precio intermedio: ni el más barato ni el más caro. */
function planDelMedio(ordenados: Plan[]): Plan | undefined {
  return ordenados[Math.floor((ordenados.length - 1) / 2)];
}
