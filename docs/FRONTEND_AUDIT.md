# Auditoría del frontend de VetCare

## Resultado

**PASS_WITH_WARNINGS — las tres advertencias señaladas están corregidas.** La especificación ahora describe la identidad VetCare vigente, el texto UI de identidad está en al menos 14 px y Playwright recorre las vistas públicas y privadas de ambos roles en escritorio y móvil. Se conserva una limitación de alcance: las pruebas de rutas no reemplazan una auditoría manual de accesibilidad ni prueban cada mutación visual.

La revisión contrastó el frontend actual con `UX_SPEC_V4.md`, las especificaciones históricas V2/V3, el alcance P03 v3.1, las rutas registradas del backend y el cliente React. Las pantallas de ambos roles están presentes y las operaciones HTTP registradas para producto tienen un uso en frontend. No se encontró una función implementada del backend que haya quedado huérfana por el rediseño.

La excepción funcional visible es la compra de productos: no hay rutas de pedido ni flujo en el frontend; US-027 a US-033 están diferidas en P03, por lo que no es una omisión del cambio visual. Se identificaron diferencias entre la especificación visual V2 y la identidad visual solicitada después, tamaños de texto menores al mínimo UX y cobertura incompleta de navegador. Estos puntos se detallan abajo.

## Fuentes revisadas

- `prompts/04_ux/P04_validation.md` (prompt de validación P04; evalúa la especificación UX, no el frontend ejecutable).
- `artifacts/04_ux/UX_SPEC_V2.md`, `UX_SPEC_V3.md` y `UX_SPEC_VALIDATION_V3.md`.
- `artifacts/03_planning/PRIORITIZATION_V3.md` y `product_backlog_priori_v3.json`.
- `artifacts/02_requirements/REQUIREMENTS_V4.md`.
- `artifacts/05_architecture/API_SPEC_V2.yaml` y registros reales en `src/modules/` y `src/http/`.
- `client/src/App.jsx`, las 18 páginas de `client/src/pages/`, `client/src/api/client.js`, `client/src/voice/` y `client/src/design-system/`.
- Documentación de usuario, API, limitaciones, cobertura y pruebas en `docs/`.

`UX_SPEC_VALIDATION_V3.md` certifica la especificación histórica v3.1. `UX_SPEC_V4.md` es la referencia visual actual y se acompaña de validación específica en `UX_SPEC_VALIDATION_V4.md`.

## Cobertura de vistas por rol

| Área | Vistas / rutas | Funcionalidad observada |
|---|---|---|
| Acceso compartido | `/sign-in`, `/owner/sign-up`, `/provider/sign-up`, `/about`, `/estado-tecnico` | Inicio de sesión por rol, altas separadas, sesión y cierre, Acerca de nosotros y diagnóstico operativo. |
| Dueño | `/owner/home`, `/owner/assistant`, `/owner/providers/:providerId`, `/owner/services/:serviceId/book`, `/owner/appointments`, `/owner/appointments/:appointmentId/reschedule`, `/owner/pets` | Búsqueda por texto/especie/voz y nombre de proveedor; asistente por texto/voz; perfil público y contacto; reserva guiada; consulta, cancelación y reprogramación de citas; CRUD de mascotas con formularios modales. |
| Proveedor | `/provider/appointments`, `/provider/appointments/:appointmentId/reschedule`, `/provider/catalog`, `/provider/services/new`, `/provider/services/:offeringId/edit`, `/provider/products/new`, `/provider/products/:offeringId/edit`, `/provider/working-hours`, `/provider/profile` | Consulta, cancelación y reprogramación de citas; CRUD de servicios y productos; horario semanal; consulta y actualización del perfil público. |

El cliente contiene 18 componentes de página. `App.jsx` agrupa las rutas por rol y restringe las vistas privadas al tipo de cuenta correspondiente. Las pruebas y la comprobación local de sesión confirman los roles `owner` y `provider`.

## Trazabilidad de capacidades del backend al frontend

| Capacidad/API registrada | Interfaz que la consume | Estado |
|---|---|---|
| Sesión, registro, inicio y cierre de sesión | `App.jsx`, `SignIn`, `OwnerSignUp`, `ProviderSignUp` | Conectada. |
| Salud de API y base de datos | `TechnicalStatus` | Conectada como herramienta operativa, no como función de producto. |
| Mascotas: listar, crear, editar, eliminar | `OwnerPets`; `BookAppointment` consume lista | Conectada. |
| Buscar por texto, filtro por especie y voz | `OwnerSearch` | Conectada. La búsqueda textual incluye ofertas de proveedores cuyo nombre público coincide. |
| Perfil público de proveedor | `ProviderPublicProfile`; también lo enlaza la búsqueda y el asistente | Conectada. El teléfono, correo y dirección abren WhatsApp, Gmail y Google Maps. |
| Contexto y creación de reserva | `BookAppointment` | Conectada. |
| Listados, cancelación y reprogramación de citas de dueño y proveedor | `OwnerAppointments`, `ProviderAppointments`, `RescheduleAppointment` | Conectada para las citas elegibles. |
| Perfil y horario del proveedor | `ProviderProfile`, `ProviderWorkingHours` | Conectada. |
| Crear, listar, actualizar y retirar servicios/productos | `ProviderCatalog`, `PublishService`, `PublishProduct`; búsqueda y perfil público leen las ofertas | Conectada. El borrado de servicios también conserva el comportamiento backend de cancelar citas próximas afectadas. |
| Respuestas del asistente | `OwnerAssistant`; las respuestas enlazan búsqueda, perfil y citas | Conectada. |
| Lectura de perfil/cita (US-042, condicional) | `ListenButton` en `ProviderPublicProfile` y `OwnerAppointments` | Implementada en los contextos que describe US-042. |
| Pedidos de productos | Sin ruta de pedido ni vista | No implementada y diferida por P03 (US-027 a US-033). |

**Conclusión del cruce:** las operaciones de producto que el backend registra están invocadas desde una pantalla, un flujo de sesión o un efecto de backend originado por una acción del frontend. No hay una ruta de pedidos que el frontend deba consumir. Las operaciones internas sin endpoint se ejercitan a través de los flujos que las llaman (por ejemplo, las cancelaciones automáticas cuando cambia una disponibilidad).

## Evaluación de experiencia y diseño

- La capa `identity.css` organiza navegación móvil, tarjetas, formularios, estados, modales y componentes de asistente con una identidad visual coherente. La búsqueda, las mascotas, las citas, el catálogo, el perfil y la reserva tienen patrones compartidos y reglas responsive.
- El flujo de reserva está dividido en pasos; edición/alta de mascotas y confirmaciones de acciones usan diálogos; búsqueda y asistente conservan controles por texto cuando la voz no está disponible.
- Hay soporte de foco visible global y una regla de movimiento reducido para animaciones relevantes. Los controles de voz tienen texto accesible y etiquetas ARIA en las acciones principales.
- **Especificación visual:** la divergencia anterior quedó resuelta por `UX_SPEC_V4.md`, que reemplaza las reglas visuales incompatibles de V2/V3 y conserva los requisitos funcionales no contradictorios.
- **Legibilidad:** los tamaños explícitos por debajo de `.875rem` en `identity.css` fueron elevados; `--font-size-sm` en los estilos base ya equivale a `.875rem`. La navegación móvil tiene 14 px y permite ajuste de línea.
- **Cobertura de navegador:** `tests/e2e/frontend-coverage.spec.js` visita rutas públicas, todas las vistas owner/provider, prueba aislamiento de roles, verifica encabezados y ausencia de overflow horizontal a 390×844 y 1440×900. La suite anterior de reprogramación permanece activa.

## Hallazgos y acciones

### AUD-FE-001 — RESUELTO — La especificación UX no reflejaba la identidad visual vigente

`UX_SPEC_V2.md` prohíbe las imágenes y establece otro stack tipográfico y sistema de tokens; el tema actual adopta la guía VetCare posterior. El cambio fue solicitado, pero los documentos siguen presentando V2 como fuente vigente sin registrar la excepción.

**Corrección:** publicada `artifacts/04_ux/UX_SPEC_V4.md` con paleta, tipografía, imagen, componentes, responsive, inventario de rutas y precedencia frente a V2/V3.

### AUD-FE-002 — RESUELTO — Textos de interfaz por debajo del mínimo de legibilidad documentado

Hay varias etiquetas y metadatos entre .65rem y .88rem, mientras UX_SPEC_V2 §3.3 indica que ningún texto debe quedar por debajo de 14 px.

**Corrección:** navegación móvil, etiquetas, metadatos, botones y ayudas con tamaño mínimo explícito de 14 px en la identidad actual.

### AUD-FE-003 — RESUELTO — No había validación de navegador de todas las vistas y roles

La suite nueva cubre todas las rutas de interfaz pública/privada y ambos roles a dos breakpoints; los tres escenarios E2E de reprogramación previos continúan incluidos. La suite verifica carga de pantalla y desbordamiento, no cada operación de escritura ni conformidad completa con lectores de pantalla.

**Acción recomendada:** ampliar E2E para un recorrido completo de dueño y proveedor, ambos tamaños (móvil/escritorio), acceso por rol y una revisión de teclado/lector de pantalla.

### AUD-FE-004 — LOW — Documentación funcional desactualizada

`FRONTEND.md`, `USER_GUIDE.md`, `API.md`, `REQUIREMENTS_COVERAGE.md` y `KNOWN_LIMITATIONS.md` afirmaban que no existían CRUD de mascotas/ofertas o acciones manuales de citas, aunque ya estaban conectadas.

**Corrección aplicada durante esta auditoría:** se actualizaron esos documentos para reflejar las vistas, rutas y límites actuales. Los pedidos siguen descritos como diferidos, conforme a P03.

## Verificación ejecutada

| Comprobación | Resultado |
|---|---|
| `npm run build` | PASÓ. |
| `npm test` con `TEST_DATABASE_URL` en PostgreSQL local y esquemas aislados | 301/301 PASARON. |
| Suite de QA de `artifacts/07_qa/test_suites` con `TEST_DATABASE_URL` | 143/143 PASARON. |
| Inicio de sesión, lectura de rol y cierre de sesión para las cuentas demo owner/provider | PASÓ en ambos roles. |
| `git diff --check` | PASÓ (solo aviso de normalización LF/CRLF en `identity.css`). |
| `npm run test:e2e` con web/API en puertos aislados 5174/3003 | 14/14 PASARON: rutas owner/provider y públicas, roles, 390×844, 1440×900 y reprogramación. |
| Lectura de tamaño CSS menor a 14 px en `identity.css` | PASÓ; los tamaños visibles de texto explícitos son ≥ `.875rem` (14 px). |

## Recomendación final

**La cobertura funcional del frontend está completa para las capacidades de backend registradas y el alcance vigente.** Las advertencias sobre especificación actual, tamaños tipográficos y cobertura de rutas/breakpoints están resueltas y verificadas. No se detectaron operaciones de negocio huérfanas. La inspección manual de contraste, lector de pantalla y reducción de movimiento sigue como revisión complementaria; los pedidos continúan fuera de alcance según P03.
