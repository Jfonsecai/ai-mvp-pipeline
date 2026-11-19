# Validación UX — Especificación vigente VetCare V4

**Fecha:** 2026-11-19  
**Resultado:** `PASS_WITH_WARNINGS`  
**Alcance:** vigencia visual, inventario de vistas, legibilidad tipográfica y cobertura Playwright documentada.

## Resultado ejecutivo

V4 describe la interfaz actual y resuelve las tres advertencias del frontend: documenta la identidad VetCare como fuente visual vigente; fija mínimo de 14 px para texto legible y la implementación explícita cumple ese mínimo; y existe cobertura Playwright para vistas públicas/privadas, roles y tamaños móvil/escritorio.

## Comprobaciones

| Criterio | Estado | Evidencia |
|---|---|---|
| Dirección visual refleja la implementación VetCare actual | PASS | `UX_SPEC_V4.md` define paleta, Inter, imágenes, superficies, tarjetas y responsive; declara precedencia sobre reglas visuales incompatibles V2/V3. |
| Inventario de interfaces se corresponde con las rutas del cliente | PASS | Matriz V4 derivada de las rutas en `client/src/App.jsx`; pruebas verifican vistas públicas y privadas owner/provider. |
| Interacciones y responsabilidades de rol están descritas | PASS | V4 resume búsqueda, asistente, citas, reserva, mascotas, catálogo, horario, perfil y controles compartidos. Las pruebas validan redirección del rol contrario. |
| Texto legible no menor a 14 px | PASS | `identity.css` no conserva tamaños de texto explícitos menores a `.875rem`; `--font-size-sm` es `.875rem`. El tamaño mínimo también se indica en V4. |
| Breakpoints probados | PASS | `npm run test:e2e`: 1440×900 y 390×844; cada ruta owner/provider y las vistas públicas verifican encabezado y overflow horizontal. |
| Suite E2E de flujos existente | PASS | Se mantuvieron y ejecutaron los tres casos de reprogramación además de cobertura de ruta/rol. Resultado total: 14/14. |
| Auditoría visual y accesible manual completa | PENDIENTE | Las pruebas automatizan routing, acceso y ancho; no sustituyen revisión humana de contraste de todos los estados, lector de pantalla, reducción de movimiento ni inspección detallada de cada captura. |

## Cambios aplicados

- Se publicó `artifacts/04_ux/UX_SPEC_V4.md` como fuente visual vigente. V2/V3 permanecen históricas y aportan requisitos funcionales cuando no contradicen V4.
- Se elevaron los metadatos, etiquetas, ayudas y controles de identidad visual inferiores a 14 px; navegación móvil pasa a 14 px y se permite ajustar las etiquetas en varias líneas.
- Se añadió `tests/e2e/frontend-coverage.spec.js` con recorridos para dueño/proveedor, rutas públicas, protección por rol y aserción de no desbordamiento en móvil/escritorio.
- Se hizo configurable el puerto local de Playwright para probar la app sin interferir con el Docker ya levantado.
- El setup crea proveedor con credenciales y una oferta producto dentro del esquema aleatorio E2E, que se elimina al terminar; no agrega fixtures al compose de producción.

## Ejecución reproducible

```powershell
$env:TEST_DATABASE_URL='postgresql://vetcare:vetcare_demo_only@127.0.0.1:55432/vetcare_demo'
$env:VETCARE_E2E_API_PORT='3003'
$env:VETCARE_E2E_WEB_PORT='5174'
npm run test:e2e
```

Resultado de esta ejecución: **14 pruebas aprobadas**. La app Docker pudo seguir usando sus puertos habituales.
