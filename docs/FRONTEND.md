# Frontend de VetCare

## Propósito de la aplicación

VetCare es un marketplace web para conectar a dueños de mascotas con clínicas veterinarias y veterinarios independientes. Desde la aplicación se pueden descubrir servicios por especie, consultar perfiles, reservar citas presenciales o a domicilio y administrar las citas. Los proveedores pueden mantener su perfil y horario, publicar servicios y productos y consultar las citas reservadas. La interfaz está en español y presenta precios en pesos colombianos (COP).

Este documento describe las pantallas y rutas implementadas en el cliente actual. No todas las capacidades previstas para el producto están disponibles: los pedidos de productos, pagos, notificaciones, calificaciones y administración no tienen un flujo de interfaz implementado. La gestión de mascotas permite consultar el registro creado durante el alta, pero no agregar, editar ni eliminar mascotas desde la aplicación.

## Tecnologías y estructura

- Cliente: React con React Router y Vite, ubicado en `client/`.
- La aplicación obtiene y modifica datos mediante el cliente HTTP de `client/src/api/client.js`, que consume rutas `/api`.
- `client/src/App.jsx` concentra rutas, estado de sesión, control de acceso por tipo de cuenta y navegación.
- Las vistas están en `client/src/pages/`; estilos y tokens compartidos, en `client/src/design-system/`.
- En producción, el cliente se sirve como sitio estático y la API comparte el origen. La configuración de ejecución se documenta en [SETUP](SETUP.md) y [ARCHITECTURE](ARCHITECTURE.md).

## Sesión, navegación y acceso

Al cargar, la aplicación consulta la sesión. Las páginas privadas requieren una cuenta activa y del rol correspondiente; si el usuario no ha iniciado sesión se le envía a `/sign-in`, y una cuenta de otro tipo no puede abrir la ruta privada. El enlace de marca «VetCare» vuelve a `/`, que redirige al inicio apropiado según el tipo de cuenta.

El encabezado de una sesión de dueño ofrece «Buscar», «Asistente», «Mis citas» y «Mis mascotas». El de proveedor ofrece «Citas», «Catálogo», «Horario» y «Perfil». En pantallas pequeñas, el encabezado muestra la marca VetCare y la navegación pasa a una barra inferior. El menú «Cuenta» permite abrir «Acerca de nosotros» y cerrar sesión; el cierre limpia el estado local y solicita cerrar la sesión en la API. Si la sesión vence, el cliente vuelve a inicio de sesión con un aviso.

## Vistas públicas y acceso

| Ruta | Vista | Uso e interacción |
|---|---|---|
| `/` | Redirección de inicio | Envía a la búsqueda del dueño, a las citas del proveedor o a inicio de sesión según la sesión. No es una pantalla independiente. |
| `/sign-in` | Iniciar sesión (`SignIn`) | Escribir correo y contraseña, y enviar el formulario. La autenticación identifica el rol asociado a las credenciales y lleva a su inicio correspondiente. Muestra errores por campo y avisos generales; proporciona enlaces a ambos registros. |
| `/owner/sign-up` | Registro de dueño (`OwnerSignUp`) | Crear credenciales y registrar la mascota inicial. Tras completar el alta, el flujo autentica al dueño y permite continuar a la aplicación. |
| `/provider/sign-up` | Registro de proveedor (`ProviderSignUp`) | Crear una cuenta de proveedor indicando el tipo de proveedor y sus datos de registro. Después se inicia el recorrido privado de proveedor. |
| `/estado-tecnico` | Estado técnico (`TechnicalStatus`) | Comprueba disponibilidad de la API y de PostgreSQL. Es una utilidad de diagnóstico, no una vista de producto. |
| `/about` | Acerca de nosotros (`AboutUs`) | Explica el propósito de VetCare. Se accede desde «Cuenta» en una sesión activa. |
| `/not-found` y rutas desconocidas | Página no disponible | Explica que la dirección no está disponible para esa cuenta y ofrece volver al inicio apropiado. Las rutas desconocidas sin sesión se redirigen al inicio de sesión. |

## Vistas del dueño de mascota

Todas requieren sesión de dueño.

| Ruta | Vista | Uso e interacción |
|---|---|---|
| `/owner/home` | Buscar (`OwnerSearch`) | Al entrar muestra resultados reales de servicios para iniciar la exploración; permite buscar servicios o productos por texto y especie, con opción de búsqueda por voz. Se pueden abrir perfiles de proveedor o continuar a reservar un servicio. |
| `/owner/assistant` | Asistente (`OwnerAssistant`) | Escribir una consulta sobre el uso de VetCare y enviar para recibir una respuesta del asistente. Está orientado a resolver preguntas del usuario; no sustituye una consulta veterinaria. |
| `/owner/providers/:providerId` | Perfil público (`ProviderPublicProfile`) | Revisar la información pública del proveedor y sus servicios/productos publicados. Desde un servicio disponible se continúa a agendar. |
| `/owner/services/:serviceId/book` | Agendar cita (`BookAppointment`) | Revisar servicio, proveedor, especie, precio y modalidad; seleccionar una mascota compatible, el lugar cuando hay más de una modalidad, fecha y horario. Para atención a domicilio se indica dirección. Al confirmar se crea la cita y se vuelve a «Mis citas». Si el horario dejó de estar disponible, se informa y se recargan opciones. |
| `/owner/appointments` | Mis citas (`OwnerAppointments`) | Consultar citas del dueño y su estado. Las citas que admiten cambio ofrecen acceso a reprogramación; los mensajes de retorno confirman reserva o reprogramación. |
| `/owner/appointments/:appointmentId/reschedule` | Reprogramar cita (`RescheduleAppointment`) | Ver el contexto de la cita, recorrer semanas, seleccionar un día y una hora disponibles y confirmar. Se conservan mascota, servicio, modalidad y lugar; si la cita ya no admite cambios se presenta el aviso correspondiente. |
| `/owner/pets` | Mis mascotas (`OwnerPets`) | Consultar las mascotas asociadas a la cuenta. El flujo actual no presenta acciones para añadir, editar ni eliminar registros. |

### Recorrido habitual del dueño

1. Crear una cuenta con mascota inicial o iniciar sesión.
2. Buscar un proveedor o servicio y abrir su perfil si se quiere revisar más información.
3. Elegir un servicio, mascota, modalidad, horario y, si aplica, dirección a domicilio.
4. Confirmar y revisar la cita en «Mis citas»; desde allí, reprogramar cuando la cita sea elegible.

## Vistas del proveedor

Todas requieren sesión de proveedor.

| Ruta | Vista | Uso e interacción |
|---|---|---|
| `/provider/appointments` | Citas (`ProviderAppointments`) | Consultar las citas asociadas al proveedor y sus datos relevantes. |
| `/provider/catalog` | Catálogo (`ProviderCatalog`) | Consultar servicios y productos publicados. Permite iniciar la publicación, editar una oferta o eliminarla con confirmación desde las acciones de su tarjeta. Eliminar un servicio también puede cancelar citas futuras afectadas; las citas siguen visibles con estado cancelado. |
| `/provider/services/new` | Publicar servicio (`PublishService`) | Completar nombre, precio COP, especie y modalidad según el tipo de proveedor, y publicar. |
| `/provider/services/:offeringId/edit` | Editar servicio (`PublishService`) | Cargar la oferta existente, ajustar sus datos y guardar cambios. La oferta actualizada se refleja en catálogo, perfil público y búsqueda. |
| `/provider/products/new` | Publicar producto (`PublishProduct`) | Completar los datos requeridos del producto y publicarlo en el catálogo. La interfaz de publicación no implica un flujo de compra. |
| `/provider/products/:offeringId/edit` | Editar producto (`PublishProduct`) | Actualizar datos de una oferta existente y guardar. |
| `/provider/working-hours` | Horario (`ProviderWorkingHours`) | Configurar los días y horas de atención disponibles para que se ofrezcan al reservar. Cambiar el horario puede dejar citas fuera de disponibilidad, que el sistema puede cancelar automáticamente. |
| `/provider/profile` | Perfil (`ProviderProfile`) | Consultar y actualizar los datos públicos del proveedor que se muestran a los dueños. |

### Recorrido habitual del proveedor

1. Crear una cuenta de proveedor e iniciar sesión.
2. Completar el perfil público y configurar el horario de atención.
3. Publicar servicios o productos desde el catálogo y editar o retirar ofertas cuando sea necesario.
4. Consultar las citas recibidas en «Citas».

## Estados y comportamiento de formularios

Las vistas con operaciones de red presentan estados de carga, errores, confirmación o ausencia de resultados según el flujo. Los formularios marcan campos que requieren corrección y deshabilitan el botón durante el envío para evitar envíos repetidos. La reserva y la reprogramación consultan horarios disponibles por semana y contemplan que un horario se ocupe antes de confirmar.

Las horas mostradas para reservas se expresan en hora de Bogotá. Las etiquetas, valores monetarios y nombres de especies se presentan en español.

## Alcance y límites visibles

- Se pueden reservar citas de servicios veterinarios en clínica o a domicilio, de acuerdo con la modalidad ofrecida.
- Se pueden reprogramar citas elegibles desde la cuenta del dueño.
- Los proveedores pueden publicar, editar y eliminar ofertas; catálogo de productos no incluye compra ni pedidos desde la interfaz.
- Las mascotas se registran inicialmente durante el alta del dueño y se pueden consultar, pero no se gestionan posteriormente desde la interfaz.
- El diagnóstico `/estado-tecnico` comprueba infraestructura y no forma parte de la navegación de producto.
- Pagos, notificaciones, reseñas/calificaciones, seguimiento en tiempo real y panel administrativo no están disponibles como flujos del frontend.

## Archivos de referencia

- Rutas, sesión y navegación: `client/src/App.jsx`.
- Vistas: `client/src/pages/`.
- Cliente de API: `client/src/api/client.js`.
- Estilos y tokens: `client/src/design-system/`.
- El tema visual está centralizado en `client/src/design-system/identity.css` y se aplica a la navegación y las vistas funcionales existentes.
- Para explorar la interfaz con cuentas ficticias locales, sigue [Entorno local de demostración](DEMO_DATA.md).
- Flujos para usuario final: [USER_GUIDE](USER_GUIDE.md).
- Capacidades y restricciones del producto: [KNOWN_LIMITATIONS](KNOWN_LIMITATIONS.md) y [REQUIREMENTS_COVERAGE](REQUIREMENTS_COVERAGE.md).
