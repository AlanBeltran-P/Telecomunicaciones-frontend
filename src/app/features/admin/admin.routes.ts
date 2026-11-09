import { Routes } from '@angular/router';
import { MiPerfil } from '../perfil/mi-perfil';
import { Dashboard } from './dashboard/dashboard';
import { PlanesAdmin } from './planes/planes-admin';
import { Usuarios } from './usuarios/usuarios';

export const RUTAS_ADMIN: Routes = [
  { path: '', title: 'Dashboard — Systema Tele', component: Dashboard },
  { path: 'usuarios', title: 'Usuarios — Systema Tele', component: Usuarios },
  { path: 'planes', title: 'Planes — Systema Tele', component: PlanesAdmin },
  { path: 'perfil', title: 'Mi perfil — Systema Tele', component: MiPerfil },
];
