/** GET /api/planes */
export interface Plan {
  id: number;
  nombre: string;
  descripcion: string | null;
  precio: number;
}
