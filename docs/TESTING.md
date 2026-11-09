# Pruebas

## Ejecutar

```sh
npm test
```

El comando de `package.json` usa el runner de pruebas integrado de Node (carga `.env`) y los archivos `tests/*.test.js`. Configure `TEST_DATABASE_URL` solo para una base de datos desechable: las pruebas DB crean y eliminan objetos de prueba allí. Si la variable no está definida, las pruebas que requieren base de datos se omiten y se reportan como omitidas, no aprobadas.

Además existe una suite de QA generada en P07, con pruebas unitarias, de integración, de contrato y de seguridad:

```sh
node --test "artifacts/07_qa/test_suites/**/*.test.js"
```

Este comando **no** carga `.env`: sin `TEST_DATABASE_URL` exportada en el shell, cinco de sus seis archivos (los que usan la base de datos) se reportan como omitidos con código de salida 0, y solo se ejecutan 27 de las 143 pruebas. Una ejecución así no es una ejecución completa.

Los archivos existentes cubren identidad/sesiones, perfil/horarios, catálogo, búsqueda, reservas, base de datos, HTTP, cliente y consistencia de contratos.

## Resultados conocidos

Resultados ejecutados el 2026-10-14 sobre el commit `8c439b7`, con una base PostgreSQL desechable y `TEST_DATABASE_URL` configurada (fuente: `artifacts/08_deployment/evidence/p08_rerun_ci_local.txt`):

| Suite | Resultado |
|---|---|
| `npm test` (`tests/*.test.js`) | 175 de 175 aprobadas, 0 omitidas |
| Suite de QA | 143 de 143 aprobadas, 0 omitidas |

La integración continua de GitHub Actions ejecuta ambas suites, más un paso que falla si la base de datos de pruebas no está disponible (para que las omisiones no pasen por éxito); el run del commit `8c439b7` terminó con todos los pasos en éxito (`artifacts/08_deployment/evidence/p08_rerun_github_history.txt`). `artifacts/07_qa/TEST_EXECUTION_REPORT.md` y `artifacts/06_implementation/RUNTIME_VALIDATION_REPORT_2026-10-12.md` conservan resultados anteriores de sus propias ejecuciones. P09 no ejecutó las pruebas por sí mismo; cita las ejecuciones de P08.

No existen pruebas automatizadas de la interfaz de usuario en el navegador (hallazgos P07 F-04 y W-3): el cliente se verifica solo mediante el build y el smoke test, que comprueba que la página se sirve.
