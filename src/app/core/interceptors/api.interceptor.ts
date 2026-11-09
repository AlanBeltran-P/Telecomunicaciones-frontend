import { HttpInterceptorFn } from '@angular/common/http';
import { environment } from '../../../environments/environment';

/**
 * Pedidos al backend: manda la cookie de sesión y pide los errores en español
 * (el backend traduce los ProblemDetail según Accept-Language).
 */
export const apiInterceptor: HttpInterceptorFn = (req, next) => {
  if (!req.url.startsWith(environment.apiUrl)) {
    return next(req);
  }
  return next(req.clone({ withCredentials: true, setHeaders: { 'Accept-Language': 'es' } }));
};
