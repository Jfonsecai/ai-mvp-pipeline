import { test, expect } from '@playwright/test';
import { readState } from './reschedule-helpers.js';

async function signIn(page, email, password, expectedHome) {
  await page.goto('/sign-in');
  await page.getByLabel('Correo electrónico').fill(email);
  await page.getByLabel('Contraseña').fill(password);
  await page.getByRole('button', { name: 'Iniciar sesión' }).click();
  await expect(page).toHaveURL(new RegExp(`${expectedHome.replaceAll('/', '\\/')}$`));
}

async function checkRoutes(page, routes) {
  for (const { path, heading } of routes) {
    await page.goto(path);
    await expect(page.getByRole('heading', { name: heading, level: 1 })).toBeVisible();
    const widths = await page.evaluate(() => ({ viewport: document.documentElement.clientWidth, content: document.documentElement.scrollWidth }));
    expect(widths.content, `La ruta ${path} desborda horizontalmente (${widths.content}px > ${widths.viewport}px)`).toBeLessThanOrEqual(widths.viewport);
  }
}

const ownerRoutes = (state) => [
  { path: '/owner/home', heading: 'Encuentra el cuidado ideal para tu mascota.' },
  { path: '/owner/assistant', heading: 'Asistente' },
  { path: '/owner/appointments', heading: 'Mis citas' },
  { path: '/owner/appointments/' + state.movingAppointmentId + '/reschedule', heading: 'Reprogramar cita' },
  { path: '/owner/pets', heading: 'Mis mascotas' },
  { path: '/owner/providers/' + state.providerId, heading: 'Veterinaria E2E' },
  { path: '/owner/services/' + state.serviceId + '/book', heading: 'Agendar cita' },
];

const providerRoutes = (state) => [
  { path: '/provider/appointments', heading: 'Citas' },
  { path: '/provider/appointments/' + state.movingAppointmentId + '/reschedule', heading: 'Reprogramar cita' },
  { path: '/provider/catalog', heading: 'Catálogo' },
  { path: '/provider/services/new', heading: 'Publicar servicio' },
  { path: '/provider/services/' + state.serviceId + '/edit', heading: 'Editar servicio' },
  { path: '/provider/products/new', heading: 'Publicar producto' },
  { path: '/provider/products/' + state.productId + '/edit', heading: 'Editar producto' },
  { path: '/provider/working-hours', heading: 'Horario de atención' },
  { path: '/provider/profile', heading: 'Mi perfil' },
];

for (const viewport of [
  { name: 'escritorio', width: 1440, height: 900 },
  { name: 'móvil', width: 390, height: 844 },
]) {
  test.describe(`Cobertura de vistas en ${viewport.name}`, () => {
    test.use({ viewport });

    test('dueño: recorre cada vista privada y respeta el ancho de pantalla', async ({ page }) => {
      const state = await readState();
      await signIn(page, state.email, state.password, '/owner/home');
      await checkRoutes(page, ownerRoutes(state));
      await page.goto('/about');
      await expect(page.getByRole('heading', { name: 'Acerca de VetCare' })).toBeVisible();
    });

    test('proveedor: recorre sus vistas y respeta el ancho de pantalla', async ({ page }) => {
      const state = await readState();
      await signIn(page, state.providerEmail, state.providerPassword, '/provider/appointments');
      await checkRoutes(page, providerRoutes(state));
      await page.goto('/about');
      await expect(page.getByRole('heading', { name: 'Acerca de VetCare' })).toBeVisible();
    });

    test('visitas públicas', async ({ page }) => {
      for (const { path, heading } of [
        { path: '/sign-in', heading: 'Cuidado veterinario, más cerca de ti.' },
        { path: '/owner/sign-up', heading: 'Crear cuenta de dueño de mascota' },
        { path: '/provider/sign-up', heading: 'Crear cuenta de proveedor' },
      ]) {
        await page.goto(path);
        await expect(page.getByRole('heading', { name: heading, level: 1 })).toBeVisible();
      }
    });

    test('un dueño no puede abrir rutas de proveedor', async ({ page }) => {
      const state = await readState();
      await signIn(page, state.email, state.password, '/owner/home');
      await page.goto('/provider/catalog');
      await expect(page).toHaveURL(/\/not-found$/);
      await expect(page.getByRole('heading', { name: 'No puedes ver esta página' })).toBeVisible();
    });

    test('un proveedor no puede abrir rutas de dueño', async ({ page }) => {
      const state = await readState();
      await signIn(page, state.providerEmail, state.providerPassword, '/provider/appointments');
      await page.goto('/owner/pets');
      await expect(page).toHaveURL(/\/not-found$/);
      await expect(page.getByRole('heading', { name: 'No puedes ver esta página' })).toBeVisible();
    });
  });
}

test('estado técnico muestra el estado del backend sin iniciar sesión', async ({ page }) => {
  await page.goto('/estado-tecnico');
  await expect(page.getByRole('heading', { name: /estado|servicio|sistema/i })).toBeVisible();
});
