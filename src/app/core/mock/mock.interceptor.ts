import {
  HttpErrorResponse,
  HttpInterceptorFn,
  HttpRequest,
  HttpResponse,
} from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, map, throwError, timer } from 'rxjs';
import { environment } from '../../../environments/environment';
import { MockDb } from './mock-db';
import { ErrorMock } from './respuestas';
import { RutaMock } from './ruta-mock';
import { RUTAS_AUTH } from './rutas/auth.mock';
import { RUTAS_PLANES } from './rutas/planes.mock';

/** Demora para que se vean los estados de carga, como con un backend real. */
const DEMORA_MS = 300;

// Cada etapa suma acá sus rutas (planes, facturas, contrataciones, reportes...)
const RUTAS: RutaMock[] = [...RUTAS_AUTH, ...RUTAS_PLANES];

/** Modo mock: responde los pedidos a /api con datos en memoria, sin llamar al backend. */
export const mockInterceptor: HttpInterceptorFn = (req, next) => {
  if (!req.url.startsWith(environment.apiUrl)) {
    return next(req);
  }
  const db = inject(MockDb);
  return timer(DEMORA_MS).pipe(
    map(() => responder(req, db)),
    catchError((error: unknown) => throwError(() => aErrorHttp(error, req.url))),
  );
};

function responder(req: HttpRequest<unknown>, db: MockDb): HttpResponse<unknown> {
  const ruta = req.url.slice(environment.apiUrl.length);
  for (const candidata of RUTAS) {
    const coincidencia = candidata.metodo === req.method ? candidata.patron.exec(ruta) : null;
    if (coincidencia) {
      return candidata.responder({ req, parametros: coincidencia.slice(1), db });
    }
  }
  throw new ErrorMock(404, `El modo mock no tiene ${req.method} ${ruta}`);
}

/** Los errores de negocio salen con el mismo formato que el backend (ProblemDetail). */
function aErrorHttp(error: unknown, url: string): unknown {
  if (!(error instanceof ErrorMock)) {
    return error;
  }
  const problema = { status: error.status, detail: error.detail };
  return new HttpErrorResponse({ status: error.status, url, error: problema });
}
