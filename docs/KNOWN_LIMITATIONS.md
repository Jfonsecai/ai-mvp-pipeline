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
- La configuración de despliegue en Vercel (`builds` y `routes` en `vercel.json`, el renombrado de `src/app.js` a `src/application.js` y la importación de `express` en `src/index.js`) difiere de lo que supone ARCHITECTURE_V2 §5.5; la corrección quedó registrada en ARCHITECTURE_V3 §1.4 (cambio P05-CHG-001; P09-DISC-006, P08 VAL-003). Se desconoce si el `import express` sin uso sigue siendo necesario con la configuración actual: no se probó sin él.

Estos puntos se registran en `artifacts/09_documentation/DOCUMENTATION_REPORT.md` como discrepancias/elementos no especificados, sin decidir si deben añadirse a los artefactos de producto.

## Fuera de alcance

Los artefactos P01 excluyen pagos, notificaciones, seguimiento en tiempo real, calificaciones/reseñas, verificación de proveedores, cobertura de otras ciudades, cuentas administrativas y gestión de personal/capacidad de clínicas. No se describen como funciones disponibles.

## Verificación y estado del despliegue

La aplicación está desplegada en Vercel y Neon y verificada por P08 (2026-10-14, commit `8c439b7`, estado READY_WITH_ASSUMPTIONS). Las siguientes limitaciones siguen vigentes:

- **La integración continua no bloquea la publicación.** La comprobación `build-and-test` no es obligatoria en `main` y Vercel despliega en paralelo con GitHub Actions. Requiere un ajuste de protección de rama por el administrador del repositorio (P08-RISK-002).
- **Sin reversión probada.** La reversión de Vercel y la restauración de Neon no se ejercitaron; las migraciones no tienen paso atrás (P08 §10).
- **Entornos de vista previa sin verificar.** El smoke test se ejecuta solo contra producción; las URL únicas de despliegue están protegidas por Vercel (P08-LIMIT-002).
- **Interfaz y flujos con sesión: solo atestación humana.** El smoke test es de solo lectura y no inicia sesión. El equipo reporta haber probado a mano los recorridos principales y los puntos que el smoke test no ve (cookie `Secure`, `FEATURES`, versión de Node) el 2026-10-14, y reporta que todas las pruebas pasaron, pero no se registraron los valores observados individuales y la comprobación no se reprodujo (`artifacts/08_deployment/evidence/manual_production_check_2026-10-14.md`). No existen pruebas automatizadas de la interfaz. `NODE_ENV` en la función y el comportamiento de búsqueda sin acentos en la base de Neon no tienen registro.
- **Versión de Node en Vercel:** `engines.node` es `>=22`; el equipo reporta haberla consultado, pero el valor no está registrado.
- **Entorno de CI cambiado, sin ejecutar todavía:** el 2026-10-14 los workflows pasaron a `ubuntu-24.04` y a `actions/checkout@v7` y `actions/setup-node@v7` (antes `ubuntu-latest` y `@v4`, que cambia a Ubuntu 26 el 2026-10-19). Los resultados citados en esta documentación se obtuvieron con las versiones anteriores; falta una ejecución verde en GitHub con las nuevas (P08-RISK-008).

Los resultados de pruebas citados en [TESTING](TESTING.md) provienen de ejecuciones de P08; P09 no ejecutó las pruebas ni el smoke test por sí mismo. Los informes de P06 conservan resultados históricos por historia de usuario.
