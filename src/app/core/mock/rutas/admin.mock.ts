import { HttpRequest } from '@angular/common/http';
import { Rol } from '../../auth/rol';
import { Agrupacion } from '../../reportes/reporte.model';
import { CrearUsuarioRequest } from '../../usuarios/usuario.model';
import { reporteDeContrataciones, reporteDeFacturacion, reporteDeUsuarios } from '../datos/reportes.mock';
import { UsuarioMock } from '../datos/usuarios.mock';
import { hoy } from '../fechas';
import { MockDb } from '../mock-db';
import { ErrorMock, respuesta, sinContenido } from '../respuestas';
import { RutaMock } from '../ruta-mock';
import { aUsuario } from './clientes.mock';

const ROLES_DEL_PERSONAL: Rol[] = ['ADMINISTRADOR', 'EMPLEADO', 'TECNICO'];

/** Rutas del administrador: personal y reportes (los planes están en planes.mock.ts). */
export const RUTAS_ADMIN: RutaMock[] = [
  {
    metodo: 'GET',
    patron: /^\/usuarios$/,
    responder: ({ db }) => respuesta(db.usuarios.filter((u) => u.rol !== 'CLIENTE').map(aUsuario)),
  },
  {
    metodo: 'POST',
    patron: /^\/usuarios$/,
    responder: ({ req, db }) => {
      const datos = req.body as CrearUsuarioRequest;
      validarRol(datos.rol);
      if (db.usuarios.some((u) => u.email === datos.email)) {
        throw new ErrorMock(409, `El email ${datos.email} ya está en uso`);
      }
      const usuario: UsuarioMock = { ...datos, id: db.nuevoId(), dni: null, telefono: null, activo: true, fechaAlta: hoy() };
      db.usuarios.push(usuario);
      return respuesta(aUsuario(usuario), 201);
    },
  },
  {
    metodo: 'PUT',
    patron: /^\/usuarios\/(\d+)\/rol$/,
    responder: ({ req, parametros, db }) => {
      const { rol } = req.body as { rol: Rol };
      validarRol(rol);
      const usuario = buscarPersonal(db, Number(parametros[0]));
      validarQueNoEsElMismo(db, usuario);
      usuario.rol = rol;
      return respuesta(aUsuario(usuario));
    },
  },
  {
    metodo: 'PUT',
    patron: /^\/usuarios\/(\d+)\/desactivar$/,
    responder: ({ parametros, db }) => {
      const usuario = buscarPersonal(db, Number(parametros[0]));
      validarQueNoEsElMismo(db, usuario);
      usuario.activo = false;
      return sinContenido();
    },
  },
  {
    metodo: 'GET',
    patron: /^\/usuarios\/reporte$/,
    responder: ({ req }) => {
      const { desde, hasta, agrupacion } = leerRango(req);
      return respuesta(reporteDeUsuarios(desde, hasta, agrupacion));
    },
  },
  {
    metodo: 'GET',
    patron: /^\/contrataciones\/reporte$/,
    responder: ({ req }) => {
      const { desde, hasta, agrupacion } = leerRango(req);
      return respuesta(reporteDeContrataciones(desde, hasta, agrupacion));
    },
  },
  {
    metodo: 'GET',
    patron: /^\/facturas\/reporte$/,
    responder: ({ req }) => {
      const { desde, hasta, agrupacion } = leerRango(req);
      return respuesta(reporteDeFacturacion(desde, hasta, agrupacion));
    },
  },
];

function validarRol(rol: Rol): void {
  if (!ROLES_DEL_PERSONAL.includes(rol)) {
    throw new ErrorMock(400, `El rol ${rol} no se asigna desde la gestión de usuarios`);
  }
}

function buscarPersonal(db: MockDb, id: number): UsuarioMock {
  const usuario = db.usuarios.find((u) => u.id === id && u.rol !== 'CLIENTE');
  if (!usuario) {
    throw new ErrorMock(404, `No existe un usuario con id ${id}`);
  }
  return usuario;
}

/** Como el backend: evita que el sistema se quede sin administrador por un error. */
function validarQueNoEsElMismo(db: MockDb, usuario: UsuarioMock): void {
  if (usuario.id === db.usuarioLogueado().id) {
    throw new ErrorMock(400, 'Un administrador no puede cambiar su propio rol ni desactivarse');
  }
}

/** ?desde=2026-11-01&hasta=2026-11-30&agrupacion=DIA */
function leerRango(req: HttpRequest<unknown>): { desde: Date; hasta: Date; agrupacion: Agrupacion } {
  const desdeTexto = req.params.get('desde') ?? '';
  const hastaTexto = req.params.get('hasta') ?? '';
  const desde = aFecha(desdeTexto);
  const hasta = aFecha(hastaTexto);
  if (desde > hasta) {
    throw new ErrorMock(400, `La fecha desde (${desdeTexto}) no puede ser posterior a la fecha hasta (${hastaTexto})`);
  }
  const agrupacion = req.params.get('agrupacion') === 'MES' ? 'MES' : 'DIA';
  return { desde, hasta, agrupacion };
}

function aFecha(texto: string): Date {
  const [anio, mes, dia] = texto.split('-').map(Number);
  return new Date(anio, mes - 1, dia);
}
