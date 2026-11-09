import { Component, computed, inject, signal } from '@angular/core';
import { AuthService } from '../../core/auth/auth.service';
import { NOMBRE_DEL_ROL } from '../../core/auth/rol';
import { Modal } from '../../shared/modal/modal';
import { iniciales } from '../../shared/utilidades/iniciales';

/** Datos de la cuenta (vienen de GET /api/usuarios/yo, ya cargado al entrar). */
@Component({
  selector: 'app-mi-perfil',
  imports: [Modal],
  templateUrl: './mi-perfil.html',
  styleUrl: './mi-perfil.css',
})
export class MiPerfil {
  private readonly auth = inject(AuthService);

  protected readonly perfil = this.auth.perfil;
  protected readonly iniciales = computed(() => iniciales(this.perfil()?.nombre ?? ''));
  protected readonly nombreDelRol = computed(() => {
    const perfil = this.perfil();
    return perfil ? NOMBRE_DEL_ROL[perfil.rol] : '';
  });
  protected readonly confirmandoSalida = signal(false);

  protected cerrarSesion(): void {
    this.confirmandoSalida.set(false);
    this.auth.cerrarSesion();
  }
}
