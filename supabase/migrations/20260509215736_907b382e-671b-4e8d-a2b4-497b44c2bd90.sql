
create table public.animals (
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

create index animals_status_idx on public.animals(status);
create index animals_for_sale_idx on public.animals(for_sale);

-- updated_at trigger
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger animals_set_updated_at
before update on public.animals
for each row execute function public.set_updated_at();

alter table public.animals enable row level security;

create policy "Public can view animals for sale"
  on public.animals for select
  to anon
  using (for_sale = true and status = 'activo');

create policy "Authenticated can view all animals"
  on public.animals for select
  to authenticated
  using (true);

create policy "Authenticated can insert animals"
  on public.animals for insert
  to authenticated
  with check (true);

create policy "Authenticated can update animals"
  on public.animals for update
  to authenticated
  using (true) with check (true);

create policy "Authenticated can delete animals"
  on public.animals for delete
  to authenticated
  using (true);

-- Storage bucket
insert into storage.buckets (id, name, public)
values ('animal-photos', 'animal-photos', true)
on conflict (id) do nothing;

create policy "Public can read animal photos"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'animal-photos');

create policy "Authenticated can upload animal photos"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'animal-photos');

create policy "Authenticated can update animal photos"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'animal-photos');

create policy "Authenticated can delete animal photos"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'animal-photos');
