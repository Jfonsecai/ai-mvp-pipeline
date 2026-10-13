# Modelo de datos

El esquema de negocio se define en `migrations/001_initial_schema.sql`. Los campos se resumen a nivel funcional; consulte la migración para nombres, tipos, restricciones e índices exactos.

| Tabla | Datos principales |
|---|---|
| `account` | Tipo de cuenta, nombre, email normalizado, hash de contraseña y fecha de creación. |
| `session` | Token en forma de hash, cuenta asociada, creación, última actividad, vencimiento y finalización. |
| `pet` | Dueño, nombre, especie, raza, edad y peso/altura opcionales. |
| `provider_profile` | Tipo de proveedor, nombre público, teléfono/email de contacto y dirección. |
| `working_hours` | Proveedor, día de semana y horas de inicio/fin. |
| `offering` | Proveedor, servicio/producto, nombre, precio COP, especies y modalidad/disponibilidad. |
| `appointment` | Dueño, mascota, servicio, proveedor, hora, modalidad/dirección y estado. |
| `product_order` | Producto, cantidad, precio/total, dirección de entrega y estado. |

El migrador crea además `schema_migration` como tabla de control para registrar archivos migrados (`src/db/migrator.js`). Es una tabla persistida de infraestructura que no está en el modelo de datos de producto P05 (DEV-002); se registra como discrepancia en el reporte P09.

La existencia de `product_order` no implementa pedidos: el código actual no ofrece rutas ni flujo de aplicación para crear o consultar pedidos.
