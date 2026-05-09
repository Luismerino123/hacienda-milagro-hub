create table public.milk_production (
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

create index milk_production_fecha_idx on public.milk_production(fecha desc);
create index milk_production_animal_idx on public.milk_production(animal_id);

alter table public.milk_production enable row level security;

create policy "Authenticated can view milk"
  on public.milk_production for select to authenticated using (true);
create policy "Authenticated can insert milk"
  on public.milk_production for insert to authenticated with check (true);
create policy "Authenticated can update milk"
  on public.milk_production for update to authenticated using (true) with check (true);
create policy "Authenticated can delete milk"
  on public.milk_production for delete to authenticated using (true);

do $$
declare
  v record;
  d date;
  base numeric;
begin
  for v in select id from public.animals where purpose = 'lechera' and sex = 'hembra' and status = 'activo' loop
    base := 10 + random() * 6;
    for i in 0..29 loop
      d := current_date - i;
      insert into public.milk_production (animal_id, fecha, turno, litros)
      values (v.id, d, 'mañana', round((base * 0.6 + (random()-0.5)*1.2)::numeric, 1))
      on conflict do nothing;
      insert into public.milk_production (animal_id, fecha, turno, litros)
      values (v.id, d, 'tarde', round((base * 0.4 + (random()-0.5)*1.0)::numeric, 1))
      on conflict do nothing;
    end loop;
  end loop;
end $$;