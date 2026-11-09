import { HttpErrorResponse } from '@angular/common/http';

/** Formato de error del backend (ProblemDetail, RFC 9457). */
export interface ProblemDetail {
  status: number;
  title?: string;
  detail?: string;
  /** Solo en errores de validación: { campo: mensaje } */
  errores?: Record<string, string>;
}

const ERROR_INESPERADO = 'Ocurrió un error inesperado.';
const SIN_CONEXION = 'No se pudo conectar con el servidor. Revisá tu conexión e intentá de nuevo.';

/** Convierte un error HTTP en un mensaje para mostrarle al usuario. */
export function mensajeDeError(error: unknown): string {
  if (!(error instanceof HttpErrorResponse)) {
    return ERROR_INESPERADO;
  }
  if (error.status === 0) {
    return SIN_CONEXION;
  }
  const problema = error.error as Partial<ProblemDetail> | null;
  const detalle = problema?.detail ?? ERROR_INESPERADO;
  const campos = Object.entries(problema?.errores ?? {}).map(
    ([campo, mensaje]) => `${campo} ${mensaje}`,
  );
  return campos.length ? `${detalle}: ${campos.join(', ')}` : detalle;
}
