# Guía de usuario

La interfaz implementada usa etiquetas en español. Las rutas fueron contrastadas con `client/src/App.jsx`. Los flujos de la interfaz no tienen pruebas automatizadas en el navegador. En producción, el smoke test de P08 verifica que el cliente y la API responden, y el equipo reporta haber recorrido a mano los flujos principales el 2026-10-14 (el equipo reporta que todos pasaron; sin registro de lo observado).

## Dueño de mascota

1. Regístrese en `/owner/sign-up` con los datos de la cuenta y una mascota inicial o inicie sesión en `/sign-in`.
2. Busque servicios por texto, especie o voz en `/owner/home`; puede buscar también por nombre del proveedor.
3. Abra un proveedor para revisar su perfil y contactar por WhatsApp, Gmail o Google Maps si publicó esos datos.
4. Seleccione un servicio y siga los pasos para elegir mascota, modalidad/lugar y horario. La atención a domicilio requiere dirección.
5. En `/owner/appointments`, consulte, cancele o reprograme citas que sean elegibles.
6. En `/owner/pets`, agregue, edite o elimine mascotas; los formularios se abren en modal.
7. Use `/owner/assistant` para preguntas sobre proveedores, servicios, precios, horarios y citas por texto o voz.
8. Cierre sesión mediante el menú «Cuenta».

## Proveedor

1. Regístrese en `/provider/sign-up` e inicie sesión en `/sign-in`.
2. Edite datos públicos en `/provider/profile` y disponibilidad en `/provider/working-hours`.
3. Publique servicios o productos desde `/provider/services/new` o `/provider/products/new`. Para cambiar un servicio ya publicado, use «Editar» en su tarjeta del catálogo (`/provider/services/:id/edit`). Para cambiar un producto, use «Editar» en su tarjeta (`/provider/products/:id/edit`): el nombre, el precio y la especie nuevos aparecen en el catálogo, el perfil público y las búsquedas. Para dejar de ofrecer un servicio o un producto, use «Eliminar» en su tarjeta y confirme: el servicio desaparece del catálogo, del perfil público y de las búsquedas, ya no puede reservarse y sus citas próximas se cancelan (siguen visibles como «Cancelada»). Un producto eliminado desaparece de esas mismas listas y ya no puede pedirse; los pedidos que ya se hicieron no cambian.
4. Consulte, edite o elimine ofertas en `/provider/catalog`.
5. Consulte, cancele o reprograme citas futuras elegibles en `/provider/appointments`.

La ruta `/estado-tecnico` muestra verificaciones técnicas y no es parte del recorrido de producto. No se incluyen flujos de compra de productos. Los controles de voz dependen de las capacidades y permisos del navegador.
