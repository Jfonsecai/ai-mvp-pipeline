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

## Pruebas de navegador

Las pruebas E2E usan Playwright con Chromium y arrancan la API y el cliente de Vite. Requieren `TEST_DATABASE_URL` apuntando a una base PostgreSQL desechable; no cargan `.env`. Cada ejecución crea un esquema con nombre aleatorio, aplica las migraciones, siembra datos de prueba y elimina el esquema al finalizar.

Instale Chromium una vez y ejecute la suite:

```sh
npx playwright install chromium
npm run test:e2e
```

En PowerShell, configure `TEST_DATABASE_URL` solo en la sesión que ejecuta la prueba:

```powershell
$env:TEST_DATABASE_URL = "postgresql://vetcare@localhost:5432/vetcare_test"
npm run test:e2e
```

La suite verifica el inicio de sesión con credenciales inválidas y válidas, los horarios libres y ocupados, la selección por teclado, la confirmación, el mensaje de éxito, el foco de retorno y la persistencia del nuevo horario. Las capturas del flujo de US-023 se guardan en `artifacts/06_implementation/evidence/US-023/`; Playwright conserva además trazas y capturas de fallos bajo `test-results/`. GitHub Actions ejecuta esta suite con su PostgreSQL temporal.

## Resultados conocidos

Resultados ejecutados el 2026-10-14 sobre el commit `8c439b7`, con una base PostgreSQL desechable y `TEST_DATABASE_URL` configurada (fuente: `artifacts/08_deployment/evidence/p08_rerun_ci_local.txt`):

| Suite | Resultado |
|---|---|
| `npm test` (`tests/*.test.js`) | 175 de 175 aprobadas, 0 omitidas |
| Suite de QA | 143 de 143 aprobadas, 0 omitidas |

La integración continua de GitHub Actions ejecuta ambas suites, más un paso que falla si la base de datos de pruebas no está disponible (para que las omisiones no pasen por éxito); el run del commit `8c439b7` terminó con todos los pasos en éxito (`artifacts/08_deployment/evidence/p08_rerun_github_history.txt`). `artifacts/07_qa/TEST_EXECUTION_REPORT.md` y `artifacts/06_implementation/RUNTIME_VALIDATION_REPORT_2026-10-12.md` conservan resultados anteriores de sus propias ejecuciones. P09 no ejecutó las pruebas por sí mismo; cita las ejecuciones de P08.

En la validación local de US-023 del 2026-11-10, la suite del proyecto pasó 293/293, la suite de navegador pasó 3/3 y `npm run build` pasó, con PostgreSQL 16 desechable. El informe y la evidencia visual están en `artifacts/06_implementation/increments/US-023_IMPLEMENTATION_VALIDATION_V2.md` y `artifacts/06_implementation/evidence/US-023/`. La automatización de Chromium cubre teclado y foco en ese flujo; no sustituye pruebas con lector de pantalla, revisión humana independiente ni validación del entorno hospedado.
