import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Rol } from '../auth/rol';
import { CrearUsuarioRequest, Usuario } from './usuario.model';

@Injectable({ providedIn: 'root' })
export class UsuarioService {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiUrl}/usuarios`;

  /** Empleado: técnicos activos, para asignar instalaciones. */
  tecnicosActivos(): Observable<Usuario[]> {
    return this.http.get<Usuario[]>(`${environment.apiUrl}/tecnicos`);
  }

  // ---------- Administrador ----------

  /** Todo el personal (sin clientes). */
  listar(): Observable<Usuario[]> {
    return this.http.get<Usuario[]>(this.url);
  }

  crear(datos: CrearUsuarioRequest): Observable<Usuario> {
    return this.http.post<Usuario>(this.url, datos);
  }

  cambiarRol(id: number, rol: Rol): Observable<Usuario> {
    return this.http.put<Usuario>(`${this.url}/${id}/rol`, { rol });
  }

  desactivar(id: number): Observable<void> {
    return this.http.put<void>(`${this.url}/${id}/desactivar`, null);
  }
}
