import { Rol } from '../../auth/rol';

export interface UsuarioMock {
  id: number;
  nombre: string;
  email: string;
  contrasena: string;
  rol: Rol;
  dni: string | null;
  telefono: string | null;
  activo: boolean;
  fechaAlta: string;
}

const CONTRASENA_DEMO = 'demo1234';

/** Una cuenta por rol (contraseña de todas: demo1234) y algunos clientes más. */
export const USUARIOS_MOCK: UsuarioMock[] = [
  { id: 1, nombre: 'Laura Méndez', email: 'admin@systematele.com', contrasena: CONTRASENA_DEMO, rol: 'ADMINISTRADOR', dni: null, telefono: null, activo: true, fechaAlta: '2025-01-10' },
  { id: 2, nombre: 'Martín Ruiz', email: 'empleado@systematele.com', contrasena: CONTRASENA_DEMO, rol: 'EMPLEADO', dni: null, telefono: null, activo: true, fechaAlta: '2025-02-03' },
  { id: 3, nombre: 'Carlos Gómez', email: 'tecnico@systematele.com', contrasena: CONTRASENA_DEMO, rol: 'TECNICO', dni: null, telefono: null, activo: true, fechaAlta: '2025-02-17' },
  { id: 4, nombre: 'Sofía Díaz', email: 'sofia.diaz@systematele.com', contrasena: CONTRASENA_DEMO, rol: 'TECNICO', dni: null, telefono: null, activo: true, fechaAlta: '2025-06-01' },
  { id: 10, nombre: 'Ana Pérez', email: 'cliente@systematele.com', contrasena: CONTRASENA_DEMO, rol: 'CLIENTE', dni: '35123456', telefono: '11 5555-1234', activo: true, fechaAlta: '2025-03-12' },
  { id: 11, nombre: 'Juan Torres', email: 'juan.torres@mail.com', contrasena: CONTRASENA_DEMO, rol: 'CLIENTE', dni: '28456789', telefono: '11 4444-9876', activo: true, fechaAlta: '2025-05-20' },
  { id: 12, nombre: 'María López', email: 'maria.lopez@mail.com', contrasena: CONTRASENA_DEMO, rol: 'CLIENTE', dni: '40111222', telefono: '351 555-0101', activo: true, fechaAlta: '2025-09-02' },
  { id: 13, nombre: 'Diego Fernández', email: 'diego.f@mail.com', contrasena: CONTRASENA_DEMO, rol: 'CLIENTE', dni: '33999888', telefono: '341 555-2020', activo: true, fechaAlta: '2026-10-28' },
];
