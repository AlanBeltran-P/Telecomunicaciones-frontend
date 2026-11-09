import { Rol } from '../auth/rol';

/** UsuarioResponse del backend (personal y técnicos). */
export interface Usuario {
  id: number;
  nombre: string;
  email: string;
  rol: Rol;
  activo: boolean;
}

/** Alta de personal que hace un administrador (CrearUsuarioRequest). */
export interface CrearUsuarioRequest {
  nombre: string;
  email: string;
  contrasena: string;
  rol: Rol;
}
