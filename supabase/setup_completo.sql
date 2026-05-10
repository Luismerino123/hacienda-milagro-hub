-- =====================================================================
-- HACIENDA EL MILAGRITO — Setup completo (idempotente, sin bugs)
-- Pegá TODO esto en el SQL Editor de Supabase y dale Run.
-- Se puede correr varias veces sin romperse.
-- =====================================================================

-- ----- Función global de updated_at -----
create or replace function public.set_updated_at()
returns trigger language plpgsql
security invoker
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- =====================================================================
-- TABLA: animals
-- =====================================================================
create table if not exists public.animals (
  id uuid primary key default gen_random_uuid(),
  tag_number text unique not null,
  name text,
  breed text not null,
  sex text not null check (sex in ('hembra','macho')),
  color text,
  birth_date date not null,
  birth_weight_kg numeric,
  current_weight_kg numeric,
  mother_id uuid references public.animals(id) on delete set null,
  father_id uuid references public.animals(id) on delete set null,
  purpose text check (purpose in ('lechera','engorde','reproduccion','mixto')),
  status text not null default 'activo' check (status in ('activo','vendido','fallecido','en_tratamiento')),
  location text,
  photos text[] not null default '{}',
  notes text,
  for_sale boolean not null default false,
  sale_price numeric,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists animals_status_idx on public.animals(status);
create index if not exists animals_for_sale_idx on public.animals(for_sale);

drop trigger if exists animals_set_updated_at on public.animals;
create trigger animals_set_updated_at
before update on public.animals
for each row execute function public.set_updated_at();

alter table public.animals enable row level security;

drop policy if exists "Public can view animals for sale" on public.animals;
create policy "Public can view animals for sale" on public.animals for select to anon
  using (for_sale = true and status = 'activo');

drop policy if exists "Authenticated can view all animals" on public.animals;
create policy "Authenticated can view all animals" on public.animals for select to authenticated using (true);

drop policy if exists "Authenticated can insert animals" on public.animals;
create policy "Authenticated can insert animals" on public.animals for insert to authenticated with check (true);

drop policy if exists "Authenticated can update animals" on public.animals;
create policy "Authenticated can update animals" on public.animals for update to authenticated using (true) with check (true);

drop policy if exists "Authenticated can delete animals" on public.animals;
create policy "Authenticated can delete animals" on public.animals for delete to authenticated using (true);

-- Storage bucket para fotos
insert into storage.buckets (id, name, public)
values ('animal-photos', 'animal-photos', true)
on conflict (id) do nothing;

drop policy if exists "Public can read animal photos" on storage.objects;
drop policy if exists "Authenticated can list animal photos" on storage.objects;
drop policy if exists "Anyone can read animal photos" on storage.objects;
create policy "Anyone can read animal photos"
  on storage.objects for select to anon, authenticated using (bucket_id = 'animal-photos');

drop policy if exists "Authenticated can upload animal photos" on storage.objects;
create policy "Authenticated can upload animal photos"
  on storage.objects for insert to authenticated with check (bucket_id = 'animal-photos');

drop policy if exists "Authenticated can update animal photos" on storage.objects;
create policy "Authenticated can update animal photos"
  on storage.objects for update to authenticated using (bucket_id = 'animal-photos');

drop policy if exists "Authenticated can delete animal photos" on storage.objects;
create policy "Authenticated can delete animal photos"
  on storage.objects for delete to authenticated using (bucket_id = 'animal-photos');

-- =====================================================================
-- TABLA: milk_production
-- =====================================================================
create table if not exists public.milk_production (
  id uuid primary key default gen_random_uuid(),
  animal_id uuid not null references public.animals(id) on delete cascade,
  fecha date not null default current_date,
  turno text not null check (turno in ('mañana','tarde')),
  litros numeric(5,2) not null check (litros >= 0),
  notas text,
  registrado_por uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  unique (animal_id, fecha, turno)
);

create index if not exists milk_production_fecha_idx on public.milk_production(fecha desc);
create index if not exists milk_production_animal_idx on public.milk_production(animal_id);

alter table public.milk_production enable row level security;

drop policy if exists "Authenticated can view milk" on public.milk_production;
create policy "Authenticated can view milk" on public.milk_production for select to authenticated using (true);
drop policy if exists "Authenticated can insert milk" on public.milk_production;
create policy "Authenticated can insert milk" on public.milk_production for insert to authenticated with check (true);
drop policy if exists "Authenticated can update milk" on public.milk_production;
create policy "Authenticated can update milk" on public.milk_production for update to authenticated using (true) with check (true);
drop policy if exists "Authenticated can delete milk" on public.milk_production;
create policy "Authenticated can delete milk" on public.milk_production for delete to authenticated using (true);

-- =====================================================================
-- TABLA: health_events
-- =====================================================================
create table if not exists public.health_events (
  id uuid primary key default gen_random_uuid(),
  animal_id uuid not null references public.animals(id) on delete cascade,
  tipo text not null check (tipo in ('vacuna','enfermedad','tratamiento','visita_vet','desparasitacion','lesion','otro')),
  fecha date not null default current_date,
  proxima_fecha date,
  titulo text not null,
  descripcion text,
  medicamento text,
  dosis text,
  veterinario text,
  costo numeric,
  resuelto boolean not null default true,
  registrado_por uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists health_events_animal_idx on public.health_events(animal_id);
create index if not exists health_events_fecha_idx on public.health_events(fecha desc);
create index if not exists health_events_proxima_idx on public.health_events(proxima_fecha) where proxima_fecha is not null;
create index if not exists health_events_tipo_idx on public.health_events(tipo);

drop trigger if exists health_events_set_updated_at on public.health_events;
create trigger health_events_set_updated_at
before update on public.health_events
for each row execute function public.set_updated_at();

alter table public.health_events enable row level security;

drop policy if exists "Authenticated can view health events" on public.health_events;
create policy "Authenticated can view health events" on public.health_events for select to authenticated using (true);
drop policy if exists "Authenticated can insert health events" on public.health_events;
create policy "Authenticated can insert health events" on public.health_events for insert to authenticated with check (true);
drop policy if exists "Authenticated can update health events" on public.health_events;
create policy "Authenticated can update health events" on public.health_events for update to authenticated using (true) with check (true);
drop policy if exists "Authenticated can delete health events" on public.health_events;
create policy "Authenticated can delete health events" on public.health_events for delete to authenticated using (true);

-- =====================================================================
-- TABLA: reproduction_events
-- =====================================================================
create table if not exists public.reproduction_events (
  id uuid primary key default gen_random_uuid(),
  animal_id uuid not null references public.animals(id) on delete cascade,
  tipo text not null check (tipo in ('celo','monta','inseminacion','prenez_confirmada','parto','aborto','destete')),
  fecha date not null default current_date,
  fecha_estimada_parto date,
  toro_id uuid references public.animals(id) on delete set null,
  ternero_id uuid references public.animals(id) on delete set null,
  notas text,
  veterinario text,
  costo numeric,
  registrado_por uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists reproduction_events_animal_idx on public.reproduction_events(animal_id);
create index if not exists reproduction_events_tipo_idx on public.reproduction_events(tipo);
create index if not exists reproduction_events_fecha_idx on public.reproduction_events(fecha desc);
create index if not exists reproduction_events_parto_idx on public.reproduction_events(fecha_estimada_parto) where fecha_estimada_parto is not null;

drop trigger if exists reproduction_events_set_updated_at on public.reproduction_events;
create trigger reproduction_events_set_updated_at
before update on public.reproduction_events
for each row execute function public.set_updated_at();

alter table public.reproduction_events enable row level security;

drop policy if exists "Authenticated can view reproduction" on public.reproduction_events;
create policy "Authenticated can view reproduction" on public.reproduction_events for select to authenticated using (true);
drop policy if exists "Authenticated can insert reproduction" on public.reproduction_events;
create policy "Authenticated can insert reproduction" on public.reproduction_events for insert to authenticated with check (true);
drop policy if exists "Authenticated can update reproduction" on public.reproduction_events;
create policy "Authenticated can update reproduction" on public.reproduction_events for update to authenticated using (true) with check (true);
drop policy if exists "Authenticated can delete reproduction" on public.reproduction_events;
create policy "Authenticated can delete reproduction" on public.reproduction_events for delete to authenticated using (true);

-- =====================================================================
-- TABLA: clients
-- =====================================================================
create table if not exists public.clients (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  telefono text,
  email text,
  direccion text,
  notas text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists clients_nombre_uidx on public.clients(nombre);

drop trigger if exists clients_set_updated_at on public.clients;
create trigger clients_set_updated_at
before update on public.clients
for each row execute function public.set_updated_at();

alter table public.clients enable row level security;

drop policy if exists "Authenticated can view clients" on public.clients;
create policy "Authenticated can view clients" on public.clients for select to authenticated using (true);
drop policy if exists "Authenticated can insert clients" on public.clients;
create policy "Authenticated can insert clients" on public.clients for insert to authenticated with check (true);
drop policy if exists "Authenticated can update clients" on public.clients;
create policy "Authenticated can update clients" on public.clients for update to authenticated using (true) with check (true);
drop policy if exists "Authenticated can delete clients" on public.clients;
create policy "Authenticated can delete clients" on public.clients for delete to authenticated using (true);

-- =====================================================================
-- TABLA: sales
-- =====================================================================
create table if not exists public.sales (
  id uuid primary key default gen_random_uuid(),
  tipo text not null check (tipo in ('leche','ganado','otro')),
  fecha date not null default current_date,
  client_id uuid references public.clients(id) on delete set null,
  animal_id uuid references public.animals(id) on delete set null,
  cantidad numeric,
  unidad text,
  precio_unitario numeric,
  total numeric not null check (total >= 0),
  descripcion text,
  notas text,
  registrado_por uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists sales_fecha_idx on public.sales(fecha desc);
create index if not exists sales_tipo_idx on public.sales(tipo);
create index if not exists sales_client_idx on public.sales(client_id);

drop trigger if exists sales_set_updated_at on public.sales;
create trigger sales_set_updated_at
before update on public.sales
for each row execute function public.set_updated_at();

alter table public.sales enable row level security;

drop policy if exists "Authenticated can view sales" on public.sales;
create policy "Authenticated can view sales" on public.sales for select to authenticated using (true);
drop policy if exists "Authenticated can insert sales" on public.sales;
create policy "Authenticated can insert sales" on public.sales for insert to authenticated with check (true);
drop policy if exists "Authenticated can update sales" on public.sales;
create policy "Authenticated can update sales" on public.sales for update to authenticated using (true) with check (true);
drop policy if exists "Authenticated can delete sales" on public.sales;
create policy "Authenticated can delete sales" on public.sales for delete to authenticated using (true);

-- =====================================================================
-- TABLA: expenses
-- =====================================================================
create table if not exists public.expenses (
  id uuid primary key default gen_random_uuid(),
  categoria text not null check (categoria in ('alimento','medicina','servicio_vet','mantenimiento','salario','transporte','compra_animal','otro')),
  fecha date not null default current_date,
  monto numeric not null check (monto >= 0),
  descripcion text not null,
  proveedor text,
  notas text,
  registrado_por uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists expenses_fecha_idx on public.expenses(fecha desc);
create index if not exists expenses_categoria_idx on public.expenses(categoria);

drop trigger if exists expenses_set_updated_at on public.expenses;
create trigger expenses_set_updated_at
before update on public.expenses
for each row execute function public.set_updated_at();

alter table public.expenses enable row level security;

drop policy if exists "Authenticated can view expenses" on public.expenses;
create policy "Authenticated can view expenses" on public.expenses for select to authenticated using (true);
drop policy if exists "Authenticated can insert expenses" on public.expenses;
create policy "Authenticated can insert expenses" on public.expenses for insert to authenticated with check (true);
drop policy if exists "Authenticated can update expenses" on public.expenses;
create policy "Authenticated can update expenses" on public.expenses for update to authenticated using (true) with check (true);
drop policy if exists "Authenticated can delete expenses" on public.expenses;
create policy "Authenticated can delete expenses" on public.expenses for delete to authenticated using (true);

-- =====================================================================
-- SEED: 12 animales + genealogía
-- =====================================================================
insert into public.animals (
  tag_number, name, breed, sex, color, birth_date,
  birth_weight_kg, current_weight_kg,
  purpose, status, location, photos, notes,
  for_sale, sale_price
) values
  ('EM-001', 'Lucero', 'Holstein', 'hembra', 'Blanco con manchas negras',
   '2022-04-12', 38, 580, 'lechera', 'activo', 'Potrero Norte',
   array['https://images.unsplash.com/photo-1546445317-29f4545e9d53?w=900'],
   'Mansa, excelente productora.', false, null),
  ('EM-002', 'Margarita', 'Jersey', 'hembra', 'Café claro',
   '2021-08-23', 32, 420, 'lechera', 'activo', 'Establo Principal',
   array['https://images.unsplash.com/photo-1605545856843-3c0bd5b89df7?w=900'],
   'Leche de alta calidad. Apta para queso.', true, 1800),
  ('EM-003', 'Estrella', 'Holstein', 'hembra', 'Blanco con negro',
   '2023-01-15', 36, 510, 'lechera', 'activo', 'Potrero Norte',
   array['https://images.unsplash.com/photo-1500595046743-cd271d694d30?w=900'],
   'Joven, buen potencial productivo.', false, null),
  ('EM-004', 'Tornado', 'Brahman', 'macho', 'Gris claro',
   '2020-05-30', 42, 820, 'reproduccion', 'activo', 'Corral de Sementales',
   array['https://images.unsplash.com/photo-1518152006812-edab29b069ac?w=900'],
   'Reproductor de calidad, registrado.', true, 2500),
  ('EM-005', 'Reina', 'Pardo Suizo', 'hembra', 'Café oscuro',
   '2019-11-08', 35, 600, 'lechera', 'activo', 'Establo Principal',
   array['https://images.unsplash.com/photo-1546445317-29f4545e9d53?w=900'],
   'Vaca matriarca de la hacienda.', false, null),
  ('EM-006', 'Bonita', 'Holstein', 'hembra', 'Blanco con manchas negras',
   '2022-07-19', 37, 550, 'lechera', 'activo', 'Potrero Sur',
   array['https://images.unsplash.com/photo-1605545856843-3c0bd5b89df7?w=900'],
   'Tranquila, fácil de ordeñar.', false, null),
  ('EM-007', 'Manchas', 'Jersey', 'hembra', 'Café con blanco',
   '2023-03-04', 30, 380, 'mixto', 'activo', 'Potrero Sur',
   array['https://images.unsplash.com/photo-1500595046743-cd271d694d30?w=900'],
   'Joven, sigue en desarrollo.', false, null),
  ('EM-008', 'Café', 'Pardo Suizo', 'hembra', 'Café medio',
   '2021-12-22', 34, 540, 'lechera', 'activo', 'Establo Principal',
   array['https://images.unsplash.com/photo-1518152006812-edab29b069ac?w=900'],
   'Buena productora, resistente al calor.', false, null),
  ('EM-009', 'Princesa', 'Holstein', 'hembra', 'Blanco con negro',
   '2022-09-10', 39, 565, 'lechera', 'activo', 'Potrero Norte',
   array['https://images.unsplash.com/photo-1546445317-29f4545e9d53?w=900'],
   'Genética premium.', true, 2200),
  ('EM-010', 'Negrita', 'Jersey', 'hembra', 'Café muy oscuro',
   '2023-06-18', 31, 360, 'lechera', 'activo', 'Potrero Sur',
   array['https://images.unsplash.com/photo-1605545856843-3c0bd5b89df7?w=900'],
   'Joven prometedora.', false, null),
  ('EM-011', 'Capitán', 'Brahman', 'macho', 'Gris medio',
   '2021-02-14', 41, 780, 'reproduccion', 'activo', 'Corral de Sementales',
   array['https://images.unsplash.com/photo-1518152006812-edab29b069ac?w=900'],
   'Semental joven con buena descendencia.', false, null),
  ('EM-012', 'Trueno', 'Holstein', 'macho', 'Negro con blanco',
   '2022-11-25', 40, 620, 'engorde', 'activo', 'Potrero de Engorde',
   array['https://images.unsplash.com/photo-1500595046743-cd271d694d30?w=900'],
   'Listo para engorde.', true, 950)
on conflict (tag_number) do nothing;

-- Genealogía
update public.animals as a set mother_id = m.id from public.animals as m
 where a.tag_number = 'EM-007' and m.tag_number = 'EM-002' and a.mother_id is null;
update public.animals as a set father_id = f.id from public.animals as f
 where a.tag_number = 'EM-007' and f.tag_number = 'EM-011' and a.father_id is null;
update public.animals as a set mother_id = m.id from public.animals as m
 where a.tag_number = 'EM-010' and m.tag_number = 'EM-005' and a.mother_id is null;
update public.animals as a set father_id = f.id from public.animals as f
 where a.tag_number = 'EM-010' and f.tag_number = 'EM-011' and a.father_id is null;
update public.animals as a set mother_id = m.id from public.animals as m
 where a.tag_number = 'EM-001' and m.tag_number = 'EM-005' and a.mother_id is null;

-- =====================================================================
-- SEED: 30 días de leche para hembras lecheras activas
-- =====================================================================
do $$
declare
  v record;
  d date;
  base numeric;
begin
  for v in
    select a.id from public.animals a
     where a.purpose = 'lechera' and a.sex = 'hembra' and a.status = 'activo'
       and not exists (select 1 from public.milk_production mp where mp.animal_id = a.id)
  loop
    base := 10 + random() * 6;
    for i in 0..29 loop
      d := current_date - i;
      insert into public.milk_production (animal_id, fecha, turno, litros)
      values (v.id, d, 'mañana', round((base * 0.6 + (random() - 0.5) * 1.2)::numeric, 1))
      on conflict do nothing;
      insert into public.milk_production (animal_id, fecha, turno, litros)
      values (v.id, d, 'tarde', round((base * 0.4 + (random() - 0.5) * 1.0)::numeric, 1))
      on conflict do nothing;
    end loop;
  end loop;
end $$;

-- =====================================================================
-- SEED: eventos médicos
-- =====================================================================
do $$
declare has_data boolean;
begin
  select exists(select 1 from public.health_events) into has_data;
  if has_data then return; end if;

  insert into public.health_events (animal_id, tipo, fecha, proxima_fecha, titulo, descripcion, medicamento, dosis, veterinario, costo)
  select id, 'vacuna', current_date - 60, current_date + 120,
         'Vacuna contra fiebre aftosa', 'Aplicación obligatoria del programa nacional sanitario.',
         'Vacuna Aftosa Bivalente', '5 ml subcutánea', 'Dr. Hernández', 8
    from public.animals where status = 'activo';

  insert into public.health_events (animal_id, tipo, fecha, proxima_fecha, titulo, descripcion, medicamento, dosis, veterinario, costo)
  select id, 'desparasitacion', current_date - 45, current_date + 75,
         'Desparasitación interna', 'Tratamiento preventivo trimestral.',
         'Ivermectina 1%', '1 ml por 50 kg', 'Dr. Hernández', 5
    from public.animals where status = 'activo';

  insert into public.health_events (animal_id, tipo, fecha, titulo, descripcion, veterinario, costo)
  select id, 'visita_vet', current_date - 14,
         'Revisión general', 'Estado corporal y reproductivo evaluado, sin novedad.',
         'Dr. Hernández', 0
    from public.animals where status = 'activo';

  insert into public.health_events (animal_id, tipo, fecha, titulo, descripcion, medicamento, dosis, veterinario, costo, resuelto)
  select id, 'enfermedad', current_date - 30,
         'Mastitis subclínica', 'Detectada en ordeño matutino. Tratamiento aplicado y resuelta.',
         'Mastiplan LC', '1 jeringa intramamaria por 3 días', 'Dr. Hernández', 25, true
    from public.animals where tag_number = 'EM-005';

  insert into public.health_events (animal_id, tipo, fecha, titulo, descripcion, medicamento, dosis, veterinario, costo, resuelto)
  select id, 'tratamiento', current_date - 4,
         'Cojera pata trasera derecha', 'Inflamación leve, en observación.',
         'Flunixin Meglumine', '2.2 mg/kg IM', 'Dr. Hernández', 12, false
    from public.animals where tag_number = 'EM-008';

  insert into public.health_events (animal_id, tipo, fecha, proxima_fecha, titulo, descripcion, medicamento, dosis, veterinario, costo)
  select id, 'vacuna', current_date - 90, current_date + 275,
         'Vacuna contra brucelosis', 'Aplicación a hembras según programa sanitario.',
         'Cepa RB-51', '2 ml subcutánea', 'Dr. Hernández', 6
    from public.animals where status = 'activo' and sex = 'hembra';
end $$;

-- =====================================================================
-- SEED: eventos reproductivos
-- =====================================================================
do $$
declare
  has_data boolean;
  toro_id uuid; margarita uuid; reina uuid; bonita uuid;
  princesa uuid; cafe uuid; estrella uuid; manchas uuid; negrita uuid;
begin
  select exists(select 1 from public.reproduction_events) into has_data;
  if has_data then return; end if;

  select id into toro_id from public.animals where tag_number = 'EM-011' limit 1;
  select id into margarita from public.animals where tag_number = 'EM-002' limit 1;
  select id into reina from public.animals where tag_number = 'EM-005' limit 1;
  select id into bonita from public.animals where tag_number = 'EM-006' limit 1;
  select id into princesa from public.animals where tag_number = 'EM-009' limit 1;
  select id into cafe from public.animals where tag_number = 'EM-008' limit 1;
  select id into estrella from public.animals where tag_number = 'EM-003' limit 1;
  select id into manchas from public.animals where tag_number = 'EM-007' limit 1;
  select id into negrita from public.animals where tag_number = 'EM-010' limit 1;

  if bonita is not null then
    insert into public.reproduction_events (animal_id, tipo, fecha, toro_id, fecha_estimada_parto, notas)
    values (bonita, 'monta', current_date - 60, toro_id, current_date - 60 + 283, 'Monta natural con Capitán.');
    insert into public.reproduction_events (animal_id, tipo, fecha, fecha_estimada_parto, veterinario, notas)
    values (bonita, 'prenez_confirmada', current_date - 30, current_date - 60 + 283, 'Dr. Hernández', 'Confirmada por palpación.');
  end if;

  if princesa is not null then
    insert into public.reproduction_events (animal_id, tipo, fecha, toro_id, fecha_estimada_parto, notas)
    values (princesa, 'inseminacion', current_date - 260, toro_id, current_date + 23, 'Inseminación con genética premium.');
    insert into public.reproduction_events (animal_id, tipo, fecha, fecha_estimada_parto, veterinario, notas)
    values (princesa, 'prenez_confirmada', current_date - 220, current_date + 23, 'Dr. Hernández', 'Cuidados especiales últimas 6 semanas.');
  end if;

  if cafe is not null then
    insert into public.reproduction_events (animal_id, tipo, fecha, toro_id, fecha_estimada_parto, notas)
    values (cafe, 'monta', current_date - 180, toro_id, current_date - 180 + 283, 'Monta natural.');
    insert into public.reproduction_events (animal_id, tipo, fecha, fecha_estimada_parto, veterinario, notas)
    values (cafe, 'prenez_confirmada', current_date - 150, current_date - 180 + 283, 'Dr. Hernández', 'Preñez confirmada.');
  end if;

  if margarita is not null then
    insert into public.reproduction_events (animal_id, tipo, fecha, toro_id, ternero_id, veterinario, notas)
    values (margarita, 'parto', current_date - 45, toro_id, manchas, 'Dr. Hernández', 'Parto natural sin complicaciones.');
  end if;

  if reina is not null then
    insert into public.reproduction_events (animal_id, tipo, fecha, toro_id, ternero_id, veterinario, notas)
    values (reina, 'parto', current_date - 90, toro_id, negrita, 'Dr. Hernández', 'Parto asistido. Madre y cría bien.');
  end if;

  if estrella is not null then
    insert into public.reproduction_events (animal_id, tipo, fecha, notas)
    values (estrella, 'celo', current_date - 5, 'Celo detectado. Posible servicio próximo.');
  end if;
end $$;

-- =====================================================================
-- SEED: clientes, ventas y egresos (FIX: sin RETURNING multi-row)
-- =====================================================================
do $$
declare
  has_data boolean;
  c1 uuid; c2 uuid; c3 uuid;
  d date;
begin
  select exists(select 1 from public.sales) into has_data;
  if has_data then return; end if;

  insert into public.clients (nombre, telefono, email, direccion, notas)
  values
    ('Quesería La Esperanza', '+503 7777-1234', 'compras@laesperanza.sv',
     'Cantón San José, Chalatenango', 'Cliente principal de leche, recoge 3 veces por semana.'),
    ('Lácteos San Miguel', '+503 7654-9876', 'gerencia@sanmiguel.sv',
     'San Miguel', 'Compra leche fresca diaria. Pago semanal.'),
    ('Don Carlos Méndez', '+503 7012-3456', null,
     'Comunidad El Roble', 'Cliente vecino, compra para consumo familiar.')
  on conflict (nombre) do nothing;

  select id into c1 from public.clients where nombre = 'Quesería La Esperanza' limit 1;
  select id into c2 from public.clients where nombre = 'Lácteos San Miguel' limit 1;
  select id into c3 from public.clients where nombre = 'Don Carlos Méndez' limit 1;

  for i in 0..29 loop
    d := current_date - i;
    if extract(dow from d) in (1, 3, 5) then
      insert into public.sales (tipo, fecha, client_id, cantidad, unidad, precio_unitario, total, descripcion)
      values ('leche', d, c1, 80 + floor(random() * 30), 'L', 0.85,
              round(((80 + floor(random() * 30)) * 0.85)::numeric, 2), 'Entrega regular de leche');
    end if;
    if extract(dow from d) in (2, 4, 6) then
      insert into public.sales (tipo, fecha, client_id, cantidad, unidad, precio_unitario, total, descripcion)
      values ('leche', d, c2, 50 + floor(random() * 20), 'L', 0.80,
              round(((50 + floor(random() * 20)) * 0.80)::numeric, 2), 'Entrega regular de leche');
    end if;
    if extract(dow from d) = 0 then
      insert into public.sales (tipo, fecha, client_id, cantidad, unidad, precio_unitario, total, descripcion)
      values ('leche', d, c3, 5 + floor(random() * 5), 'L', 1.00,
              round(((5 + floor(random() * 5)) * 1.00)::numeric, 2), 'Venta directa al cliente');
    end if;
  end loop;

  insert into public.expenses (categoria, fecha, monto, descripcion, proveedor)
  values
    ('alimento', current_date - 25, 320, 'Concentrado para vacas lecheras (5 quintales)', 'Agroservicio El Campo'),
    ('alimento', current_date - 12, 280, 'Sales minerales y melaza', 'Agroservicio El Campo'),
    ('medicina', current_date - 30, 95, 'Vacunas aftosa y brucelosis', 'Veterinaria Central'),
    ('medicina', current_date - 8, 45, 'Antiinflamatorios y antibióticos', 'Veterinaria Central'),
    ('servicio_vet', current_date - 14, 120, 'Visita rutinaria del veterinario', 'Dr. Hernández'),
    ('mantenimiento', current_date - 20, 75, 'Reparación de cerca eléctrica', 'Maestro Jorge'),
    ('salario', current_date - 5, 350, 'Pago quincenal a trabajadores', null),
    ('transporte', current_date - 7, 60, 'Combustible para entregas', null),
    ('alimento', current_date - 2, 180, 'Heno y forraje complementario', 'Hacienda San Luis');
end $$;

-- =====================================================================
-- VERIFICACIÓN: cuántas filas quedaron en cada tabla
-- =====================================================================
select 'animals' as tabla, count(*) from public.animals
union all select 'milk_production', count(*) from public.milk_production
union all select 'health_events', count(*) from public.health_events
union all select 'reproduction_events', count(*) from public.reproduction_events
union all select 'clients', count(*) from public.clients
union all select 'sales', count(*) from public.sales
union all select 'expenses', count(*) from public.expenses;
