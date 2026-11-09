import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Instalacion } from './instalacion.model';

@Injectable({ providedIn: 'root' })
export class InstalacionService {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiUrl}/instalaciones`;

  // ---------- Empleado ----------

  /** Todas las que esperan instalación, la más antigua primero. */
  pendientes(): Observable<Instalacion[]> {
    return this.http.get<Instalacion[]>(`${this.url}/pendientes`);
  }

  asignarTecnico(contratacionId: number, tecnicoId: number): Observable<Instalacion> {
    return this.http.put<Instalacion>(`${this.url}/${contratacionId}/tecnico`, { tecnicoId });
  }

  // ---------- Técnico ----------

  /** Las pendientes asignadas al técnico logueado. */
  mias(): Observable<Instalacion[]> {
    return this.http.get<Instalacion[]>(`${this.url}/mias`);
  }

  /** Las que ya hizo el técnico logueado, la más reciente primero. */
  realizadas(): Observable<Instalacion[]> {
    return this.http.get<Instalacion[]>(`${this.url}/realizadas`);
  }

  /** El servicio queda activo. */
  marcarRealizada(contratacionId: number): Observable<Instalacion> {
    return this.http.put<Instalacion>(`${this.url}/${contratacionId}/realizada`, null);
  }
}
