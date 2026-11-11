import { ViewportScroller } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { environment } from '../../../environments/environment';
import { AuthService } from '../../core/auth/auth.service';
import { Contar } from '../../shared/animaciones/contar';
import { Revelar } from '../../shared/animaciones/revelar';
import { IlustracionEmpresa } from './ilustraciones/ilustracion-empresa';
import { IlustracionInternet } from './ilustraciones/ilustracion-internet';
import { IlustracionMovil } from './ilustraciones/ilustracion-movil';
import { IlustracionTv } from './ilustraciones/ilustracion-tv';
import { MapaRed } from './ilustraciones/mapa-red';
import { RedFibra } from './ilustraciones/red-fibra';
import { PlanesHome } from './planes-home/planes-home';

/** Página pública: qué ofrece la empresa, planes y preguntas frecuentes. */
@Component({
  selector: 'app-home',
  imports: [
    RouterLink,
    Revelar,
    Contar,
    RedFibra,
    IlustracionInternet,
    IlustracionTv,
    IlustracionMovil,
    IlustracionEmpresa,
    MapaRed,
    PlanesHome,
  ],
  templateUrl: './home.html',
})
export class Home {
  private readonly auth = inject(AuthService);

  protected readonly autenticado = this.auth.autenticado;
  protected readonly miCuenta = computed(() => this.auth.rutaDeInicio());
  protected readonly modoDemo = environment.usarMock;
  protected readonly ciudades = [
    'CABA',
    'Rosario',
    'Córdoba',
    'Mendoza',
    'Mar del Plata',
    'Tucumán',
    'Salta',
    'Neuquén',
  ];

  constructor() {
    // Al saltar a una sección, el header fijo no tiene que taparla
    inject(ViewportScroller).setOffset(() => [0, this.alturaDelHeader()]);
  }

  private alturaDelHeader(): number {
    return document.querySelector('.navegacion')?.getBoundingClientRect().height ?? 0;
  }
}
