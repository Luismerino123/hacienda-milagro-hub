-- =====================================================================
-- MÓDULO 3: SALUD Y VETERINARIA
-- Tabla única `health_events` que cubre vacunas, enfermedades,
-- tratamientos, visitas del veterinario, desparasitaciones, lesiones,
-- y eventos genéricos. Para vacunas/desparasitaciones que requieren
-- refuerzo, se usa `proxima_fecha` para alertas.
-- =====================================================================

create table public.health_events (
  id uuid primary key default gen_random_uuid(),
  animal_id uuid not null references public.animals(id) on delete cascade,

  tipo text not null check (tipo in (
    'vacuna',
    'enfermedad',
    'tratamiento',
    'visita_vet',
    'desparasitacion',
    'lesion',
    'otro'
  )),

  fecha date not null default current_date,
  proxima_fecha date, -- vacunas/desparasitaciones con refuerzo programado

  titulo text not null,           -- "Aftosa", "Mastitis", "Visita rutinaria"
  descripcion text,
  medicamento text,
  dosis text,
  veterinario text,
  costo numeric,
  resuelto boolean not null default true, -- false = aún en curso (tratamiento, enfermedad)

  registrado_por uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index health_events_animal_idx on public.health_events(animal_id);
create index health_events_fecha_idx on public.health_events(fecha desc);
create index health_events_proxima_idx on public.health_events(proxima_fecha) where proxima_fecha is not null;
create index health_events_tipo_idx on public.health_events(tipo);

create trigger health_events_set_updated_at
before update on public.health_events
for each row execute function public.set_updated_at();

alter table public.health_events enable row level security;

create policy "Authenticated can view health events"
  on public.health_events for select to authenticated using (true);
create policy "Authenticated can insert health events"
  on public.health_events for insert to authenticated with check (true);
create policy "Authenticated can update health events"
  on public.health_events for update to authenticated using (true) with check (true);
create policy "Authenticated can delete health events"
  on public.health_events for delete to authenticated using (true);

-- =====================================================================
-- SEED: eventos médicos de ejemplo para los animales que sembramos.
-- Solo corre si la tabla está vacía (idempotente).
-- =====================================================================

do $$
declare
  has_data boolean;
begin
  select exists(select 1 from public.health_events) into has_data;
  if has_data then return; end if;

  -- Vacunas de aftosa (a todos los activos), refuerzo en 6 meses
  insert into public.health_events (animal_id, tipo, fecha, proxima_fecha, titulo, descripcion, medicamento, dosis, veterinario, costo)
  select id, 'vacuna', current_date - 60, current_date + 120,
         'Vacuna contra fiebre aftosa',
         'Aplicación obligatoria del programa nacional sanitario.',
         'Vacuna Aftosa Bivalente', '5 ml subcutánea',
         'Dr. Hernández', 8
    from public.animals where status = 'activo';

  -- Desparasitación interna a todos hace 45 días, próxima en 4 meses
  insert into public.health_events (animal_id, tipo, fecha, proxima_fecha, titulo, descripcion, medicamento, dosis, veterinario, costo)
  select id, 'desparasitacion', current_date - 45, current_date + 75,
         'Desparasitación interna',
         'Tratamiento preventivo trimestral.',
         'Ivermectina 1%', '1 ml por 50 kg',
         'Dr. Hernández', 5
    from public.animals where status = 'activo';

  -- Visita rutinaria del veterinario hace 2 semanas
  insert into public.health_events (animal_id, tipo, fecha, titulo, descripcion, veterinario, costo)
  select id, 'visita_vet', current_date - 14,
         'Revisión general',
         'Estado corporal y reproductivo evaluado, sin novedad.',
         'Dr. Hernández', 0
    from public.animals where status = 'activo';

  -- Mastitis tratada en Reina (EM-005), ya resuelta hace 30 días
  insert into public.health_events (animal_id, tipo, fecha, titulo, descripcion, medicamento, dosis, veterinario, costo, resuelto)
  select id, 'enfermedad', current_date - 30,
         'Mastitis subclínica',
         'Detectada en ordeño matutino. Tratamiento aplicado y resuelta.',
         'Mastiplan LC', '1 jeringa intramamaria por 3 días',
         'Dr. Hernández', 25, true
    from public.animals where tag_number = 'EM-005';

  -- Tratamiento en curso para Café (EM-008): cojera leve
  insert into public.health_events (animal_id, tipo, fecha, titulo, descripcion, medicamento, dosis, veterinario, costo, resuelto)
  select id, 'tratamiento', current_date - 4,
         'Cojera pata trasera derecha',
         'Inflamación leve, en observación. Aplicación de antiinflamatorio.',
         'Flunixin Meglumine', '2.2 mg/kg IM',
         'Dr. Hernández', 12, false
    from public.animals where tag_number = 'EM-008';

  -- Vacuna brucelosis (solo hembras), refuerzo en 12 meses
  insert into public.health_events (animal_id, tipo, fecha, proxima_fecha, titulo, descripcion, medicamento, dosis, veterinario, costo)
  select id, 'vacuna', current_date - 90, current_date + 275,
         'Vacuna contra brucelosis',
         'Aplicación a hembras según programa sanitario.',
         'Cepa RB-51', '2 ml subcutánea',
         'Dr. Hernández', 6
    from public.animals where status = 'activo' and sex = 'hembra';
end $$;
