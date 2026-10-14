# Arquitectura implementada

VetCare es un monolito modular con cliente web React, API Express y persistencia PostgreSQL. El código y configuración determinan esta descripción; el despliegue alojado fue verificado por P08 (véase la sección Despliegue).

## Componentes

- `client/`: aplicación React, rutas, páginas, cliente API y estilos; Vite produce el cliente estático en `public/`.
- `src/index.js`: punto de entrada de la aplicación Express para Vercel (exporta la aplicación; no llama a `listen`). Importa `express` sin usarlo, solo para que Vercel reconozca el archivo; `scripts/dev-server.js` es el punto de entrada local.
- `src/application.js`: composición de middleware y módulos HTTP.
- `src/http/`: controles compartidos de origen, sesión, autorización, errores y endpoints operativos de salud.
- `src/modules/`: módulos de identidad, perfil y horario de proveedores, catálogo, búsqueda y reservas.
- `src/shared/`: configuración, utilidades compartidas, registro, transacciones y funcionalidades.
- `src/db/` y `migrations/`: acceso PostgreSQL, migrador y esquema.
- `scripts/`: servidor de desarrollo, migraciones y smoke test.

El cliente de desarrollo usa Vite para reenviar `/api` al servidor local. En las rutas de módulos, Express aplica middleware compartido y controles de sesión/rol según cada operación. La composición y módulos están registrados en `src/application.js` y `src/modules/index.js`.

## Persistencia

Las migraciones SQL inicializan entidades de cuenta, sesión, mascota, perfil, horario, oferta, cita y pedido. El migrador también crea `schema_migration` para llevar el registro de migraciones; es tabla de infraestructura, no una capacidad de producto. Véase [modelo de datos](DATA_MODEL.md).

## Interfaces

Las rutas de producto y las rutas operativas están listadas por separado en [API](API.md). `/api/health` y `/api/health/db` son chequeos técnicos. La página `/estado-tecnico` también es diagnóstico fuera de la UX de producto especificada (P06 IMPLEMENTATION_LOG DEV-003).

## Despliegue

En producción el cliente estático y la API se sirven desde un mismo origen en Vercel, y la API usa PostgreSQL en Neon. `vercel.json` declara dos compilaciones (`builds`): el cliente (`@vercel/static-build`, que ejecuta `npm run build` y publica `public/`) y la función `src/index.js` (`@vercel/node`); sus rutas (`routes`) envían `/api/*` a la función, sirven los archivos estáticos y devuelven `/index.html` para el resto. Esta configuración difiere de lo que supuso ARCHITECTURE_V2 §5.5 (detección automática del punto de entrada y `rewrites`; supuestos P05-ASM-012 y P05-ASM-019); la corrección está registrada en [ARCHITECTURE_V3](../artifacts/05_architecture/ARCHITECTURE_V3.md) §1.4 (cambio P05-CHG-001) y la discrepancia P09-DISC-006 quedó resuelta. Detalle y evidencia en [DEPLOYMENT](../artifacts/08_deployment/DEPLOYMENT.md).

## Fuentes

`package.json`, `client/package.json`, configuración de Vite, `vercel.json`, `src/index.js`, `src/application.js`, `src/modules/index.js`, `src/db/` y `migrations/`. El estado del despliegue se toma de los artefactos P08 (verificación del 2026-10-14), no de esta lectura del código.
