import { HttpErrorResponse } from '@angular/common/http';
import { mensajeDeError } from './mensaje-error';

function errorHttp(status: number, cuerpo: unknown = null): HttpErrorResponse {
  return new HttpErrorResponse({ status, error: cuerpo });
}

describe('mensajeDeError', () => {
  it('usa el detalle que manda el backend', () => {
    const error = errorHttp(409, { status: 409, detail: 'El email ana@mail.com ya está en uso' });
    expect(mensajeDeError(error)).toBe('El email ana@mail.com ya está en uso');
  });

  it('suma los errores de cada campo', () => {
    const error = errorHttp(400, {
      status: 400,
      detail: 'Datos inválidos',
      errores: { dni: 'debe tener 7 u 8 dígitos' },
    });
    expect(mensajeDeError(error)).toBe('Datos inválidos: dni debe tener 7 u 8 dígitos');
  });

  it('avisa cuando no hay conexión', () => {
    expect(mensajeDeError(errorHttp(0))).toContain('No se pudo conectar');
  });

  it('sin detalle muestra un mensaje genérico', () => {
    expect(mensajeDeError(errorHttp(500))).toBe('Ocurrió un error inesperado.');
  });

  it('un error que no es HTTP también tiene mensaje', () => {
    expect(mensajeDeError(new Error('x'))).toBe('Ocurrió un error inesperado.');
  });
});
