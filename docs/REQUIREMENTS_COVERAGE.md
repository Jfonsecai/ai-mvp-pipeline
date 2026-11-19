# Cobertura de requisitos

La cobertura representa las nueve capacidades MVP vigentes de `artifacts/01_discovery/PRODUCT_VISION_V4.md`; los estados reflejan inspección de código. P01-MVP-004 está retirado y no se cuenta como capacidad vigente.

| ID | Capacidad | Fuente | Estado | Evidencia | Documentado en |
|---|---|---|---|---|---|
| P09-COV-001 | Buscar y filtrar por especie | P01-MVP-001; US-016/017 | IMPLEMENTED | `src/modules/search/offerings.js`; página de búsqueda | README, USER_GUIDE |
| P09-COV-002 | Reservar cita, incluida modalidad a domicilio | P01-MVP-002; US-019/020 | IMPLEMENTED | `src/modules/scheduling/booking.js`, `slots.js` | README, USER_GUIDE |
| P09-COV-003 | Catálogo de ofertas del proveedor | P01-MVP-003; US-010–015 | IMPLEMENTED | Crear, listar, editar y eliminar servicios/productos; los servicios aparecen en búsqueda y perfil público | FRONTEND, USER_GUIDE |
| P09-COV-004 | Gestión de mascotas | P01-MVP-005; US-001, US-004–007 | IMPLEMENTED | Alta inicial y CRUD posterior desde Mis mascotas | FRONTEND, USER_GUIDE |
| P09-COV-005 | Cuentas y autenticación | P01-MVP-006; US-001–003, US-034 | IMPLEMENTED | `src/modules/identity/`, páginas de registro/login | README, USER_GUIDE |
| P09-COV-006 | Gestión de citas | P01-MVP-007; US-021–026 | IMPLEMENTED | Reserva, listado, cancelación y reprogramación para dueño/proveedor; cambios de horario pueden cancelar citas futuras afectadas | FRONTEND, USER_GUIDE |
| P09-COV-007 | Perfil de proveedor | P01-MVP-008; US-008/018 | IMPLEMENTED | `src/modules/provider/profile.js` | README, USER_GUIDE |
| P09-COV-008 | Pedidos de productos | P01-MVP-009; US-027–033 | NOT_IMPLEMENTED / DEFERRED | No hay rutas API ni flujo de compra en el frontend; el alcance de pedidos está diferido | KNOWN_LIMITATIONS |
| P09-COV-009 | Horario de proveedor | P01-MVP-010; US-009 | IMPLEMENTED | `src/modules/provider/working-hours.js` | README, USER_GUIDE |

El alcance Future está vacío/no definido en la visión consultada. Exclusiones relevantes: pagos, notificaciones, seguimiento en tiempo real, calificaciones/reseñas, verificación, otras ciudades, administración y capacidad/personal de clínicas. Los estados reflejan el código actual inspeccionado. El 2026-11-19 pasaron `npm test` (301) y la suite de QA (143); véase [TESTING](TESTING.md). La cobertura Playwright existente se concentra en reprogramación y no valida todas las vistas ni la conformidad visual completa; véase [auditoría frontend](FRONTEND_AUDIT.md).
