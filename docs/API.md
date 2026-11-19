# API

La API HTTP de Express se monta bajo `/api`. Métodos, paths y guards se verificaron por inspección de los registros de rutas y handlers. El contrato vigente está en `artifacts/05_architecture/API_SPEC_V2.yaml`; esta tabla resume las rutas registradas y su uso desde el frontend.

| Método | Ruta | Acceso / notas |
|---|---|---|
| GET | `/api/health` | Público; chequeo operativo. |
| GET | `/api/health/db` | Público; chequeo operativo de PostgreSQL. |
| POST | `/api/auth/sign-up/owner` | Público, sujeto al control de origen. |
| POST | `/api/auth/sign-up/provider` | Público, sujeto al control de origen. |
| POST | `/api/auth/sign-in` | Público, sujeto al control de origen. |
| POST | `/api/auth/sign-out` | No requiere sesión autenticada; sujeto al control de origen. |
| GET | `/api/session` | Contexto de sesión; puede devolver estado anónimo. |
| GET, POST | `/api/owner/pets` | Dueño autenticado; listar y agregar mascotas. |
| PUT, DELETE | `/api/owner/pets/:petId` | Dueño autenticado; editar o eliminar una mascota propia. |
| GET, PUT | `/api/provider/profile` | Proveedor autenticado. |
| GET, PUT | `/api/provider/working-hours` | Proveedor autenticado. |
| GET | `/api/provider/offerings` | Proveedor autenticado. |
| POST | `/api/provider/services` | Proveedor autenticado. |
| PUT | `/api/provider/services/:offeringId` | Proveedor autenticado; solo sus servicios activos (otro proveedor, un producto o un id inexistente devuelven `NOT_FOUND`). |
| DELETE | `/api/provider/offerings/:offeringId` | Proveedor autenticado; elimina (de forma lógica) uno de sus servicios o productos activos; para un servicio cancela además sus citas próximas; responde `{ removed: true, cancelledAppointments }` (0 para un producto). Los pedidos ya hechos de un producto eliminado no se modifican. Otro proveedor, un id inexistente o un elemento ya eliminado devuelven `NOT_FOUND`. |
| POST | `/api/provider/products` | Proveedor autenticado. |
| PUT | `/api/provider/products/:offeringId` | Proveedor autenticado; solo sus productos activos; cambia nombre, precio y especie (la disponibilidad no se modifica). Otro proveedor, un servicio, un producto eliminado o un id inexistente devuelven `NOT_FOUND`. |
| GET | `/api/search` | Dueño autenticado. |
| GET | `/api/providers/:providerId` | Dueño autenticado. |
| GET | `/api/services/:serviceId/booking-context` | Dueño autenticado. |
| GET, POST | `/api/owner/appointments` | Dueño autenticado. |
| GET | `/api/provider/appointments` | Proveedor autenticado. |
| POST | `/api/provider/appointments/:appointmentId/cancel` | Proveedor autenticado; solo su cita futura programada. Conserva el registro como cancelado y lo devuelve actualizado; el dueño lo ve como cancelado en sus citas. |
| POST | `/api/owner/appointments/:appointmentId/cancel` | Dueño autenticado; cancela una cita propia elegible. |
| GET | `/api/owner/appointments/:appointmentId/reschedule-context` | Dueño autenticado; devuelve horarios disponibles para su cita. |
| POST | `/api/owner/appointments/:appointmentId/reschedule` | Dueño autenticado; mueve su cita a un horario disponible. |
| GET | `/api/provider/appointments/:appointmentId/reschedule-context` | Proveedor autenticado; devuelve horarios disponibles para una cita propia. |
| POST | `/api/provider/appointments/:appointmentId/reschedule` | Proveedor autenticado; mueve una cita propia a un horario disponible y devuelve su vista actualizada. |
| POST | `/api/search/voice` | Dueño autenticado; interpreta la búsqueda por voz y devuelve resultados. |
| POST | `/api/assistant/messages` | Dueño autenticado; devuelve respuestas informativas del asistente. |

El frontend usa las rutas de producto registradas, incluidos los CRUD de mascotas, perfiles, horarios, ofertas y citas. No hay endpoints registrados para pedidos. Cambiar el horario del proveedor puede producir cancelaciones automáticas según la lógica de reservas; véase [limitaciones](KNOWN_LIMITATIONS.md).

Los endpoints de salud no aparecen en el contrato de producto P05; se documentan como comportamiento operativo añadido (P06 IMPLEMENTATION_LOG, DEV-001), no como capacidades MVP. API y página técnica de estado se tratan como comportamiento no especificado en artefactos de producto. Las solicitudes mutantes están sujetas a protección de origen; no inferir que “público” implica ausencia de ese control.
