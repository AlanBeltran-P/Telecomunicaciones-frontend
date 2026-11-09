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
