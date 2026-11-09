import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Cliente, CrearClienteRequest, EditarClienteRequest } from './cliente.model';

@Injectable({ providedIn: 'root' })
export class ClienteService {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiUrl}/clientes`;

  /** Sin texto devuelve todos; con texto busca por nombre, email o DNI. */
  buscar(texto = ''): Observable<Cliente[]> {
    const busqueda = texto.trim();
    const params = busqueda ? new HttpParams().set('busqueda', busqueda) : undefined;
    return this.http.get<Cliente[]>(this.url, { params });
  }

  ver(id: number): Observable<Cliente> {
    return this.http.get<Cliente>(`${this.url}/${id}`);
  }

  crear(datos: CrearClienteRequest): Observable<Cliente> {
    return this.http.post<Cliente>(this.url, datos);
  }

  editar(id: number, datos: EditarClienteRequest): Observable<Cliente> {
    return this.http.put<Cliente>(`${this.url}/${id}`, datos);
  }
}
