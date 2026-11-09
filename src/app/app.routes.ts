import { Routes } from '@angular/router';
import { invitadoGuard } from './core/guards/auth.guard';

const acceso = () => import('./features/auth/acceso/acceso').then((m) => m.Acceso);

export const routes: Routes = [
  {
    path: '',
    title: 'Systema Tele — Internet, TV y telefonía',
    loadComponent: () => import('./features/home/home').then((m) => m.Home),
  },
  {
    path: 'login',
    title: 'Ingresar — Systema Tele',
    canActivate: [invitadoGuard],
    loadComponent: acceso,
    data: { pestana: 'ingresar' },
  },
  {
    path: 'registro',
    title: 'Crear cuenta — Systema Tele',
    canActivate: [invitadoGuard],
    loadComponent: acceso,
    data: { pestana: 'registro' },
  },
  { path: '**', redirectTo: '' },
];
