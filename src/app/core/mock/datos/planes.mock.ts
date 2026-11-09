export interface PlanMock {
  id: number;
  nombre: string;
  descripcion: string | null;
  precio: number;
  activo: boolean;
}

export const PLANES_MOCK: PlanMock[] = [
  { id: 1, nombre: 'Fibra 300', descripcion: 'Internet por fibra óptica de 300 Mb simétricos. Wi-Fi 6 incluido.', precio: 18500, activo: true },
  { id: 2, nombre: 'Fibra 1000', descripcion: '1 Gb simétrico para hogares con mucho streaming y gaming.', precio: 27900, activo: true },
  { id: 3, nombre: 'Fibra + TV', descripcion: 'Fibra de 500 Mb y más de 120 canales HD en todos tus dispositivos.', precio: 34200, activo: true },
  { id: 4, nombre: 'Móvil 20 GB', descripcion: 'Línea con 20 GB de datos, llamadas y mensajes ilimitados.', precio: 9900, activo: true },
  { id: 5, nombre: 'Empresas 500', descripcion: 'Fibra de 500 Mb con IP fija y línea fija para oficinas y pymes.', precio: 52000, activo: true },
  { id: 6, nombre: 'Fibra 100', descripcion: 'Plan anterior, ya no se ofrece.', precio: 12000, activo: false },
];
