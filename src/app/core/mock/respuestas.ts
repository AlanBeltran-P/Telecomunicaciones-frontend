import { HttpResponse } from '@angular/common/http';

export function respuesta<T>(cuerpo: T, status = 200): HttpResponse<T> {
  return new HttpResponse({ status, body: cuerpo });
}

export function sinContenido(): HttpResponse<null> {
  return new HttpResponse({ status: 204, body: null });
}

/** Error de negocio simulado. El interceptor lo devuelve como ProblemDetail, igual que el backend. */
export class ErrorMock extends Error {
  constructor(
    readonly status: number,
    readonly detail: string,
  ) {
    super(detail);
  }
}
