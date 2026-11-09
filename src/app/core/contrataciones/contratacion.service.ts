import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Contratacion, ContratarPlanRequest } from './contratacion.model';

@Injectable({ providedIn: 'root' })
export class ContratacionService {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiUrl}/contrataciones`;

  /** Sube cada vez que el cliente contrata, para que las pantallas vuelvan a pedir la lista. */
  readonly cambios = signal(0);

  misContrataciones(): Observable<Contratacion[]> {
    return this.http.get<Contratacion[]>(`${this.url}/mias`);
  }

  contratar(pedido: ContratarPlanRequest): Observable<Contratacion> {
    return this.http
      .post<Contratacion>(this.url, pedido)
      .pipe(tap(() => this.cambios.update((n) => n + 1)));
  }
}
