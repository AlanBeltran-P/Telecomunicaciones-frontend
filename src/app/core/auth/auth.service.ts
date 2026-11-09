import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, catchError, firstValueFrom, of, switchMap, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { LoginRequest, Perfil, RegistroRequest } from './auth.model';
import { INICIO_DEL_ROL, Rol } from './rol';

/**
 * Sesión del usuario. El backend guarda el token en una cookie httpOnly,
 * así que el front no lo ve: sabe quién está logueado preguntando GET /usuarios/yo.
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly api = environment.apiUrl;

  readonly perfil = signal<Perfil | null>(null);
  readonly autenticado = computed(() => this.perfil() !== null);

  /** Al abrir la app: si la cookie sigue vigente, recupera la sesión. */
  cargarSesion(): Promise<void> {
    const pedido = this.pedirPerfil().pipe(catchError(() => of(null)));
    return firstValueFrom(pedido).then((perfil) => this.perfil.set(perfil));
  }

  login(datos: LoginRequest): Observable<Perfil> {
    return this.http
      .post(`${this.api}/auth/login`, datos)
      .pipe(switchMap(() => this.guardarPerfil()));
  }

  registrar(datos: RegistroRequest): Observable<Perfil> {
    return this.http
      .post(`${this.api}/auth/registro`, datos)
      .pipe(switchMap(() => this.guardarPerfil()));
  }

  /** Borra la cookie en el backend. Aunque falle, la sesión local se cierra igual. */
  cerrarSesion(): void {
    this.http.post(`${this.api}/auth/logout`, null).subscribe({
      complete: () => this.cerrarSesionLocal(),
      error: () => this.cerrarSesionLocal(),
    });
  }

  cerrarSesionLocal(): void {
    this.perfil.set(null);
    void this.router.navigate(['/login']);
  }

  tieneRol(...roles: Rol[]): boolean {
    const rol = this.perfil()?.rol;
    return rol !== undefined && roles.includes(rol);
  }

  /** Pantalla principal del usuario logueado (o el home si no hay sesión). */
  rutaDeInicio(): string {
    const rol = this.perfil()?.rol;
    return rol ? INICIO_DEL_ROL[rol] : '/';
  }

  private pedirPerfil(): Observable<Perfil> {
    return this.http.get<Perfil>(`${this.api}/usuarios/yo`);
  }

  private guardarPerfil(): Observable<Perfil> {
    return this.pedirPerfil().pipe(tap((perfil) => this.perfil.set(perfil)));
  }
}
