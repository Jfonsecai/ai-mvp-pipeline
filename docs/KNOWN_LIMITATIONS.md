# Limitaciones y alcance conocido

## Capacidades MVP incompletas o ausentes

- **Mascotas (PARTIAL):** se crea la mascota inicial durante el registro y se pueden consultar; no hay alta posterior, edición o eliminación (P01-MVP-005).
- **Catálogo (PARTIAL):** se crean/listan ofertas; no hay edición o eliminación (P01-MVP-003).
- **Citas (PARTIAL):** no hay endpoint de cancelación manual ni reprogramación. Si el proveedor cambia horarios, la implementación cancela automáticamente citas afectadas fuera del horario (`src/modules/provider/working-hours.js`, `src/modules/scheduling/hours.js`).
- **Pedidos (NOT_IMPLEMENTED):** tabla `product_order` presente, sin flujo de aplicación (P01-MVP-009).

## Comportamiento no especificado en artefactos de producto

- `/estado-tecnico` es una página diagnóstica en cliente. P06 IMPLEMENTATION_LOG DEV-003 registra que no pertenece a las pantallas de UX especificadas; se conserva aquí como comportamiento técnico no promovido a MVP.
- `/api/health` y `/api/health/db` son interfaces operativas implementadas pero ausentes del contrato API de producto (P06 DEV-001).
- `schema_migration` es una tabla de control creada por el migrador, no listada en el modelo de datos de producto (P06 DEV-002).

Estos puntos se registran en `artifacts/09_documentation/DOCUMENTATION_REPORT.md` como discrepancias/elementos no especificados, sin decidir si deben añadirse a los artefactos de producto.

## Fuera de alcance

Los artefactos P01 excluyen pagos, notificaciones, seguimiento en tiempo real, calificaciones/reseñas, verificación de proveedores, cobertura de otras ciudades, cuentas administrativas y gestión de personal/capacidad de clínicas. No se describen como funciones disponibles.

## Verificación y estado del despliegue

La generación P09 no ejecutó pruebas, build, migraciones ni smoke test hospedado. Los resultados previos citados en [TESTING](TESTING.md) son históricos. El usuario reporta que el despliegue se completó; el P08 validation report disponible aún registra BLOCKED, así que el estado alojado permanece sin verificación independiente en este conjunto.
