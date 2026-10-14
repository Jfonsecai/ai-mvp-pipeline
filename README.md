# VetCare

Marketplace web para descubrir servicios veterinarios y reservar atención presencial o a domicilio.

## Propósito y problema

VetCare busca ayudar a dueños de mascotas a encontrar atención veterinaria y a proveedores a publicar servicios. La visión del producto y el alcance MVP están en P00 y P01; la disponibilidad que se describe aquí refleja el código actual.

## Funcionalidades implementadas

- **Búsqueda y filtro por especie — IMPLEMENTED.** Consultar servicios y proveedores disponibles.
- **Reserva de citas — IMPLEMENTED.** Reservar servicios en clínica o a domicilio.
- **Catálogo del proveedor — PARTIAL.** Publicar y consultar ofertas; no se implementa edición o eliminación.
- **Gestión de mascotas — PARTIAL.** Crear la mascota inicial al registrarse y consultar mascotas; no agregar, editar ni eliminar después.
- **Cuentas y autenticación — IMPLEMENTED.** Registro de dueños y proveedores, inicio y cierre de sesión.
- **Gestión de citas — PARTIAL.** Reservar y consultar citas. El cambio de horario del proveedor puede cancelar automáticamente citas que quedan fuera del horario; no hay rutas para cancelación o reprogramación manual.
- **Perfil del proveedor — IMPLEMENTED.**
- **Horario del proveedor — IMPLEMENTED.**
- **Pedidos de productos — NOT_IMPLEMENTED.** La tabla existe, pero no hay flujo de aplicación.

## Tecnología

Node.js (>=22), Express, PostgreSQL, React, React Router y Vite, según los manifiestos del proyecto. La estructura de módulos es un monolito modular. Consulte [Arquitectura](docs/ARCHITECTURE.md).

## Requisitos previos

Node.js 22 o posterior, npm y PostgreSQL para las funciones que leen o escriben datos. Consulte [Configuración](docs/SETUP.md).

## Inicio rápido

Instale dependencias con `npm ci`, cree `.env` a partir de `.env.example` y configure `APP_ORIGIN`. En terminales separadas ejecute `npm run dev:api` y `npm run dev:client`; luego abra `http://localhost:5173`. Se ejecutaron `npm ci`, `npm run build`, `npm run dev:api` y `npm run dev:client` el 2026-10-14 (evidencia en `artifacts/08_deployment/evidence/p08_rerun_ci_local.txt`): la API responde `/api/health` y Vite sirve el cliente y reenvía `/api`. Las rutas que usan datos requieren una base PostgreSQL propia.

## Configuración

La configuración detallada y variables de aplicación, base de datos y verificación de despliegue están en [SETUP](docs/SETUP.md). No copie valores reales o credenciales a la documentación.

## Uso

Un dueño se registra con su mascota inicial, busca proveedores, reserva una cita y consulta sus citas. Un proveedor registra su cuenta, configura perfil y horarios, publica ofertas y consulta citas. Pasos detallados: [Guía de usuario](docs/USER_GUIDE.md).

## Estructura del proyecto

Directorios de primer nivel relevantes: `.github/`, `artifacts/`, `client/`, `migrations/`, `prompts/`, `public/`, `scripts/`, `src/` y `tests/`.

## Pruebas

Ejecute `npm test`. Las pruebas de base de datos se omiten si no se configura `TEST_DATABASE_URL`, y una ejecución con omisiones no es una ejecución completa. Hay además una suite de QA (`artifacts/07_qa/test_suites/`). Con una base desechable configurada, el 2026-10-14 pasaron 175 de 175 pruebas del proyecto y 143 de 143 de la suite de QA; la integración continua de GitHub Actions ejecuta ambas en cada cambio (evidencia en `artifacts/08_deployment/`). Consulte [Testing](docs/TESTING.md).

## Índice de documentación

- [Configuración](docs/SETUP.md)
- [Arquitectura](docs/ARCHITECTURE.md)
- [API](docs/API.md)
- [Modelo de datos](docs/DATA_MODEL.md)
- [Guía de usuario](docs/USER_GUIDE.md)
- [Pruebas](docs/TESTING.md)
- [Guía de despliegue (P08)](artifacts/08_deployment/DEPLOYMENT.md) y su [validación](artifacts/08_deployment/DEPLOYMENT_VALIDATION_V2.md)
- [Cobertura de requisitos](docs/REQUIREMENTS_COVERAGE.md)
- [Limitaciones conocidas](docs/KNOWN_LIMITATIONS.md)
- [Reporte P09](artifacts/09_documentation/DOCUMENTATION_REPORT.md)

## Limitaciones y alcance

Pedidos, cambios manuales de citas, edición/eliminación de mascotas y ofertas no están implementados. Pagos, notificaciones, seguimiento en tiempo real, calificaciones, verificación de proveedores, administración y expansión geográfica están fuera del alcance según P01. La pantalla `/estado-tecnico` es un diagnóstico técnico, no una funcionalidad de producto especificada. Detalles y discrepancias: [limitaciones](docs/KNOWN_LIMITATIONS.md).

## Estado del proyecto

La aplicación contiene flujos integrados de registro, búsqueda, reserva y gestión de proveedor. Está desplegada en Vercel (cliente y API) con PostgreSQL en Neon; el dominio de producción es https://vetcare-mvp.vercel.app. La etapa P08 (re-ejecutada el 2026-10-14, estado READY_WITH_ASSUMPTIONS, validación PASS_WITH_WARNINGS) verificó el commit `8c439b7`: build y pruebas en GitHub Actions, despliegue de producción y 9 de 9 comprobaciones de humo contra el dominio público. Esto verifica que la aplicación está disponible y que sus rutas, base de datos y control de origen responden. Además, el equipo reporta haber probado a mano los recorridos principales en producción el 2026-10-14 (registro, inicio de sesión, búsqueda y reserva); todas las pruebas pasaron según el reporte del equipo (atestación humana, sin valores individuales registrados), y no hay pruebas automatizadas de la interfaz ni uso con datos reales. Advertencias vigentes: la comprobación de CI no es obligatoria para publicar en `main`, no se ha probado una reversión y los entornos de vista previa no se verifican (ver [limitaciones](docs/KNOWN_LIMITATIONS.md)). Los informes de P06 conservan resultados históricos.

## Trazabilidad del pipeline

Contexto y alcance: `artifacts/00_context/`, `artifacts/01_discovery/`, `artifacts/02_requirements/`; diseño: `artifacts/05_architecture/`; implementación, QA, despliegue y documentación: `artifacts/06_implementation/`, `artifacts/07_qa/`, `artifacts/08_deployment/`, `artifacts/09_documentation/`. La cobertura enlaza capacidades MVP con sus fuentes y evidencia de código.
