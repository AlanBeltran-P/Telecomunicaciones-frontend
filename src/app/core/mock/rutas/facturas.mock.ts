import { DebitoAutomatico, MedioDePago, PagoRequest } from '../../facturacion/factura.model';
import { DebitoMock, FacturaMock } from '../datos/facturas.mock';
import { hoy } from '../fechas';
import { MockDb } from '../mock-db';
import { ErrorMock, respuesta, sinContenido } from '../respuestas';
import { RutaMock } from '../ruta-mock';

/** Igual que PasarelaSimulada del backend: rechaza solo este token. */
const TOKEN_QUE_SE_RECHAZA = 'rechazado';

export const RUTAS_FACTURAS: RutaMock[] = [
  {
    metodo: 'GET',
    patron: /^\/facturas\/mias$/,
    responder: ({ db }) => {
      const cliente = db.usuarioLogueado();
      const suyas = db.facturas.filter((f) => f.clienteId === cliente.id);
      return respuesta(suyas.sort((a, b) => b.fechaEmision.localeCompare(a.fechaEmision)));
    },
  },
  {
    metodo: 'POST',
    patron: /^\/facturas\/(\d+)\/pagos$/,
    responder: ({ req, parametros, db }) => {
      const cliente = db.usuarioLogueado();
      const factura = facturaDelCliente(db, Number(parametros[0]), cliente.id);
      const { medio, tokenDePago } = req.body as PagoRequest;
      if (factura.estado === 'PAGADA') {
        throw new ErrorMock(409, `La factura ${factura.id} ya está pagada`);
      }
      if (tokenDePago === TOKEN_QUE_SE_RECHAZA) {
        throw new ErrorMock(
          402,
          `El pago de la factura ${factura.id} fue rechazado. Probá con otro medio de pago`,
        );
      }
      Object.assign(factura, { estado: 'PAGADA', fechaPago: hoy(), medioDePago: medio });
      return respuesta(factura);
    },
  },
  {
    metodo: 'GET',
    patron: /^\/facturas\/debito-automatico$/,
    responder: ({ db }) => {
      const debito = debitoDe(db, db.usuarioLogueado().id);
      if (!debito) {
        throw new ErrorMock(404, 'No tenés el débito automático activado');
      }
      return respuesta(aDebito(debito));
    },
  },
  {
    metodo: 'PUT',
    patron: /^\/facturas\/debito-automatico$/,
    responder: ({ req, db }) => {
      const clienteId = db.usuarioLogueado().id;
      const { medio } = req.body as PagoRequest;
      const debito = debitoDe(db, clienteId) ?? nuevoDebito(db, clienteId, medio);
      debito.medio = medio;
      return respuesta(aDebito(debito));
    },
  },
  {
    metodo: 'DELETE',
    patron: /^\/facturas\/debito-automatico$/,
    responder: ({ db }) => {
      const clienteId = db.usuarioLogueado().id;
      db.debitos = db.debitos.filter((d) => d.clienteId !== clienteId);
      return sinContenido();
    },
  },
];

function facturaDelCliente(db: MockDb, id: number, clienteId: number): FacturaMock {
  const factura = db.facturas.find((f) => f.id === id && f.clienteId === clienteId);
  if (!factura) {
    throw new ErrorMock(404, `No existe la factura ${id}`);
  }
  return factura;
}

function debitoDe(db: MockDb, clienteId: number): DebitoMock | undefined {
  return db.debitos.find((d) => d.clienteId === clienteId);
}

function nuevoDebito(db: MockDb, clienteId: number, medio: MedioDePago): DebitoMock {
  const debito = { clienteId, medio, fechaAlta: hoy() };
  db.debitos.push(debito);
  return debito;
}

function aDebito({ medio, fechaAlta }: DebitoMock): DebitoAutomatico {
  return { medio, fechaAlta };
}
