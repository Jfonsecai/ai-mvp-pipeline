// Demo data for the disposable local Docker Compose stack only.
// It is intentionally opt-in and refuses to run outside NODE_ENV=development.
import argon2 from 'argon2';
import pg from 'pg';

if (process.env.NODE_ENV !== 'development' || process.env.DEMO_SEED !== 'true') {
  console.error('Demo seed refused: set NODE_ENV=development and DEMO_SEED=true for the local demo stack.');
  process.exit(2);
}

const connectionString = process.env.DATABASE_URL_UNPOOLED;
if (!connectionString) {
  console.error('Demo seed refused: DATABASE_URL_UNPOOLED is required.');
  process.exit(2);
}
let seedTarget;
try {
  seedTarget = new URL(connectionString);
} catch {
  console.error('Demo seed refused: DATABASE_URL_UNPOOLED is not a valid PostgreSQL URL.');
  process.exit(2);
}
if (!['postgres:', 'postgresql:'].includes(seedTarget.protocol)
  || seedTarget.hostname !== 'database'
  || seedTarget.pathname !== '/vetcare_demo') {
  console.error('Demo seed refused: it only writes to the vetcare_demo database in the local Compose network.');
  process.exit(2);
}

const passwordHash = await argon2.hash('VetCareDemo2026!', { type: argon2.argon2id });
const accounts = {
  owner: '10000000-0000-4000-8000-000000000001',
  clinic: '20000000-0000-4000-8000-000000000001',
  independent: '20000000-0000-4000-8000-000000000002',
};
const idFor = (group, number) => `${group}-0000-4000-8000-${String(number).padStart(12, '0')}`;
const providers = [
  { id: accounts.clinic, type: 'clinic', name: 'Clínica Vida Animal', email: 'demo.clinica@vetcare.local', address: 'Calle 63 # 11-24, Chapinero, Bogotá', phone: '6015550101' },
  { id: accounts.independent, type: 'independent', name: 'Dra. Camila Torres', email: 'demo.veterinaria@vetcare.local', address: null, phone: '3005550102' },
  { id: idFor('21000000', 3), type: 'clinic', name: 'Centro Veterinario Huellas', email: 'huellas@vetcare.local', address: 'Carrera 15 # 118-30, Usaquén, Bogotá', phone: '6015550103' },
  { id: idFor('21000000', 4), type: 'independent', name: 'Dr. Santiago Ruiz', email: 'santiago.ruiz@vetcare.local', address: null, phone: '3005550104' },
  { id: idFor('21000000', 5), type: 'clinic', name: 'Animal Care 24/7', email: 'animalcare@vetcare.local', address: 'Avenida 19 # 103-18, Bogotá', phone: '6015550105' },
  { id: idFor('21000000', 6), type: 'clinic', name: 'VetSalud Express', email: 'vetsalud@vetcare.local', address: 'Calle 26 # 52-40, Bogotá', phone: '6015550106' },
  { id: idFor('21000000', 7), type: 'independent', name: 'Dra. Laura Méndez', email: 'laura.mendez@vetcare.local', address: null, phone: '3005550107' },
  { id: idFor('21000000', 8), type: 'clinic', name: 'Patitas Felices', email: 'patitas@vetcare.local', address: 'Carrera 7 # 72-16, Bogotá', phone: '6015550108' },
];
const pets = [
  ['Luna', 'dog', 'Criolla', 4, 18.2, 48], ['Milo', 'cat', 'Atigrado', 2, 4.6, 27],
  ['Nala', 'dog', 'Labrador', 6, 24.1, 55], ['Simón', 'cat', 'Criollo', 1, 3.2, 24],
  ['Coco', 'dog', 'Poodle', 3, 7.8, 34], ['Mora', 'cat', 'Persa', 5, 4.9, 26],
  ['Rocky', 'dog', 'Beagle', 7, 15.4, 39], ['Kira', 'dog', 'Border collie', 2, 16.7, 46],
  ['Mía', 'cat', 'Siamés', 3, 3.8, 25], ['Toby', 'dog', 'Schnauzer', 9, 11.3, 36],
  ['Pelusa', 'cat', 'Angora', 8, 4.1, 28], ['Bruno', 'dog', 'Golden retriever', 1, 12.5, 42],
].map(([name, species, breed, age, weight, height], index) => ({ id: idFor('30000000', index + 1), name, species, breed, age, weight, height }));
const services = [
  ['Consulta veterinaria general', 85000, 'dog', 'both', 0], ['Vacunación felina', 70000, 'cat', 'clinic', 0],
  ['Consulta veterinaria a domicilio', 110000, 'dog', 'home', 1], ['Consulta preventiva felina', 78000, 'cat', 'clinic', 2],
  ['Valoración dental', 95000, 'dog', 'clinic', 2], ['Consulta a domicilio para gatos', 105000, 'cat', 'home', 3],
  ['Baño medicado para perros', 68000, 'dog', 'clinic', 4], ['Control de cachorro', 72000, 'dog', 'both', 5],
  ['Desparasitación felina', 42000, 'cat', 'clinic', 5], ['Consulta geriátrica', 98000, 'dog', 'home', 6],
  ['Chequeo anual felino', 82000, 'cat', 'clinic', 7], ['Limpieza dental veterinaria', 185000, 'dog', 'clinic', 2],
  ['Corte de uñas y revisión', 35000, 'cat', 'clinic', 0], ['Consulta dermatológica', 125000, 'dog', 'home', 3],
  ['Vacunación y refuerzo canino', 76000, 'dog', 'clinic', 4], ['Asesoría nutricional felina', 65000, 'cat', 'home', 6],
  ['Ecografía abdominal', 160000, 'dog', 'clinic', 5], ['Control de peso', 58000, 'cat', 'both', 7],
  ['Valoración de cachorro', 69000, 'dog', 'clinic', 0], ['Consulta de comportamiento', 115000, 'cat', 'home', 1],
  ['Revisión de oídos', 54000, 'dog', 'clinic', 2], ['Plan preventivo senior', 142000, 'cat', 'home', 3],
  ['Consulta de urgencia diurna', 135000, 'dog', 'clinic', 4], ['Chequeo preoperatorio', 120000, 'cat', 'clinic', 5],
];
const products = [
  ['Alimento digestivo', 128000, 'dog', 0], ['Kit de higiene dental', 49000, 'cat', 0],
  ['Juguete de enriquecimiento', 32000, 'dog', 1], ['Collar protector suave', 38000, 'cat', 0],
  ['Alimento para cachorro', 112000, 'dog', 2], ['Arena aglomerante', 56000, 'cat', 2],
  ['Arnés reflectivo', 67000, 'dog', 3], ['Rascador compacto', 89000, 'cat', 3],
  ['Shampoo piel sensible', 44000, 'dog', 4], ['Transportadora ventilada', 138000, 'cat', 4],
  ['Suplemento articular', 96000, 'dog', 5], ['Fuente de agua', 119000, 'cat', 5],
  ['Cama acolchada mediana', 105000, 'dog', 6], ['Cepillo quit pelo', 37000, 'cat', 6],
  ['Snack de entrenamiento', 29000, 'dog', 7], ['Ración húmeda premium', 18000, 'cat', 7],
  ['Correa de paseo', 52000, 'dog', 2], ['Kit de cuidado de patas', 41000, 'dog', 5],
  ['Juguete con catnip', 24000, 'cat', 1], ['Plato antideslizante', 33000, 'cat', 4],
];

const client = new pg.Client({ connectionString });
try {
  await client.connect();
  await client.query('BEGIN');
  const accountRows = [
    [accounts.owner, 'owner', 'Valentina Gómez', 'demo.dueno@vetcare.local'],
    ...providers.map(({ id, name, email }) => [id, 'provider', name, email]),
  ];
  for (const [id, type, name, email] of accountRows) {
    await client.query(
      `INSERT INTO account (id, account_type, name, email, password_hash)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, email = EXCLUDED.email,
         password_hash = EXCLUDED.password_hash`,
      [id, type, name, email, passwordHash],
    );
  }

  for (const { id, type, name, email, address, phone } of providers) {
    await client.query(
      `INSERT INTO provider_profile (provider_id, provider_type, public_name, contact_email, address, contact_phone)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (provider_id) DO UPDATE SET provider_type = EXCLUDED.provider_type,
         public_name = EXCLUDED.public_name, contact_email = EXCLUDED.contact_email,
         address = EXCLUDED.address, contact_phone = EXCLUDED.contact_phone, updated_at = now()`,
      [id, type, name, email, address, phone],
    );
    for (let weekday = 1; weekday <= 7; weekday += 1) {
      await client.query(
        `INSERT INTO working_hours (provider_id, weekday, start_hour, end_hour) VALUES ($1, $2, 8, 18)
         ON CONFLICT (provider_id, weekday) DO UPDATE SET start_hour = 8, end_hour = 18`,
        [id, weekday],
      );
    }
  }

  for (const { id, name, species, breed, age, weight, height } of pets) {
    await client.query(
      `INSERT INTO pet (id, owner_id, name, species, breed, age_years, weight_kg, height_cm, removed_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NULL)
       ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, species = EXCLUDED.species,
         breed = EXCLUDED.breed, age_years = EXCLUDED.age_years, weight_kg = EXCLUDED.weight_kg,
         height_cm = EXCLUDED.height_cm, removed_at = NULL`,
      [id, accounts.owner, name, species, breed, age, weight, height],
    );
  }

  const seededOfferings = [
    ...services.map(([name, price, species, modality, providerIndex], index) => ({
      id: idFor('42000000', index + 1), provider: providers[providerIndex], kind: 'service', name, price, species, modality, available: null,
    })),
    ...products.map(([name, price, species, providerIndex], index) => ({
      id: idFor('43000000', index + 1), provider: providers[providerIndex], kind: 'product', name, price, species, modality: null, available: index % 6 !== 5,
    })),
  ];
  // Retire the six IDs from the first demo seed so they do not duplicate the expanded catalog.
  await client.query(
    `UPDATE offering SET removed_at = now()
      WHERE id = ANY($1::uuid[]) AND removed_at IS NULL`,
    [Array.from({ length: 6 }, (_, index) => idFor('40000000', index + 1))],
  );
  for (const { id, provider, kind, name, price, species, modality, available } of seededOfferings) {
    await client.query(
      `INSERT INTO offering (id, provider_id, provider_type, kind, name, price_cop, species, modality, available, removed_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NULL)
       ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, price_cop = EXCLUDED.price_cop,
         species = EXCLUDED.species, modality = EXCLUDED.modality, available = EXCLUDED.available, removed_at = NULL`,
      [id, provider.id, provider.type, kind, name, price, species, modality, available],
    );
  }

  const startsAt = (hoursFromNow) => new Date(Math.ceil((Date.now() + hoursFromNow * 3_600_000) / 3_600_000) * 3_600_000);
  const appointmentRows = Array.from({ length: 18 }, (_, index) => {
    const service = services[index % services.length];
    const [name, , , serviceModality, providerIndex] = service;
    const provider = providers[providerIndex];
    const modality = serviceModality === 'home' || (serviceModality === 'both' && index % 2 === 1) ? 'home' : 'clinic';
    return {
      id: idFor('50000000', index + 1), pet: pets[index % pets.length],
      serviceId: seededOfferings.find((item) => item.kind === 'service' && item.name === name).id,
      provider, when: startsAt(index < 12 ? 48 + index * 24 : -120 + (index - 12) * 24),
      status: index < 12 ? 'scheduled' : 'cancelled', modality,
      cancelledAt: index < 12 ? null : startsAt(-168 + (index - 12) * 24),
      address: modality === 'home' ? `Carrera ${7 + index} # ${35 + index}-20, Bogotá` : null,
    };
  });
  for (const { id, pet, serviceId, provider, when, status, cancelledAt, modality, address } of appointmentRows) {
    await client.query(
      `INSERT INTO appointment (id, owner_id, pet_id, service_id, provider_id, provider_capacity, starts_at, modality, visit_address, status, cancelled_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       ON CONFLICT (id) DO UPDATE SET pet_id = EXCLUDED.pet_id, service_id = EXCLUDED.service_id,
         provider_id = EXCLUDED.provider_id, provider_capacity = EXCLUDED.provider_capacity,
         starts_at = EXCLUDED.starts_at, modality = EXCLUDED.modality, visit_address = EXCLUDED.visit_address,
         status = EXCLUDED.status, cancelled_at = EXCLUDED.cancelled_at`,
      [id, accounts.owner, pet.id, serviceId, provider.id, provider.type, when, modality, address, status, cancelledAt],
    );
  }

  const demoOrders = Array.from({ length: 12 }, (_, index) => {
    const product = seededOfferings.filter((item) => item.kind === 'product')[index % products.length];
    return {
      id: idFor('60000000', index + 1), product, quantity: (index % 3) + 1,
      status: ['confirmed', 'in_delivery', 'closed', 'cancelled'][index % 4],
    };
  });
  for (const [index, { id, product, quantity, status }] of demoOrders.entries()) {
    await client.query(
      `INSERT INTO product_order (id, owner_id, product_id, provider_id, quantity, unit_price_cop, delivery_address, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       ON CONFLICT (id) DO UPDATE SET product_id = EXCLUDED.product_id, provider_id = EXCLUDED.provider_id,
         quantity = EXCLUDED.quantity, unit_price_cop = EXCLUDED.unit_price_cop,
         delivery_address = EXCLUDED.delivery_address, status = EXCLUDED.status, status_changed_at = now()`,
      [id, accounts.owner, product.id, product.provider.id, quantity, product.price,
        `Calle ${42 + index} # ${12 + index}-30, Bogotá`, status],
    );
  }

  await client.query('COMMIT');
  console.log(`Demo data ready: ${providers.length} providers, ${pets.length} pets, ${services.length} services, ${products.length} products, ${appointmentRows.length} appointments and ${demoOrders.length} orders.`);
} catch (error) {
  await client.query('ROLLBACK').catch(() => {});
  console.error(`Demo seed failed: ${error.code ? `[${error.code}] ` : ''}${error.message}`);
  process.exitCode = 1;
} finally {
  await client.end().catch(() => {});
}
