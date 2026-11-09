# Configuración y ejecución

## Requisitos

- Node.js 22 o posterior (package.json y .nvmrc).
- npm.
- PostgreSQL accesible para operaciones con datos y migraciones.

## Instalación

En la raíz del repositorio:

```sh
npm ci
```

Cree el archivo local `.env` desde `.env.example` (PowerShell: `Copy-Item .env.example .env`) y complete la configuración necesaria. No agregue secretos al repositorio.

## Variables de aplicación

Los nombres siguientes aparecen en `.env.example`, configuración y/o código:

| Variable | Requerida | Uso |
|---|---|---|
| NODE_ENV | No | Modo de ejecución; el ejemplo indica development. |
| APP_ORIGIN | Sí para solicitudes mutantes | Origen del cliente permitido por el control de origen. |
| DATABASE_URL | No para iniciar; sí para acceso a datos | Conexión PostgreSQL de runtime. |
| DATABASE_URL_UNPOOLED | Para migraciones | Conexión directa usada por el migrador. |
| FEATURES | No | Interruptores de funciones; vacío desactiva todos. |
| SESSION_IDLE_MINUTES | No | Límite de inactividad; valor de ejemplo/default 60. |
| SESSION_ABSOLUTE_HOURS | No | Duración absoluta; valor de ejemplo/default 12. |
| PORT | No | Puerto del servidor local; ejemplo 3000. |
| TEST_DATABASE_URL | No | Base desechable para pruebas de base de datos. |

Use valores propios del entorno. Esta guía no publica valores de conexión ni credenciales.

## Ejecución local

Ejecute en terminales separadas:

```sh
npm run dev:api
npm run dev:client
```

El script local de API usa el puerto 3000 y el cliente Vite el 5173; Vite redirige las solicitudes `/api` al servidor local. Abra `http://localhost:5173`. La ruta `/estado-tecnico` es una página diagnóstica interna/técnica; los artefactos la identifican como no especificada en UX (P06 IMPLEMENTATION_LOG, DEV-003), no como parte del flujo de producto.

## Migraciones

```sh
npm run migrate:status
npm run migrate
```

Ambos comandos requieren `DATABASE_URL_UNPOOLED`. El primero informa migraciones aplicadas/pendientes; el segundo aplica migraciones SQL de `migrations/`. No edite migraciones ya aplicadas. El migrador se niega a ejecutarse cuando la variable `VERCEL` está definida (la define la plataforma), de modo que las migraciones nunca corren dentro de un build de Vercel.

## Build

`npm run build` construye el cliente en `public/` (directorio ignorado por git). Se ejecutó con éxito el 2026-10-14 sobre el commit `8c439b7` (`artifacts/08_deployment/evidence/p08_rerun_ci_local.txt`).

## Pruebas

`npm test` ejecuta el runner de Node y carga `.env`. Configure `TEST_DATABASE_URL` solo con una base desechable para incluir las pruebas DB; sin esa variable, las pruebas dependientes de base de datos se omiten. La suite de QA (`node --test "artifacts/07_qa/test_suites/**/*.test.js"`) **no** carga `.env`: exporte `TEST_DATABASE_URL` en el shell antes de ejecutarla. Consulte [TESTING](TESTING.md).

## Despliegue y verificación

El despliegue está hecho y verificado por la etapa P08 (re-ejecución del 2026-10-14; detalle completo, procedimiento y solución de problemas en [DEPLOYMENT](../artifacts/08_deployment/DEPLOYMENT.md)):

- **Dónde:** Vercel (cliente estático y una función para la API Express) y PostgreSQL en Neon. El dominio de producción es https://vetcare-mvp.vercel.app. Las URL únicas de cada despliegue están protegidas por la autenticación de Vercel; el dominio público no.
- **Cómo:** la integración Git de Vercel construye y despliega cada push (producción para `main`, vista previa para las demás ramas) con la configuración de `vercel.json` (`builds` y `routes`). No se usa Docker. GitHub Actions ejecuta la integración continua (`.github/workflows/ci.yml`: instalación, build y pruebas) y, tras cada despliegue de producción exitoso, el smoke test (`.github/workflows/post-deploy-smoke.yml`).
- **Variables de Vercel (por entorno):** `APP_ORIGIN` (obligatoria; debe ser exactamente el origen público), `DATABASE_URL` (la inyecta la integración de Neon), `FEATURES` (vacía en producción) y opcionalmente las dos variables de sesión. `DATABASE_URL_UNPOOLED` solo se usa para migraciones desde una máquina controlada; no la guarde en GitHub ni en el build de Vercel.
- **Migraciones:** no forman parte del despliegue; se aplican a mano, antes de la publicación que las necesite, con `npm run migrate:status` y `npm run migrate`.

Estado verificado (commit `8c439b7`): la integración continua pasó en GitHub Actions, Vercel desplegó producción y el smoke test pasó tanto en el workflow como al ejecutarlo a mano contra el dominio público (9 de 9 comprobaciones). El equipo reporta además una prueba manual en producción el 2026-10-14 (registro, inicio de sesión, búsqueda, reserva, cookie `Secure`, `FEATURES` y versión de Node); el equipo reporta que todas pasaron, sin valores individuales registrados. Aún sin verificar: la reversión de un despliegue y el entorno de vista previa. Los workflows se cambiaron después de esa verificación (`ubuntu-24.04`, acciones `@v7`) y todavía no se han ejecutado en GitHub. La comprobación de CI no es obligatoria para publicar en `main` (ajuste de GitHub pendiente del administrador).

Para ejecutar el smoke test a mano (solo lee; no crea cuentas ni datos):

```sh
BASE_URL=https://vetcare-mvp.vercel.app APP_ORIGIN=https://vetcare-mvp.vercel.app SMOKE_REQUIRE_ALL=1 node scripts/smoke-test.js
```

| Variable | Requerida | Propósito |
|---|---|---|
| BASE_URL | Sí | Origen desplegado que se inspecciona, sin ruta final. |
| APP_ORIGIN | Opcional localmente; requerida para completar SMOKE-06 en CI | Debe coincidir con el origen comprobado; habilita la verificación de inicio de sesión contra DB. |
| SMOKE_CHECKS | No | Selección `api`, `static` o `all` (por defecto `all`). |
| SMOKE_REQUIRE_ALL | No | Con valor `1`, un chequeo omitido falla el proceso. |

El workflow de GitHub lee las variables de repositorio `SMOKE_BASE_URL` (dominio público, obligatoria en la práctica porque la URL única del despliegue está protegida) y `APP_ORIGIN`, y exige que ningún chequeo se omita.
