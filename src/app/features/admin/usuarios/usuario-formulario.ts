import { Component, inject, input, output, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NOMBRE_DEL_ROL, Rol } from '../../../core/auth/rol';
import { mensajeDeError } from '../../../core/http/mensaje-error';
import { Usuario } from '../../../core/usuarios/usuario.model';
import { UsuarioService } from '../../../core/usuarios/usuario.service';
import { Modal } from '../../../shared/modal/modal';
import { ToastService } from '../../../shared/toast/toast.service';

/** Los clientes se registran solos: desde acá solo se da de alta personal. */
export const ROLES_DEL_PERSONAL: Rol[] = ['ADMINISTRADOR', 'EMPLEADO', 'TECNICO'];

type Campo = 'nombre' | 'email' | 'contrasena';

/** Alta de un usuario del personal (POST /api/usuarios). */
@Component({
  selector: 'app-usuario-formulario',
  imports: [ReactiveFormsModule, Modal],
  templateUrl: './usuario-formulario.html',
})
export class UsuarioFormulario {
  private readonly usuarios = inject(UsuarioService);
  private readonly toasts = inject(ToastService);

  readonly abierto = input(false);
  readonly creado = output<Usuario>();
  readonly cerrar = output<void>();

  protected readonly roles = ROLES_DEL_PERSONAL;
  protected readonly nombreDelRol = NOMBRE_DEL_ROL;
  protected readonly enviando = signal(false);
  protected readonly error = signal<string | null>(null);

  // Mismas reglas que CrearUsuarioRequest en el backend
  protected readonly formulario = new FormGroup({
    nombre: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    email: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.email],
    }),
    contrasena: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(8)],
    }),
    rol: new FormControl<Rol>('EMPLEADO', { nonNullable: true }),
  });

  protected campoInvalido(campo: Campo): boolean {
    const control = this.formulario.controls[campo];
    return control.invalid && control.touched;
  }

  protected crear(): void {
    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      return;
    }
    this.enviando.set(true);
    this.error.set(null);
    this.usuarios.crear(this.formulario.getRawValue()).subscribe({
      next: (usuario) => {
        this.toasts.mostrar('Usuario creado');
        this.reiniciar();
        this.creado.emit(usuario);
      },
      error: (error: unknown) => {
        this.error.set(mensajeDeError(error));
        this.enviando.set(false);
      },
    });
  }

  protected cancelar(): void {
    this.reiniciar();
    this.cerrar.emit();
  }

  private reiniciar(): void {
    this.formulario.reset();
    this.error.set(null);
    this.enviando.set(false);
  }
}
