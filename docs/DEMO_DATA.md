# Entorno local de demostración

El archivo [`compose.yaml`](../compose.yaml) levanta una base PostgreSQL aislada, aplica las migraciones, carga cuentas y datos de demostración, inicia la API y publica el frontend. La semilla solo se ejecuta en el servicio Docker local `seed`; exige `NODE_ENV=development` y `DEMO_SEED=true`, y el script se niega a ejecutarse en producción. No se importa durante el build de Vercel ni forma parte de las migraciones de producción.

## Iniciar

Desde la raíz del repositorio:

```sh
docker compose up --build
```

La primera ejecución construye los contenedores y crea el volumen local `vetcare_demo_data`. Cuando termina la semilla, abre [http://localhost:5173](http://localhost:5173). Las rutas de estado están disponibles en `http://localhost:3002/api/health` y `http://localhost:3002/api/health/db`.

## Cuentas de prueba

En la pantalla de acceso, los botones de demostración rellenan las credenciales. También puedes escribirlas manualmente:

| Rol | Correo | Contraseña |
|---|---|---|
| Dueña de mascota | `demo.dueno@vetcare.local` | `VetCareDemo2026!` |
| Clínica | `demo.clinica@vetcare.local` | `VetCareDemo2026!` |
| Veterinaria independiente | `demo.veterinaria@vetcare.local` | `VetCareDemo2026!` |

Los datos ficticios incluyen 8 proveedores (5 clínicas y 3 veterinarios independientes), 12 mascotas con raza, edad, peso y altura, 24 servicios, 20 productos, 12 citas próximas, 6 canceladas y 12 órdenes con distintos estados. Los productos también muestran disponibilidad mixta. Así las búsquedas, los perfiles, los catálogos, las agendas y la lista de mascotas tienen más contenido para recorrer. Las órdenes llenan la estructura de datos; aún no hay una pantalla para consultarlas o gestionarlas. Las tarjetas de resultados y mascotas usan fotos variadas de Unsplash; requieren conexión a internet para cargarse.

## Detener o reiniciar

- `docker compose down` detiene los servicios y conserva la base de demostración.
- `docker compose up` vuelve a levantar la aplicación y la semilla actualiza los registros de demostración.
- `docker compose down -v` elimina el volumen y todos los datos locales para iniciar desde cero.

El puerto PostgreSQL local es `55432`; API `3002`; frontend `5173`. Los puertos se enlazan a `127.0.0.1`. Esta configuración es para desarrollo local, no para desplegar en producción. No conectes el servicio de semilla a una base real.
