import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Contratacion, ContratarPlanRequest } from './contratacion.model';

@Injectable({ providedIn: 'root' })
export class ContratacionService {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiUrl}/contrataciones`;

  /** Sube cada vez que se contrata un plan, para que las pantallas vuelvan a pedir la lista. */
  readonly cambios = signal(0);

  // ---------- Cliente ----------

  misContrataciones(): Observable<Contratacion[]> {
    return this.http.get<Contratacion[]>(`${this.url}/mias`);
  }

  contratar(pedido: ContratarPlanRequest): Observable<Contratacion> {
    return this.http.post<Contratacion>(this.url, pedido).pipe(tap(() => this.avisarCambio()));
  }

  // ---------- Empleado ----------

  delCliente(clienteId: number): Observable<Contratacion[]> {
    return this.http.get<Contratacion[]>(`${this.url}/clientes/${clienteId}`);
  }

  contratarParaCliente(clienteId: number, pedido: ContratarPlanRequest): Observable<Contratacion> {
    return this.http
      .post<Contratacion>(`${this.url}/clientes/${clienteId}`, pedido)
      .pipe(tap(() => this.avisarCambio()));
  }

  /** Dadas de baja automáticamente por una factura impaga. */
  suspendidas(): Observable<Contratacion[]> {
    return this.http.get<Contratacion[]>(`${this.url}/suspendidas`);
  }

  reactivar(id: number): Observable<Contratacion> {
    return this.http.put<Contratacion>(`${this.url}/${id}/reactivacion`, null);
  }

  /** La contratación queda en BAJA (no se borra). */
  darDeBaja(id: number): Observable<Contratacion> {
    return this.http.put<Contratacion>(`${this.url}/${id}/baja`, null);
  }

  private avisarCambio(): void {
    this.cambios.update((n) => n + 1);
  }
}
