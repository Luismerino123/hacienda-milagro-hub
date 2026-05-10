-- =====================================================================
-- MÓDULO 5: VENTAS Y FINANZAS
-- Tablas: clients, sales, expenses
-- =====================================================================

-- ----- Clientes -----
create table public.clients (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  telefono text,
  email text,
  direccion text,
  notas text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index clients_nombre_idx on public.clients(nombre);

create trigger clients_set_updated_at
before update on public.clients
for each row execute function public.set_updated_at();

alter table public.clients enable row level security;

create policy "Authenticated can view clients"
  on public.clients for select to authenticated using (true);
create policy "Authenticated can insert clients"
  on public.clients for insert to authenticated with check (true);
create policy "Authenticated can update clients"
  on public.clients for update to authenticated using (true) with check (true);
create policy "Authenticated can delete clients"
  on public.clients for delete to authenticated using (true);

-- ----- Ventas -----
create table public.sales (
  id uuid primary key default gen_random_uuid(),
  tipo text not null check (tipo in ('leche', 'ganado', 'otro')),
  fecha date not null default current_date,
  client_id uuid references public.clients(id) on delete set null,
  animal_id uuid references public.animals(id) on delete set null,    -- para ventas de ganado
  cantidad numeric,                                                    -- litros para leche, 1 para ganado
  unidad text,                                                         -- 'L', 'cabeza', 'kg', etc.
  precio_unitario numeric,
  total numeric not null check (total >= 0),
  descripcion text,
  notas text,
  registrado_por uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index sales_fecha_idx on public.sales(fecha desc);
create index sales_tipo_idx on public.sales(tipo);
create index sales_client_idx on public.sales(client_id);

create trigger sales_set_updated_at
before update on public.sales
for each row execute function public.set_updated_at();

alter table public.sales enable row level security;

create policy "Authenticated can view sales"
  on public.sales for select to authenticated using (true);
create policy "Authenticated can insert sales"
  on public.sales for insert to authenticated with check (true);
create policy "Authenticated can update sales"
  on public.sales for update to authenticated using (true) with check (true);
create policy "Authenticated can delete sales"
  on public.sales for delete to authenticated using (true);

-- ----- Egresos -----
create table public.expenses (
  id uuid primary key default gen_random_uuid(),
  categoria text not null check (categoria in (
    'alimento',
    'medicina',
    'servicio_vet',
    'mantenimiento',
    'salario',
    'transporte',
    'compra_animal',
    'otro'
  )),
  fecha date not null default current_date,
  monto numeric not null check (monto >= 0),
  descripcion text not null,
  proveedor text,
  notas text,
  registrado_por uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index expenses_fecha_idx on public.expenses(fecha desc);
create index expenses_categoria_idx on public.expenses(categoria);

create trigger expenses_set_updated_at
before update on public.expenses
for each row execute function public.set_updated_at();

alter table public.expenses enable row level security;

create policy "Authenticated can view expenses"
  on public.expenses for select to authenticated using (true);
create policy "Authenticated can insert expenses"
  on public.expenses for insert to authenticated with check (true);
create policy "Authenticated can update expenses"
  on public.expenses for update to authenticated using (true) with check (true);
create policy "Authenticated can delete expenses"
  on public.expenses for delete to authenticated using (true);

-- =====================================================================
-- SEED: clientes, ventas y egresos de ejemplo. Idempotente.
-- =====================================================================

do $$
declare
  has_data boolean;
  c1 uuid; c2 uuid; c3 uuid;
  d date;
begin
  select exists(select 1 from public.sales) into has_data;
  if has_data then return; end if;

  -- Clientes (insertar sin RETURNING porque son varios)
  insert into public.clients (nombre, telefono, email, direccion, notas)
  values
    ('Quesería La Esperanza', '+503 7777-1234', 'compras@laesperanza.sv',
     'Cantón San José, Chalatenango', 'Cliente principal de leche, recoge 3 veces por semana.'),
    ('Lácteos San Miguel', '+503 7654-9876', 'gerencia@sanmiguel.sv',
     'San Miguel', 'Compra leche fresca diaria. Pago semanal.'),
    ('Don Carlos Méndez', '+503 7012-3456', null,
     'Comunidad El Roble', 'Cliente vecino, compra para consumo familiar.');

  -- Recuperar los IDs por nombre
  select id into c1 from public.clients where nombre = 'Quesería La Esperanza' limit 1;
  select id into c2 from public.clients where nombre = 'Lácteos San Miguel' limit 1;
  select id into c3 from public.clients where nombre = 'Don Carlos Méndez' limit 1;

  -- Ventas de leche de los últimos 30 días
  for i in 0..29 loop
    d := current_date - i;
    if extract(dow from d) in (1, 3, 5) then
      insert into public.sales (tipo, fecha, client_id, cantidad, unidad, precio_unitario, total, descripcion)
      values ('leche', d, c1, 80 + floor(random() * 30), 'L', 0.85,
              round((80 + floor(random() * 30)) * 0.85, 2),
              'Entrega regular de leche');
    end if;
    if extract(dow from d) in (2, 4, 6) then
      insert into public.sales (tipo, fecha, client_id, cantidad, unidad, precio_unitario, total, descripcion)
      values ('leche', d, c2, 50 + floor(random() * 20), 'L', 0.80,
              round((50 + floor(random() * 20)) * 0.80, 2),
              'Entrega regular de leche');
    end if;
    if extract(dow from d) = 0 then
      insert into public.sales (tipo, fecha, client_id, cantidad, unidad, precio_unitario, total, descripcion)
      values ('leche', d, c3, 5 + floor(random() * 5), 'L', 1.00,
              round((5 + floor(random() * 5)) * 1.00, 2),
              'Venta directa al cliente');
    end if;
  end loop;

  -- Egresos típicos del último mes
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
