/** ClienteResponse del backend. */
export interface Cliente {
  id: number;
  nombre: string;
  email: string;
  dni: string;
  telefono: string;
  activo: boolean;
}

/** Alta de un cliente que hace un empleado (CrearClienteRequest). */
export interface CrearClienteRequest {
  nombre: string;
  email: string;
  contrasena: string;
  dni: string;
  telefono: string;
}

/** Edición de los datos (EditarClienteRequest): la contraseña no se toca. */
export type EditarClienteRequest = Omit<CrearClienteRequest, 'contrasena'>;

/** Nombre del cliente con ese id, para listas que solo traen el id. */
export function nombreDelCliente(clientes: Cliente[], id: number): string {
  return clientes.find((cliente) => cliente.id === id)?.nombre ?? `Cliente ${id}`;
}
