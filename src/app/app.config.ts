import { registerLocaleData } from '@angular/common';
import { HttpInterceptorFn, provideHttpClient, withInterceptors } from '@angular/common/http';
import localeEsAr from '@angular/common/locales/es-AR';
import {
  ApplicationConfig,
  LOCALE_ID,
  inject,
  provideAppInitializer,
  provideBrowserGlobalErrorListeners,
} from '@angular/core';
import { provideRouter, withComponentInputBinding, withInMemoryScrolling } from '@angular/router';
import { environment } from '../environments/environment';
import { routes } from './app.routes';
import { AuthService } from './core/auth/auth.service';
import { apiInterceptor } from './core/interceptors/api.interceptor';
import { sesionVencidaInterceptor } from './core/interceptors/sesion-vencida.interceptor';
import { mockInterceptor } from './core/mock/mock.interceptor';

registerLocaleData(localeEsAr);

// El mock va último: recibe el pedido ya preparado y responde sin salir al backend
const interceptores: HttpInterceptorFn[] = environment.usarMock
  ? [apiInterceptor, sesionVencidaInterceptor, mockInterceptor]
  : [apiInterceptor, sesionVencidaInterceptor];

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(
      routes,
      withComponentInputBinding(),
      withInMemoryScrolling({ anchorScrolling: 'enabled', scrollPositionRestoration: 'enabled' }),
    ),
    provideHttpClient(withInterceptors(interceptores)),
    // Antes de mostrar la primera pantalla, averigua si hay sesión
    provideAppInitializer(() => inject(AuthService).cargarSesion()),
    { provide: LOCALE_ID, useValue: 'es-AR' },
  ],
};
