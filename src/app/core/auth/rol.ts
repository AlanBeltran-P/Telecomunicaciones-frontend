export type Rol = 'ADMINISTRADOR' | 'EMPLEADO' | 'TECNICO' | 'CLIENTE';

export const NOMBRE_DEL_ROL: Record<Rol, string> = {
  ADMINISTRADOR: 'Administrador',
  EMPLEADO: 'Empleado',
  TECNICO: 'Técnico',
  CLIENTE: 'Cliente',
};

/** Pantalla a la que va cada rol al iniciar sesión. */
export const INICIO_DEL_ROL: Record<Rol, string> = {
  ADMINISTRADOR: '/admin',
  EMPLEADO: '/empleado',
  TECNICO: '/tecnico',
  CLIENTE: '/cliente',
};
