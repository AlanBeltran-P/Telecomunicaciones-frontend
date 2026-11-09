import { Routes } from '@angular/router';
import { MiPerfil } from '../perfil/mi-perfil';
import { Clientes } from './clientes/clientes';
import { EmpleadoLayout } from './empleado-layout/empleado-layout';
import { FichaCliente } from './ficha-cliente/ficha-cliente';
import { InicioEmpleado } from './inicio/inicio-empleado';
import { Instalaciones } from './instalaciones/instalaciones';
import { Suspendidas } from './suspendidas/suspendidas';

export const RUTAS_EMPLEADO: Routes = [
  {
    path: '',
    component: EmpleadoLayout,
    children: [
      { path: '', title: 'Inicio — Systema Tele', component: InicioEmpleado },
      { path: 'clientes', title: 'Clientes — Systema Tele', component: Clientes },
      { path: 'clientes/:id', title: 'Ficha del cliente — Systema Tele', component: FichaCliente },
      { path: 'instalaciones', title: 'Instalaciones — Systema Tele', component: Instalaciones },
      { path: 'suspendidas', title: 'Suspendidas — Systema Tele', component: Suspendidas },
      { path: 'perfil', title: 'Mi perfil — Systema Tele', component: MiPerfil },
    ],
  },
];
