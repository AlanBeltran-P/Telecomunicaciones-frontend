import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Plan } from './plan.model';

@Injectable({ providedIn: 'root' })
export class PlanService {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiUrl}/planes`;

  /** Catálogo público: solo los planes activos. */
  listar(): Observable<Plan[]> {
    return this.http.get<Plan[]>(this.url);
  }
}
