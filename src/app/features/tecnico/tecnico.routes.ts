import { Routes } from '@angular/router';
import { MiPerfil } from '../perfil/mi-perfil';
import { Historial } from './historial/historial';
import { Pendientes } from './pendientes/pendientes';

export const RUTAS_TECNICO: Routes = [
  { path: '', title: 'Instalaciones pendientes — Systema Tele', component: Pendientes },
  { path: 'historial', title: 'Historial — Systema Tele', component: Historial },
  { path: 'perfil', title: 'Mi perfil — Systema Tele', component: MiPerfil },
];
