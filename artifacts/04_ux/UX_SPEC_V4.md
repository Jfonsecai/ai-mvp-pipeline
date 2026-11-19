# Especificación UX vigente — VetCare

**Versión:** 4.0 · **Estado:** referencia visual y de navegación vigente  
**Actualizada:** 2026-11-19  
**Implementación:** `client/src/App.jsx`, `client/src/pages/` y `client/src/design-system/identity.css`

## Propósito y precedencia

Este documento registra la experiencia que está implementada actualmente. Desde esta versión, la dirección visual V4 reemplaza las reglas visuales incompatibles de `UX_SPEC_V2.md` y `UX_SPEC_V3.md` (fuente del sistema, interfaz sin fotografías y tokens `--color-*`). Los requisitos funcionales, mensajes, estados y flujos de negocio de V2/V3 siguen vigentes cuando no contradicen una decisión visual o de interacción descrita aquí. V1–V3 se conservan como historial, no como fuente visual actual.

VetCare conecta a dueños de mascotas con clínicas y profesionales veterinarios: permite encontrar servicios y proveedores, gestionar mascotas y citas, publicar servicios/productos y administrar el perfil y horario profesional. La compra de productos y los pedidos no tienen flujo frontend y continúan fuera del alcance implementado.

## Lenguaje visual

La referencia es la guía de identidad visual VetCare entregada por el usuario, aplicada como interfaz web adaptable:

| Rol | Color | Uso |
|---|---|---|
| Primario | `#13B8A6` | Marca, acentos y estados seleccionados. |
| Primario profundo | `#087F8C` | Acciones primarias, navegación activa y texto de acción. |
| Acento cálido | `#FF8A65` | Detalles y énfasis secundarios. |
| Acento secundario | `#FFD166` | Avisos y destacados puntuales. |
| Fondo | `#F2FAF7` | Fondo general suave. |
| Superficie menta | `#E0F5EF` | Selección, fondos de apoyo y resaltados. |
| Tarjeta | `#FFFFFF` | Formularios, cards, menús y diálogos. |
| Texto | `#20343B` | Texto principal; texto secundario en gris verdoso legible. |

- Tipografía: **Inter**, con pesos 400, 500, 600, 700 y 800.
- El tamaño mínimo para texto legible de interfaz es **14 px (`.875rem`)**. Se aplica a navegación, etiquetas, metadatos, chips, ayudas, estados y acciones; encabezados pueden escalar según jerarquía.
- Tarjetas y diálogos usan esquinas redondeadas, bordes suaves, separación interna suficiente y sombras discretas. La información de una entidad se distribuye por jerarquía y bloques, no como una lista compacta de pares etiqueta/valor.
- Las imágenes de proveedores, animales y contenido editorial contextualizan el contenido. Deben mantener recorte coherente y texto alternativo cuando comuniquen información; no sustituyen títulos ni datos.
- Iconos de navegación e interacción siguen un lenguaje lineal consistente. Los controles clicables muestran cursor de interacción, foco visible, estados hover/seleccionado y estados deshabilitados perceptibles.
- Los estados de cita usan etiquetas semánticas distinguibles (confirmada/completada, pendiente, cancelada); no depender solo del color.
- Las animaciones son suaves, no desplazan el contenido al aparecer. Respetan `prefers-reduced-motion`.

### Adaptación por pantalla

- **Escritorio:** navegación lateral persistente; área principal alineada con ancho de lectura limitado y tarjetas en columnas cuando el contenido lo permite.
- **Móvil (≤600 px):** encabezado superior compacto con marca VetCare; navegación inferior fija con cuatro destinos por rol; contenido con una columna, controles táctiles amplios, formularios/diálogos dentro del viewport y texto de navegación de al menos 14 px con ajuste de línea.
- **Tableta:** conserva navegación lateral compacta cuando hay espacio; tarjetas y formularios reducen columnas para no comprimir texto.
- No debe existir desplazamiento horizontal de página a 390 px de ancho. Los casos de texto largo se parten dentro de su contenedor.

## Componentes y patrones compartidos

- **Shell por rol:** marca, navegación, acceso a Cuenta y Acerca de nosotros. Owner: Buscar, Asistente, Mis citas y Mis mascotas. Provider: Citas, Catálogo, Horario y Perfil.
- **Tarjeta de datos:** imagen contextual, título, categoría/estado, datos agrupados, precio/fecha como elementos destacados y acciones con estilo de botón/enlace. Los datos largos usan `overflow-wrap` y no empujan controles fuera de la card.
- **Formulario:** etiquetas visibles, controles de al menos 14 px, validación próxima al campo, botones alineados y carga temporal solo durante una operación en curso.
- **Diálogo:** alta/edición de mascota y confirmaciones usan overlay centrado, cierre accesible, foco administrado, acciones alineadas y composición móvil en una columna.
- **Asistente:** la conversación aparece en un contenedor de tamaño estable; la respuesta se revela suavemente como texto (el panel no crece por cada fragmento); el orbe animado representa actividad de voz, cambia a pausa/silencio entre segmentos hablados y se detiene al terminar. Controles de voz y detener lectura permanecen estables en la esquina superior derecha.
- **Acciones de contacto:** teléfono abre WhatsApp, correo abre Gmail y dirección abre Google Maps con la ubicación.

## Inventario de vistas

| Rol/acceso | Ruta | Interfaz y uso principal |
|---|---|---|
| Invitado | `/sign-in` | Inicio de sesión por correo y contraseña; la cuenta determina el rol, sin selector de rol. Enlaces separados a registro de dueño y proveedor. |
| Invitado | `/owner/sign-up` | Crear cuenta y primera mascota como dueño. |
| Invitado | `/provider/sign-up` | Crear cuenta y tipo de proveedor. |
| Compartida | `/about` | Acerca de VetCare, accesible desde Cuenta para preservar espacio de navegación. |
| Operación | `/estado-tecnico` | Diagnóstico de disponibilidad de API y base de datos. |
| Dueño | `/owner/home` | Buscar por consulta, proveedor o servicio; filtros de especie; abrir ficha pública y agendar. |
| Dueño | `/owner/assistant` | Preguntas por texto/voz, respuestas progresivas, lectura de voz, enlaces contextuales a proveedores y citas. |
| Dueño | `/owner/appointments` | Próximas e históricas, detalle, escucha, cancelar, reprogramar. |
| Dueño | `/owner/appointments/:appointmentId/reschedule` | Elegir otra fecha/hora disponible y confirmar. |
| Dueño | `/owner/pets` | Ver mascotas; agregar/editar en modal; retirar con confirmación. |
| Dueño | `/owner/providers/:providerId` | Perfil público, servicios, imagen y contacto externo. |
| Dueño | `/owner/services/:serviceId/book` | Reserva guiada por pasos, selección de mascota, modalidad, horario y confirmación. |
| Proveedor | `/provider/appointments` | Consultar citas, ver detalles y gestionar/reprogramar las propias. |
| Proveedor | `/provider/appointments/:appointmentId/reschedule` | Seleccionar y confirmar un horario alterno. |
| Proveedor | `/provider/catalog` | Consultar servicios y productos publicados; editar o retirar. |
| Proveedor | `/provider/services/new` | Publicar servicio. |
| Proveedor | `/provider/services/:offeringId/edit` | Editar servicio existente. |
| Proveedor | `/provider/products/new` | Publicar producto. |
| Proveedor | `/provider/products/:offeringId/edit` | Editar producto existente. |
| Proveedor | `/provider/working-hours` | Configurar días y horas de atención. |
| Proveedor | `/provider/profile` | Consultar y actualizar información pública del proveedor. |
| Sistema | `/not-found` | Informar ruta no disponible o acceso por rol incorrecto; ofrecer navegación de retorno. |

## Reglas de interacción y acceso

1. El inicio de sesión deriva al área correspondiente al rol almacenado en la cuenta. Un dueño no puede abrir rutas de proveedor y un proveedor no puede abrir rutas de dueño.
2. Buscar y el asistente ofrecen alternativa escrita si voz no está soportada o se deniega el permiso. El saludo automático del asistente no requiere un botón adicional.
3. Al enviar una pregunta, el espacio de respuesta se reserva antes de mostrar texto; hay una breve pausa y el contenido se revela de forma fluida. Durante pausas de locución, el orbe representa reposo.
4. Los botones de voz activada/desactivada y detener lectura no desplazan textos ni se reubican al cambiar de estado.
5. Una cita cancelada muestra siempre su etiqueta y estilo de cancelación, con contraste legible. Reprogramar y cancelar se presentan como acciones contenidas en botones/enlaces visuales, no enlaces de texto sueltos.
6. Los formularios de reserva son progresivos y cada paso ofrece continuar/volver con alineación coherente. Indicadores de carga terminan al resolver o fallar una petición.
7. Las rutas privadas redirigen a inicio de sesión cuando no hay sesión y bloquean el rol opuesto. La navegación activa debe ser identificable también sin color.

## Verificación UX asociada

La suite `tests/e2e/frontend-coverage.spec.js` cubre las rutas públicas y privadas con cuentas de prueba aisladas, ambos roles, escritorio (1440×900) y móvil (390×844), validación de encabezados y desbordamiento horizontal. La suite existente conserva las pruebas específicas de reprogramación. Esta cobertura de rutas/breakpoints no reemplaza una revisión manual de contraste, lector de pantalla, reducción de movimiento ni inspección visual de capturas.

## Relación con artefactos anteriores

- V2/V3 conservan requisitos funcionales y contratos no visuales que no contradicen V4.
- Los valores visuales de V2/V3 quedan reemplazados por la paleta VetCare, Inter, fotografías contextuales, componentes redondeados y responsive de este documento.
- El umbral de 14 px de V4 prevalece frente a tamaños menores especificados en textos anteriores.
- La matriz de rutas se deriva de `client/src/App.jsx`; si una ruta de producto cambia, actualizar también esta especificación y Playwright.
