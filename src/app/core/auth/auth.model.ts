import { Rol } from './rol';

/** POST /api/auth/login */
export interface LoginRequest {
  email: string;
  contrasena: string;
}

/** Respuesta de login y registro. El token viaja en una cookie httpOnly, no acá. */
export interface LoginResponse {
  id: number;
  email: string;
  rol: Rol;
}

/** POST /api/auth/registro (alta de un cliente) */
export interface RegistroRequest {
  nombre: string;
  email: string;
  contrasena: string;
  dni: string;
  telefono: string;
}

/** GET /api/usuarios/yo */
export interface Perfil {
  id: number;
  nombre: string;
  email: string;
  rol: Rol;
  dni: string | null;
  telefono: string | null;
}
