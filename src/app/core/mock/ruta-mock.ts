import { HttpRequest, HttpResponse } from '@angular/common/http';
import { MockDb } from './mock-db';

export interface PedidoMock {
  req: HttpRequest<unknown>;
  /** Lo que capturan los paréntesis del patrón, ej. el id en /facturas/(\d+)/pagos */
  parametros: string[];
  db: MockDb;
}

/** Un endpoint simulado: método + ruta (sin el /api) + qué responde. */
export interface RutaMock {
  metodo: 'GET' | 'POST' | 'PUT' | 'DELETE';
  patron: RegExp;
  responder: (pedido: PedidoMock) => HttpResponse<unknown>;
}
