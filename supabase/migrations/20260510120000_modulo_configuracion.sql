-- =====================================================================
-- MÓDULO 7: CONFIGURACIÓN
-- Tabla `hacienda_settings` (singleton: una sola fila con id=1)
-- para guardar datos editables de la hacienda desde la UI.
-- =====================================================================

create table if not exists public.hacienda_settings (
  id integer primary key default 1 check (id = 1),
  nombre text not null default 'Hacienda El Milagrito',
  subtitulo text default 'Hacienda Ganadera',
  fundador text default 'Don Luis de Jesús Merino Guardado',
  ano_fundacion integer default 1978,
  descripcion text default 'Hacienda ganadera familiar comprometida con la tradición lechera y el bienestar animal.',
  telefono text default '+503 7000 0000',
  whatsapp text default '+50370000000',
  email text default 'contacto@elmilagrito.com',
  direccion text default 'Sonsonate, El Salvador',
  facebook_url text,
  instagram_url text,
  precio_leche_default numeric default 0.85,
  moneda text default 'USD',
  updated_at timestamptz not null default now()
);

drop trigger if exists hacienda_settings_set_updated_at on public.hacienda_settings;
create trigger hacienda_settings_set_updated_at
before update on public.hacienda_settings
for each row execute function public.set_updated_at();

alter table public.hacienda_settings enable row level security;

drop policy if exists "Anyone can view settings" on public.hacienda_settings;
create policy "Anyone can view settings" on public.hacienda_settings for select to anon, authenticated using (true);

drop policy if exists "Authenticated can update settings" on public.hacienda_settings;
create policy "Authenticated can update settings" on public.hacienda_settings for update to authenticated using (true) with check (true);

drop policy if exists "Authenticated can insert settings" on public.hacienda_settings;
create policy "Authenticated can insert settings" on public.hacienda_settings for insert to authenticated with check (true);

-- Insertar la fila singleton (idempotente)
insert into public.hacienda_settings (id) values (1) on conflict (id) do nothing;
