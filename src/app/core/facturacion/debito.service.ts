import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, catchError, of, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { DebitoAutomatico, PagoRequest } from './factura.model';

@Injectable({ providedIn: 'root' })
export class DebitoService {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiUrl}/facturas/debito-automatico`;

  /** null si el cliente no lo tiene activado (el backend responde 404). */
  consultar(): Observable<DebitoAutomatico | null> {
    return this.http
      .get<DebitoAutomatico>(this.url)
      .pipe(
        catchError((error: unknown) =>
          esNoEncontrado(error) ? of(null) : throwError(() => error),
        ),
      );
  }

  /** Activa el débito o, si ya estaba activo, cambia el medio de pago. */
  activar(pago: PagoRequest): Observable<DebitoAutomatico> {
    return this.http.put<DebitoAutomatico>(this.url, pago);
  }

  desactivar(): Observable<void> {
    return this.http.delete<void>(this.url);
  }
}

function esNoEncontrado(error: unknown): boolean {
  return error instanceof HttpErrorResponse && error.status === 404;
}
