import { Routes } from '@angular/router';
import { authGuard, invitadoGuard, rolGuard } from './core/guards/auth.guard';
import { Shell } from './core/layout/shell/shell';
import { MENU_ADMIN } from './features/admin/menu-admin';
import { MENU_CLIENTE } from './features/cliente/menu-cliente';
import { MENU_EMPLEADO } from './features/empleado/menu-empleado';
import { MENU_TECNICO } from './features/tecnico/menu-tecnico';

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
  {
    path: 'empleado',
    component: Shell,
    canActivate: [authGuard, rolGuard('EMPLEADO')],
    data: { menu: MENU_EMPLEADO },
    loadChildren: () => import('./features/empleado/empleado.routes').then((m) => m.RUTAS_EMPLEADO),
  },
  {
    path: 'tecnico',
    component: Shell,
    canActivate: [authGuard, rolGuard('TECNICO')],
    data: { menu: MENU_TECNICO },
    loadChildren: () => import('./features/tecnico/tecnico.routes').then((m) => m.RUTAS_TECNICO),
  },
  {
    path: 'admin',
    component: Shell,
    canActivate: [authGuard, rolGuard('ADMINISTRADOR')],
    data: { menu: MENU_ADMIN },
    loadChildren: () => import('./features/admin/admin.routes').then((m) => m.RUTAS_ADMIN),
  },
  { path: '**', redirectTo: '' },
];
