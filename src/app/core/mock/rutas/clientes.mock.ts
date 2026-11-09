import { Cliente, CrearClienteRequest, EditarClienteRequest } from '../../clientes/cliente.model';
import { Usuario } from '../../usuarios/usuario.model';
import { UsuarioMock } from '../datos/usuarios.mock';
import { hoy } from '../fechas';
import { MockDb } from '../mock-db';
import { ErrorMock, respuesta } from '../respuestas';
import { RutaMock } from '../ruta-mock';

/** Rutas del empleado sobre usuarios: clientes y técnicos. */
export const RUTAS_CLIENTES: RutaMock[] = [
  {
    metodo: 'GET',
    patron: /^\/clientes$/,
    responder: ({ req, db }) => {
      const texto = (req.params.get('busqueda') ?? '').trim().toLowerCase();
      const clientes = db.usuarios.filter((u) => u.rol === 'CLIENTE');
      return respuesta(clientes.filter((c) => coincide(c, texto)).map(aCliente));
    },
  },
  {
    metodo: 'GET',
    patron: /^\/clientes\/(\d+)$/,
    responder: ({ parametros, db }) => respuesta(aCliente(buscarCliente(db, Number(parametros[0])))),
  },
  {
    metodo: 'POST',
    patron: /^\/clientes$/,
    responder: ({ req, db }) => {
      const datos = req.body as CrearClienteRequest;
      validarQueEsteLibre(db, datos, null);
      const cliente: UsuarioMock = { ...datos, id: db.nuevoId(), rol: 'CLIENTE', activo: true, fechaAlta: hoy() };
      db.usuarios.push(cliente);
      return respuesta(aCliente(cliente), 201);
    },
  },
  {
    metodo: 'PUT',
    patron: /^\/clientes\/(\d+)$/,
    responder: ({ req, parametros, db }) => {
      const cliente = buscarCliente(db, Number(parametros[0]));
      const datos = req.body as EditarClienteRequest;
      validarQueEsteLibre(db, datos, cliente.id);
      Object.assign(cliente, datos);
      return respuesta(aCliente(cliente));
    },
  },
  {
    metodo: 'GET',
    patron: /^\/tecnicos$/,
    responder: ({ db }) => {
      const tecnicos = db.usuarios.filter((u) => u.rol === 'TECNICO' && u.activo);
      return respuesta(tecnicos.map(aUsuario));
    },
  },
];

export function aUsuario({ id, nombre, email, rol, activo }: UsuarioMock): Usuario {
  return { id, nombre, email, rol, activo };
}

function aCliente({ id, nombre, email, dni, telefono, activo }: UsuarioMock): Cliente {
  return { id, nombre, email, dni: dni ?? '', telefono: telefono ?? '', activo };
}

function coincide(cliente: UsuarioMock, texto: string): boolean {
  const campos = [cliente.nombre, cliente.email, cliente.dni ?? ''];
  return !texto || campos.some((campo) => campo.toLowerCase().includes(texto));
}

function buscarCliente(db: MockDb, id: number): UsuarioMock {
  const cliente = db.usuarios.find((u) => u.id === id && u.rol === 'CLIENTE');
  if (!cliente) {
    throw new ErrorMock(404, `No existe un cliente con id ${id}`);
  }
  return cliente;
}

/** Como el backend: puede conservar su propio email y DNI, pero no usar los de otro usuario. */
function validarQueEsteLibre(db: MockDb, datos: EditarClienteRequest, propioId: number | null): void {
  const otros = db.usuarios.filter((u) => u.id !== propioId);
  if (otros.some((u) => u.email === datos.email)) {
    throw new ErrorMock(409, `El email ${datos.email} ya está en uso`);
  }
  if (otros.some((u) => u.dni === datos.dni)) {
    throw new ErrorMock(409, `El DNI ${datos.dni} ya está registrado`);
  }
}
