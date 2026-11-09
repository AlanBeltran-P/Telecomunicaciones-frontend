import { Routes } from '@angular/router';
import { authGuard, invitadoGuard, rolGuard } from './core/guards/auth.guard';
import { Shell } from './core/layout/shell/shell';
import { MENU_CLIENTE } from './features/cliente/menu-cliente';

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
  {
    path: 'cliente',
    component: Shell,
    canActivate: [authGuard, rolGuard('CLIENTE')],
    data: { menu: MENU_CLIENTE },
    loadChildren: () => import('./features/cliente/cliente.routes').then((m) => m.RUTAS_CLIENTE),
  },
  { path: '**', redirectTo: '' },
];
