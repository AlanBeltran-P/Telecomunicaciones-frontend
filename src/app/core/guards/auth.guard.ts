import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../auth/auth.service';
import { Rol } from '../auth/rol';

/** Solo usuarios logueados. Si no, va al login y después vuelve a donde quería ir. */
export const authGuard: CanActivateFn = (_ruta, estado) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  return auth.autenticado()
    ? true
    : router.createUrlTree(['/login'], { queryParams: { volver: estado.url } });
};

/** Solo estos roles. Otro rol va a su propia pantalla. Usar después de authGuard. */
export const rolGuard =
  (...roles: Rol[]): CanActivateFn =>
  () => {
    const auth = inject(AuthService);
    const router = inject(Router);
    return auth.tieneRol(...roles) ? true : router.parseUrl(auth.rutaDeInicio());
  };

/** Login y registro: si ya hay sesión, va directo a su pantalla. */
export const invitadoGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  return auth.autenticado() ? router.parseUrl(auth.rutaDeInicio()) : true;
};
