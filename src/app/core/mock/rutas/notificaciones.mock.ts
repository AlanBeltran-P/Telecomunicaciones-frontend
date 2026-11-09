import { NotificacionMock } from '../datos/notificaciones.mock';
import { MockDb } from '../mock-db';
import { ErrorMock, respuesta } from '../respuestas';
import { RutaMock } from '../ruta-mock';

export const RUTAS_NOTIFICACIONES: RutaMock[] = [
  {
    metodo: 'GET',
    patron: /^\/notificaciones\/mias$/,
    responder: ({ db }) => {
      const cliente = db.usuarioLogueado();
      const suyas = db.notificaciones.filter((n) => n.clienteId === cliente.id);
      return respuesta(suyas.sort((a, b) => b.fecha.localeCompare(a.fecha)));
    },
  },
  {
    metodo: 'PUT',
    patron: /^\/notificaciones\/(\d+)\/leida$/,
    responder: ({ parametros, db }) => {
      const aviso = avisoDelCliente(db, Number(parametros[0]), db.usuarioLogueado().id);
      aviso.leida = true;
      return respuesta(aviso);
    },
  },
];

function avisoDelCliente(db: MockDb, id: number, clienteId: number): NotificacionMock {
  const aviso = db.notificaciones.find((n) => n.id === id && n.clienteId === clienteId);
  if (!aviso) {
    throw new ErrorMock(404, `No existe la notificación ${id}`);
  }
  return aviso;
}
