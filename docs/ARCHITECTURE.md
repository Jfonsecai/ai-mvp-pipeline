# Arquitectura implementada

VetCare es un monolito modular con cliente web React, API Express y persistencia PostgreSQL. El código y configuración determinan esta descripción; el despliegue alojado no se verificó en P09.

## Componentes

- `client/`: aplicación React, rutas, páginas, cliente API y estilos; Vite produce el cliente estático en `public/`.
- `src/index.js`: punto de entrada de la aplicación Express.
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

## Fuentes

`package.json`, `client/package.json`, configuración de Vite, `src/application.js`, `src/modules/index.js`, `src/db/` y `migrations/`. La descripción de despliegue en los artefactos P08 es intención/configuración y no prueba del runtime alojado actual.
