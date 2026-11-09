import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Plan, PlanRequest } from './plan.model';

@Injectable({ providedIn: 'root' })
export class PlanService {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiUrl}/planes`;

  /** Catálogo público: solo los planes activos. */
  listar(): Observable<Plan[]> {
    return this.http.get<Plan[]>(this.url);
  }

  // ---------- Administrador ----------

  crear(datos: PlanRequest): Observable<Plan> {
    return this.http.post<Plan>(this.url, datos);
  }

  actualizar(id: number, datos: PlanRequest): Observable<Plan> {
    return this.http.put<Plan>(`${this.url}/${id}`, datos);
  }

  /** Baja lógica: deja de ofrecerse, pero las contrataciones existentes siguen. */
  darDeBaja(id: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`);
  }
}
