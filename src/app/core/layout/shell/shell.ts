import { Component, ElementRef, computed, inject, input, signal, viewChild } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { Icono, NombreIcono } from '../../../shared/icono/icono';
import { Modal } from '../../../shared/modal/modal';
import { iniciales } from '../../../shared/utilidades/iniciales';
import { AuthService } from '../../auth/auth.service';
import { NOMBRE_DEL_ROL } from '../../auth/rol';

export interface ItemDeMenu {
  ruta: string;
  texto: string;
  icono: NombreIcono;
}

/**
 * Estructura de las pantallas con sesión: barra lateral con el menú del rol
 * y menú del avatar (perfil y cerrar sesión).
 * El menú llega por la ruta: { component: Shell, data: { menu: [...] } }.
 */
@Component({
  selector: 'app-shell',
  imports: [RouterLink, RouterLinkActive, RouterOutlet, Icono, Modal],
  templateUrl: './shell.html',
  host: {
    '(document:click)': 'cerrarMenuSiTocoAfuera($event)',
    '(document:keydown.escape)': 'menuPerfilAbierto.set(false)',
  },
})
export class Shell {
  private readonly auth = inject(AuthService);
  private readonly zonaPerfil = viewChild.required<ElementRef<HTMLElement>>('zonaPerfil');

  readonly menu = input<ItemDeMenu[]>([]);

  protected readonly perfil = this.auth.perfil;
  protected readonly iniciales = computed(() => iniciales(this.perfil()?.nombre ?? ''));
  protected readonly nombreDelRol = computed(() => {
    const perfil = this.perfil();
    return perfil ? NOMBRE_DEL_ROL[perfil.rol] : '';
  });
  protected readonly menuPerfilAbierto = signal(false);
  protected readonly confirmandoSalida = signal(false);

  protected alternarMenuPerfil(): void {
    this.menuPerfilAbierto.update((abierto) => !abierto);
  }

  protected pedirConfirmacionDeSalida(): void {
    this.menuPerfilAbierto.set(false);
    this.confirmandoSalida.set(true);
  }

  protected cerrarSesion(): void {
    this.confirmandoSalida.set(false);
    this.auth.cerrarSesion();
  }

  protected cerrarMenuSiTocoAfuera(evento: MouseEvent): void {
    const tocoAdentro = this.zonaPerfil().nativeElement.contains(evento.target as Node);
    if (!tocoAdentro) {
      this.menuPerfilAbierto.set(false);
    }
  }
}
