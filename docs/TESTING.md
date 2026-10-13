# Pruebas

## Ejecutar

```sh
npm test
```

El comando de `package.json` usa el runner de pruebas integrado de Node y los archivos `tests/*.test.js`. Configure `TEST_DATABASE_URL` solo para una base de datos desechable: las pruebas DB crean y eliminan objetos de prueba allí. Si la variable no está definida, las pruebas que requieren base de datos se omiten y se reportan como omitidas, no aprobadas.

Los archivos existentes cubren identidad/sesiones, perfil/horarios, catálogo, búsqueda, reservas, base de datos, HTTP, cliente y consistencia de contratos.

## Resultados conocidos

P09 no ejecutó `npm test`: el proceso puede leer `.env` y conectarse a una base de datos configurada. `artifacts/06_implementation/RUNTIME_VALIDATION_REPORT_2026-10-12.md` registra 175 pruebas aprobadas y build exitoso en una ejecución anterior. `artifacts/07_qa/TEST_EXECUTION_REPORT.md` conserva resultados de QA de su propia ejecución. Son evidencias anteriores, no resultados de P09. No se afirma aquí un resultado de pruebas actual.
