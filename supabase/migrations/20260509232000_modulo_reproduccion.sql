-- =====================================================================
-- MÓDULO 4: REPRODUCCIÓN
-- Tabla `reproduction_events` para celos, montas, inseminaciones,
-- confirmación de preñez, partos, abortos y destetes.
-- =====================================================================

create table public.reproduction_events (
  id uuid primary key default gen_random_uuid(),
  animal_id uuid not null references public.animals(id) on delete cascade,    -- la vaca/hembra

  tipo text not null check (tipo in (
    'celo',
    'monta',
    'inseminacion',
    'prenez_confirmada',
    'parto',
    'aborto',
    'destete'
  )),

  fecha date not null default current_date,
  fecha_estimada_parto date,                                                  -- en monta/inseminacion/prenez

  toro_id uuid references public.animals(id) on delete set null,              -- padre cuando se conoce
  ternero_id uuid references public.animals(id) on delete set null,           -- ternero nacido en parto

  notas text,
  veterinario text,
  costo numeric,

  registrado_por uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index reproduction_events_animal_idx on public.reproduction_events(animal_id);
create index reproduction_events_tipo_idx on public.reproduction_events(tipo);
create index reproduction_events_fecha_idx on public.reproduction_events(fecha desc);
create index reproduction_events_parto_idx on public.reproduction_events(fecha_estimada_parto)
  where fecha_estimada_parto is not null;

create trigger reproduction_events_set_updated_at
before update on public.reproduction_events
for each row execute function public.set_updated_at();

alter table public.reproduction_events enable row level security;

create policy "Authenticated can view reproduction"
  on public.reproduction_events for select to authenticated using (true);
create policy "Authenticated can insert reproduction"
  on public.reproduction_events for insert to authenticated with check (true);
create policy "Authenticated can update reproduction"
  on public.reproduction_events for update to authenticated using (true) with check (true);
create policy "Authenticated can delete reproduction"
  on public.reproduction_events for delete to authenticated using (true);

-- =====================================================================
-- SEED: eventos reproductivos de ejemplo. Idempotente.
-- =====================================================================

do $$
declare
  has_data boolean;
  toro_id uuid;
  margarita uuid;
  reina uuid;
  bonita uuid;
  princesa uuid;
  cafe uuid;
  estrella uuid;
  manchas uuid;
  negrita uuid;
begin
  select exists(select 1 from public.reproduction_events) into has_data;
  if has_data then return; end if;

  select id into toro_id from public.animals where tag_number = 'EM-011' limit 1;       -- Capitán
  select id into margarita from public.animals where tag_number = 'EM-002' limit 1;
  select id into reina from public.animals where tag_number = 'EM-005' limit 1;
  select id into bonita from public.animals where tag_number = 'EM-006' limit 1;
  select id into princesa from public.animals where tag_number = 'EM-009' limit 1;
  select id into cafe from public.animals where tag_number = 'EM-008' limit 1;
  select id into estrella from public.animals where tag_number = 'EM-003' limit 1;
  select id into manchas from public.animals where tag_number = 'EM-007' limit 1;
  select id into negrita from public.animals where tag_number = 'EM-010' limit 1;

  -- Bonita: monta hace 60 días, preñez confirmada hace 30 días, parto en ~7 meses
  if bonita is not null then
    insert into public.reproduction_events (animal_id, tipo, fecha, toro_id, fecha_estimada_parto, notas)
    values (bonita, 'monta', current_date - 60, toro_id, current_date - 60 + 283,
            'Monta natural con Capitán.');
    insert into public.reproduction_events (animal_id, tipo, fecha, fecha_estimada_parto, veterinario, notas)
    values (bonita, 'prenez_confirmada', current_date - 30, current_date - 60 + 283,
            'Dr. Hernández', 'Confirmada por palpación rectal.');
  end if;

  -- Princesa: preñada, próxima a parir (próximos 30 días)
  if princesa is not null then
    insert into public.reproduction_events (animal_id, tipo, fecha, toro_id, fecha_estimada_parto, notas)
    values (princesa, 'inseminacion', current_date - 260, toro_id, current_date + 23,
            'Inseminación artificial con genética premium.');
    insert into public.reproduction_events (animal_id, tipo, fecha, fecha_estimada_parto, veterinario, notas)
    values (princesa, 'prenez_confirmada', current_date - 220, current_date + 23,
            'Dr. Hernández', 'Preñez confirmada. Cuidados especiales últimas 6 semanas.');
  end if;

  -- Café: preñada, parto estimado en 90-120 días
  if cafe is not null then
    insert into public.reproduction_events (animal_id, tipo, fecha, toro_id, fecha_estimada_parto, notas)
    values (cafe, 'monta', current_date - 180, toro_id, current_date - 180 + 283,
            'Monta natural.');
    insert into public.reproduction_events (animal_id, tipo, fecha, fecha_estimada_parto, veterinario, notas)
    values (cafe, 'prenez_confirmada', current_date - 150, current_date - 180 + 283,
            'Dr. Hernández', 'Preñez confirmada.');
  end if;

  -- Margarita: parto reciente hace 45 días (Manchas como ternero)
  if margarita is not null then
    insert into public.reproduction_events (animal_id, tipo, fecha, toro_id, ternero_id, veterinario, notas)
    values (margarita, 'parto', current_date - 45, toro_id, manchas,
            'Dr. Hernández', 'Parto natural sin complicaciones. Ternero saludable.');
  end if;

  -- Reina: parto hace 90 días (Negrita como ternero)
  if reina is not null then
    insert into public.reproduction_events (animal_id, tipo, fecha, toro_id, ternero_id, veterinario, notas)
    values (reina, 'parto', current_date - 90, toro_id, negrita,
            'Dr. Hernández', 'Parto asistido. Madre y cría en buen estado.');
  end if;

  -- Estrella: celo detectado hace 5 días (lista para servicio)
  if estrella is not null then
    insert into public.reproduction_events (animal_id, tipo, fecha, notas)
    values (estrella, 'celo', current_date - 5,
            'Celo detectado en la mañana. Posible servicio en ventana siguiente.');
  end if;
end $$;
