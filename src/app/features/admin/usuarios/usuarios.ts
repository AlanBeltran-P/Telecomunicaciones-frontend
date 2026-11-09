import { Component, computed, inject, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { AuthService } from '../../../core/auth/auth.service';
import { NOMBRE_DEL_ROL, Rol } from '../../../core/auth/rol';
import { mensajeDeError } from '../../../core/http/mensaje-error';
import { Usuario } from '../../../core/usuarios/usuario.model';
import { UsuarioService } from '../../../core/usuarios/usuario.service';
import { Modal } from '../../../shared/modal/modal';
import { ToastService } from '../../../shared/toast/toast.service';
import { iniciales } from '../../../shared/utilidades/iniciales';
import { ROLES_DEL_PERSONAL, UsuarioFormulario } from './usuario-formulario';

/**
 * Personal con acceso al sistema (GET /api/usuarios): alta, cambio de rol y desactivación.
 * Un administrador no puede cambiar su propio rol ni desactivarse (lo controla el backend).
 */
@Component({
  selector: 'app-usuarios',
  imports: [Modal, UsuarioFormulario],
  templateUrl: './usuarios.html',
  styleUrl: './usuarios.css',
})
export class Usuarios {
  private readonly usuarios = inject(UsuarioService);
  private readonly toasts = inject(ToastService);
  private readonly auth = inject(AuthService);

  protected readonly lista = rxResource({ stream: () => this.usuarios.listar(), defaultValue: [] });
  protected readonly miId = computed(() => this.auth.perfil()?.id);
  protected readonly roles = ROLES_DEL_PERSONAL;
  protected readonly nombreDelRol = NOMBRE_DEL_ROL;
  protected readonly iniciales = iniciales;
  protected readonly creando = signal(false);
  /** El que se está por desactivar (espera confirmación). */
  protected readonly aDesactivar = signal<Usuario | null>(null);

  protected agregado(usuario: Usuario): void {
    this.lista.update((lista) => [...lista, usuario]);
    this.creando.set(false);
  }

  protected cambiarRol(usuario: Usuario, evento: Event): void {
    const selector = evento.target as HTMLSelectElement;
    this.usuarios.cambiarRol(usuario.id, selector.value as Rol).subscribe({
      next: (actualizado) => {
        this.reemplazar(actualizado);
        this.toasts.mostrar(`${actualizado.nombre} ahora es ${NOMBRE_DEL_ROL[actualizado.rol]}`);
      },
      error: (error: unknown) => {
        // Vuelve a mostrar el rol que tenía
        selector.value = usuario.rol;
        this.toasts.mostrar(mensajeDeError(error));
      },
    });
  }

  protected confirmarDesactivacion(usuario: Usuario): void {
    this.aDesactivar.set(null);
    this.usuarios.desactivar(usuario.id).subscribe({
      next: () => {
        this.reemplazar({ ...usuario, activo: false });
        this.toasts.mostrar('Usuario desactivado');
      },
      error: (error: unknown) => this.toasts.mostrar(mensajeDeError(error)),
    });
  }

  private reemplazar(actualizado: Usuario): void {
    this.lista.update((lista) => lista.map((u) => (u.id === actualizado.id ? actualizado : u)));
  }
}
