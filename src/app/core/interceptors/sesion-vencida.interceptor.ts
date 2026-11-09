import { HttpErrorResponse, HttpInterceptorFn, HttpStatusCode } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../auth/auth.service';

/** Si había sesión y el backend responde 401, la cookie venció: cierra la sesión y va al login. */
export const sesionVencidaInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  return next(req).pipe(
    catchError((error: unknown) => {
      if (esNoAutorizado(error) && auth.autenticado()) {
        auth.cerrarSesionLocal();
      }
      return throwError(() => error);
    }),
  );
};

function esNoAutorizado(error: unknown): boolean {
  return error instanceof HttpErrorResponse && error.status === HttpStatusCode.Unauthorized;
}
