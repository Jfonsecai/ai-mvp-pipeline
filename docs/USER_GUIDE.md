# Guía de usuario

La interfaz implementada usa etiquetas en español. Las rutas fueron contrastadas con `client/src/App.jsx`. Los flujos de la interfaz no tienen pruebas automatizadas en el navegador. En producción, el smoke test de P08 verifica que el cliente y la API responden, y el equipo reporta haber recorrido a mano los flujos principales el 2026-10-14 (el equipo reporta que todos pasaron; sin registro de lo observado).

## Dueño de mascota

1. Regístrese en `/owner/sign-up` y proporcione los datos de cuenta y la mascota inicial.
2. Inicie sesión en `/sign-in`.
3. Use `/owner/home` para buscar y filtrar servicios/proveedores y abra un perfil.
4. Seleccione un servicio, revise el contexto y reserve una cita en clínica o a domicilio. La modalidad a domicilio requiere dirección.
5. Consulte citas en `/owner/appointments`.
6. Cierre sesión mediante la navegación de la aplicación.

## Proveedor

1. Regístrese en `/provider/sign-up` e inicie sesión en `/sign-in`.
2. Edite datos públicos en `/provider/profile` y disponibilidad en `/provider/working-hours`.
3. Publique servicios o productos desde `/provider/services/new` o `/provider/products/new`. Para cambiar un servicio ya publicado, use «Editar» en su tarjeta del catálogo (`/provider/services/:id/edit`). Para cambiar un producto, use «Editar» en su tarjeta (`/provider/products/:id/edit`): el nombre, el precio y la especie nuevos aparecen en el catálogo, el perfil público y las búsquedas. Para dejar de ofrecer un servicio o un producto, use «Eliminar» en su tarjeta y confirme: el servicio desaparece del catálogo, del perfil público y de las búsquedas, ya no puede reservarse y sus citas próximas se cancelan (siguen visibles como «Cancelada»). Un producto eliminado desaparece de esas mismas listas y ya no puede pedirse; los pedidos que ya se hicieron no cambian.
4. Consulte ofertas en `/provider/catalog` y citas en `/provider/appointments`.

La ruta `/estado-tecnico` muestra verificaciones técnicas y no es parte del recorrido de usuario definido en UX (P06 DEV-003). No se incluyen flujos de compra de productos. La gestión de mascotas después del registro, edición/eliminación de ofertas, cancelación manual y reprogramación no están disponibles.
