# Telecomunicaciones-frontend

Frontend en Angular de Systema Tele. Consume el
[backend](https://github.com/AlanBeltran-P/Telecomunicaciones-Backend) a través del API Gateway.

## Cómo levantarlo
```bash
npm install
npm start           # backend real: el proxy manda /api a http://localhost:8080
npm run start:mock  # sin backend: datos de ejemplo en memoria
```
Abrir http://localhost:4200

## Qué hay en cada área
| Ruta | Rol | Pantallas |
|---|---|---|
| `/` | Todos | Home pública con el catálogo de planes |
| `/login`, `/registro` | Invitado | Ingresar y crear cuenta |
| `/cliente` | Cliente | Inicio, mis planes, contratar, facturas y pago, débito automático, notificaciones |
| `/empleado` | Empleado | Inicio, clientes (alta, ficha y edición), contratar por un cliente, bajas, instalaciones (asignar técnico), suspendidas (reactivar) |
| `/tecnico` | Técnico | Instalaciones pendientes e historial |
| `/admin` | Administrador | Dashboard con los tres reportes, usuarios del personal, catálogo de planes |

Todas las áreas tienen "Mi perfil" en el menú del avatar.

Los pagos y el débito automático mandan un token simulado: falta integrar los SDK de
Mercado Pago, PayPal y del procesador de tarjetas (el backend también usa una pasarela simulada).

## Modo mock
Un interceptor (`src/app/core/mock`) responde los pedidos a `/api` con los mismos DTOs que el
backend. Los cambios (pagos, altas, etc.) duran hasta recargar la página.

| Rol | Email | Contraseña |
|---|---|---|
| Administrador | admin@systematele.com | demo1234 |
| Empleado | empleado@systematele.com | demo1234 |
| Técnico | tecnico@systematele.com | demo1234 |
| Cliente | cliente@systematele.com | demo1234 |

## Tests
```bash
npm test
```
