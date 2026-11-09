import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Factura, PagoRequest } from './factura.model';

@Injectable({ providedIn: 'root' })
export class FacturaService {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiUrl}/facturas`;

  /** Las del cliente logueado, la más nueva primero. */
  mias(): Observable<Factura[]> {
    return this.http.get<Factura[]>(`${this.url}/mias`);
  }

  /** Devuelve la factura ya pagada. Si el proveedor rechaza el cobro, responde 402. */
  pagar(facturaId: number, pago: PagoRequest): Observable<Factura> {
    return this.http.post<Factura>(`${this.url}/${facturaId}/pagos`, pago);
  }
}
