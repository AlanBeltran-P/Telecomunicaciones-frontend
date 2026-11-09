/** GET /api/planes */
export interface Plan {
  id: number;
  nombre: string;
  descripcion: string | null;
  precio: number;
}

/** Alta o edición de un plan (PlanRequest): el precio tiene que ser positivo. */
export type PlanRequest = Omit<Plan, 'id'>;
