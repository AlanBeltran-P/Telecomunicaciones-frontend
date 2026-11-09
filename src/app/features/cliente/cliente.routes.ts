import { Routes } from '@angular/router';
import { MiPerfil } from '../perfil/mi-perfil';
import { ClienteLayout } from './cliente-layout/cliente-layout';
import { Debito } from './debito/debito';
import { Facturas } from './facturas/facturas';
import { Inicio } from './inicio/inicio';
import { MisPlanes } from './mis-planes/mis-planes';
import { Notificaciones } from './notificaciones/notificaciones';

export const RUTAS_CLIENTE: Routes = [
  {
    path: '',
    component: ClienteLayout,
    children: [
      { path: '', title: 'Inicio — Systema Tele', component: Inicio },
      { path: 'planes', title: 'Mis planes — Systema Tele', component: MisPlanes },
      { path: 'facturas', title: 'Facturas — Systema Tele', component: Facturas },
      { path: 'debito', title: 'Débito automático — Systema Tele', component: Debito },
      { path: 'notificaciones', title: 'Notificaciones — Systema Tele', component: Notificaciones },
      { path: 'perfil', title: 'Mi perfil — Systema Tele', component: MiPerfil },
    ],
  },
];
