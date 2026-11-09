import { Injectable } from '@angular/core';
import { ErrorMock } from './respuestas';
import { PLANES_MOCK, PlanMock } from './datos/planes.mock';
import { USUARIOS_MOCK, UsuarioMock } from './datos/usuarios.mock';

const CLAVE_SESION = 'systema-tele.mock.sesion';

/**
 * "Base de datos" en memoria del modo mock, compartida por todas las rutas simuladas.
 * Arranca con los datos de ejemplo y se reinicia al recargar la página, salvo la sesión,
 * que imita a la cookie y queda en sessionStorage.
 */
@Injectable({ providedIn: 'root' })
export class MockDb {
  usuarios: UsuarioMock[] = structuredClone(USUARIOS_MOCK);
  planes: PlanMock[] = structuredClone(PLANES_MOCK);
  private ultimoId = 1000;

  nuevoId(): number {
    return ++this.ultimoId;
  }

  iniciarSesion(usuarioId: number): void {
    guardarEnSesion(String(usuarioId));
  }

  cerrarSesion(): void {
    guardarEnSesion(null);
  }

  /** El usuario de la "cookie". Sin sesión responde 401, como el backend. */
  usuarioLogueado(): UsuarioMock {
    const id = Number(leerDeSesion());
    const usuario = this.usuarios.find((u) => u.id === id && u.activo);
    if (!usuario) {
      throw new ErrorMock(401, 'Tenés que iniciar sesión');
    }
    return usuario;
  }
}

function leerDeSesion(): string | null {
  try {
    return sessionStorage.getItem(CLAVE_SESION);
  } catch {
    return null;
  }
}

function guardarEnSesion(valor: string | null): void {
  try {
    if (valor === null) {
      sessionStorage.removeItem(CLAVE_SESION);
    } else {
      sessionStorage.setItem(CLAVE_SESION, valor);
    }
  } catch {
    // Sin storage la sesión dura hasta recargar la página.
  }
}
