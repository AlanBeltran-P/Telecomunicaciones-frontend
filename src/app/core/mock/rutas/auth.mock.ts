import { LoginRequest, LoginResponse, Perfil, RegistroRequest } from '../../auth/auth.model';
import { UsuarioMock } from '../datos/usuarios.mock';
import { hoy } from '../fechas';
import { MockDb } from '../mock-db';
import { ErrorMock, respuesta, sinContenido } from '../respuestas';
import { RutaMock } from '../ruta-mock';

export const RUTAS_AUTH: RutaMock[] = [
  {
    metodo: 'POST',
    patron: /^\/auth\/login$/,
    responder: ({ req, db }) => {
      const { email, contrasena } = req.body as LoginRequest;
      const usuario = db.usuarios.find((u) => u.email === email && u.activo);
      if (!usuario || usuario.contrasena !== contrasena) {
        throw new ErrorMock(401, 'Email o contraseña incorrectos');
      }
      db.iniciarSesion(usuario.id);
      return respuesta(aLoginResponse(usuario));
    },
  },
  {
    metodo: 'POST',
    patron: /^\/auth\/registro$/,
    responder: ({ req, db }) => {
      const datos = req.body as RegistroRequest;
      validarQueNoExista(db, datos);
      const cliente: UsuarioMock = {
        ...datos,
        id: db.nuevoId(),
        rol: 'CLIENTE',
        activo: true,
        fechaAlta: hoy(),
      };
      db.usuarios.push(cliente);
      db.iniciarSesion(cliente.id);
      return respuesta(aLoginResponse(cliente), 201);
    },
  },
  {
    metodo: 'POST',
    patron: /^\/auth\/logout$/,
    responder: ({ db }) => {
      db.cerrarSesion();
      return sinContenido();
    },
  },
  {
    metodo: 'GET',
    patron: /^\/usuarios\/yo$/,
    responder: ({ db }) => respuesta(aPerfil(db.usuarioLogueado())),
  },
];

function validarQueNoExista(db: MockDb, datos: RegistroRequest): void {
  if (db.usuarios.some((u) => u.email === datos.email)) {
    throw new ErrorMock(409, `El email ${datos.email} ya está en uso`);
  }
  if (db.usuarios.some((u) => u.dni === datos.dni)) {
    throw new ErrorMock(409, `El DNI ${datos.dni} ya está registrado`);
  }
}

function aLoginResponse({ id, email, rol }: UsuarioMock): LoginResponse {
  return { id, email, rol };
}

export function aPerfil({ id, nombre, email, rol, dni, telefono }: UsuarioMock): Perfil {
  return { id, nombre, email, rol, dni, telefono };
}
