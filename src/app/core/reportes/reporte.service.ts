import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, forkJoin } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  RangoDeReporte,
  ReporteContrataciones,
  ReporteFacturacion,
  ReporteUsuarios,
  Reportes,
} from './reporte.model';

/** Reportes del administrador. Los tres reciben el mismo rango. */
@Injectable({ providedIn: 'root' })
export class ReporteService {
  private readonly http = inject(HttpClient);

  /** Pide los tres reportes juntos. */
  todos(rango: RangoDeReporte): Observable<Reportes> {
    return forkJoin({
      usuarios: this.pedir<ReporteUsuarios>('usuarios', rango),
      contrataciones: this.pedir<ReporteContrataciones>('contrataciones', rango),
      facturacion: this.pedir<ReporteFacturacion>('facturas', rango),
    });
  }

  private pedir<T>(servicio: string, { desde, hasta, agrupacion }: RangoDeReporte): Observable<T> {
    const params = new HttpParams().set('desde', desde).set('hasta', hasta).set('agrupacion', agrupacion);
    return this.http.get<T>(`${environment.apiUrl}/${servicio}/reporte`, { params });
  }
}
