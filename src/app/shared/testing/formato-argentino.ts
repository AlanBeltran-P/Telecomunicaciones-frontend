import { registerLocaleData } from '@angular/common';
import localeEsAr from '@angular/common/locales/es-AR';
import { LOCALE_ID, Provider } from '@angular/core';

registerLocaleData(localeEsAr);

/** Mismo formato de números, moneda y fechas que la app (app.config.ts): $ 18.500 */
export const FORMATO_ARGENTINO: Provider = { provide: LOCALE_ID, useValue: 'es-AR' };
