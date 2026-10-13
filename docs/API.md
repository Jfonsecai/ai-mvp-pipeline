# API

La API HTTP de Express se monta bajo `/api`. Métodos, paths y guards se verificaron por inspección de los registros de rutas y handlers. El contrato de payloads está especificado en `artifacts/05_arquitecture/API_SPEC_V1.yaml`; esta tabla resume las rutas registradas.

| Método | Ruta | Acceso / notas |
|---|---|---|
| GET | `/api/health` | Público; chequeo operativo. |
| GET | `/api/health/db` | Público; chequeo operativo de PostgreSQL. |
| POST | `/api/auth/sign-up/owner` | Público, sujeto al control de origen. |
| POST | `/api/auth/sign-up/provider` | Público, sujeto al control de origen. |
| POST | `/api/auth/sign-in` | Público, sujeto al control de origen. |
| POST | `/api/auth/sign-out` | No requiere sesión autenticada; sujeto al control de origen. |
| GET | `/api/session` | Contexto de sesión; puede devolver estado anónimo. |
| GET | `/api/owner/pets` | Dueño autenticado. |
| GET, PUT | `/api/provider/profile` | Proveedor autenticado. |
| GET, PUT | `/api/provider/working-hours` | Proveedor autenticado. |
| GET | `/api/provider/offerings` | Proveedor autenticado. |
| POST | `/api/provider/services` | Proveedor autenticado. |
| POST | `/api/provider/products` | Proveedor autenticado. |
| GET | `/api/search` | Dueño autenticado. |
| GET | `/api/providers/:providerId` | Dueño autenticado. |
| GET | `/api/services/:serviceId/booking-context` | Dueño autenticado. |
| GET, POST | `/api/owner/appointments` | Dueño autenticado. |
| GET | `/api/provider/appointments` | Proveedor autenticado. |

No hay endpoints registrados para pedidos, ni para cancelación o reprogramación manual. Cambiar el horario del proveedor puede producir cancelaciones automáticas según la lógica de reservas; véase [limitaciones](KNOWN_LIMITATIONS.md).

Los endpoints de salud no aparecen en el contrato de producto P05; se documentan como comportamiento operativo añadido (P06 IMPLEMENTATION_LOG, DEV-001), no como capacidades MVP. API y página técnica de estado se tratan como comportamiento no especificado en artefactos de producto. Las solicitudes mutantes están sujetas a protección de origen; no inferir que “público” implica ausencia de ese control.
