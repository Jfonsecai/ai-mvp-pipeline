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

Ambos comandos requieren `DATABASE_URL_UNPOOLED`. El primero informa migraciones aplicadas/pendientes; el segundo aplica migraciones SQL de `migrations/`. No edite migraciones ya aplicadas. La configuración del proyecto indica que se ejecutan fuera del build de Vercel.

## Build

`npm run build` construye el cliente en `public/`. El comando existe, pero no se ejecutó durante P09 porque escribe artefactos de build.

## Pruebas

`npm test` ejecuta el runner de Node. Configure `TEST_DATABASE_URL` solo con una base desechable para incluir las pruebas DB; sin esa variable, las pruebas dependientes de base de datos se omiten. Consulte [TESTING](TESTING.md). P09 no ejecutó este comando.

## Despliegue y verificación

El repositorio contiene configuración y documentación para Vercel/Neon. El usuario informa que el despliegue ya se realizó. Sin embargo, el último `artifacts/08_deployment/DEPLOYMENT_VALIDATION.md` inspeccionado sigue registrando BLOCKED y no hay evidencia hospedada actualizada en esta generación. Por tanto, despliegue y disponibilidad actuales están **UNVERIFIED**.

Para el smoke test `node scripts/smoke-test.js`:

| Variable | Requerida | Propósito |
|---|---|---|
| BASE_URL | Sí | Origen desplegado que se inspecciona. |
| APP_ORIGIN | Opcional localmente; requerido para completar SMOKE-06 en CI | Debe coincidir con el origen comprobado; habilita la verificación de inicio de sesión contra DB. |
| SMOKE_CHECKS | No | Selección `api`, `static` o `all` (por defecto `all`). |
| SMOKE_REQUIRE_ALL | No | Con valor `1`, un chequeo omitido falla el proceso. |

El workflow de GitHub también lee la variable de repositorio `SMOKE_BASE_URL` como URL pública recomendada y `APP_ORIGIN`; el workflow exige que el chequeo requerido se ejecute. No se ejecutó contra un destino hospedado durante P09. Los nombres y el comportamiento se verificaron por inspección de `scripts/smoke-test.js` y `.github/workflows/post-deploy-smoke.yml`.
