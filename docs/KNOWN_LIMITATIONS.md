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
- La configuración de despliegue en Vercel (`builds` y `routes` en `vercel.json`, el renombrado de `src/app.js` a `src/application.js` y la importación de `express` en `src/index.js`) difiere de lo que supone ARCHITECTURE_V2 §5.5 y no está registrada en los artefactos de arquitectura (P09-DISC-006; P08 VAL-003).

Estos puntos se registran en `artifacts/09_documentation/DOCUMENTATION_REPORT.md` como discrepancias/elementos no especificados, sin decidir si deben añadirse a los artefactos de producto.

## Fuera de alcance

Los artefactos P01 excluyen pagos, notificaciones, seguimiento en tiempo real, calificaciones/reseñas, verificación de proveedores, cobertura de otras ciudades, cuentas administrativas y gestión de personal/capacidad de clínicas. No se describen como funciones disponibles.

## Verificación y estado del despliegue

La aplicación está desplegada en Vercel y Neon y verificada por P08 (2026-10-14, commit `8c439b7`, estado READY_WITH_ASSUMPTIONS). Las siguientes limitaciones siguen vigentes:

- **La integración continua no bloquea la publicación.** La comprobación `build-and-test` no es obligatoria en `main` y Vercel despliega en paralelo con GitHub Actions. Requiere un ajuste de protección de rama por el administrador del repositorio (P08-RISK-002).
- **Sin reversión probada.** La reversión de Vercel y la restauración de Neon no se ejercitaron; las migraciones no tienen paso atrás (P08 §10).
- **Entornos de vista previa sin verificar.** El smoke test se ejecuta solo contra producción; las URL únicas de despliegue están protegidas por Vercel (P08-LIMIT-002).
- **Sin verificación de interfaz ni de flujos con sesión en producción.** El smoke test es de solo lectura: no inicia sesión con una cuenta real, de modo que el atributo `Secure` de la cookie con HTTPS, `NODE_ENV` en la función, el valor de `FEATURES` y el comportamiento de búsqueda sin acentos en la base de Neon no están comprobados.
- **Versión de Node en Vercel desconocida** (`engines.node` es `>=22`).
- **Cambios previstos en el entorno de CI:** `ubuntu-latest` pasa a Ubuntu 26 desde el 2026-10-19 y las acciones `@v4` usan Node 20 en desuso (P08-RISK-008).

Los resultados de pruebas citados en [TESTING](TESTING.md) provienen de ejecuciones de P08; P09 no ejecutó las pruebas ni el smoke test por sí mismo. Los informes de P06 conservan resultados históricos por historia de usuario.
