-- =====================================================================
-- SEED: 12 animales de ejemplo + 30 días de leche para las lecheras
-- Idempotente: se puede correr varias veces sin duplicar (on conflict).
-- =====================================================================

-- 1) Insertar los 12 animales base (sin genealogía todavía).
insert into public.animals (
  tag_number, name, breed, sex, color, birth_date,
  birth_weight_kg, current_weight_kg,
  purpose, status, location, photos, notes,
  for_sale, sale_price
) values
  ('EM-001', 'Lucero', 'Holstein', 'hembra', 'Blanco con manchas negras',
   '2022-04-12', 38, 580, 'lechera', 'activo', 'Potrero Norte',
   array['https://images.unsplash.com/photo-1546445317-29f4545e9d53?w=900'],
   'Mansa, excelente productora. Hija de Reina (línea Pardo Suizo materna).',
   false, null),

  ('EM-002', 'Margarita', 'Jersey', 'hembra', 'Café claro',
   '2021-08-23', 32, 420, 'lechera', 'activo', 'Establo Principal',
   array['https://images.unsplash.com/photo-1605545856843-3c0bd5b89df7?w=900'],
   'Leche de alta calidad, alto contenido de grasa. Apta para queso.',
   true, 1800),

  ('EM-003', 'Estrella', 'Holstein', 'hembra', 'Blanco con negro',
   '2023-01-15', 36, 510, 'lechera', 'activo', 'Potrero Norte',
   array['https://images.unsplash.com/photo-1500595046743-cd271d694d30?w=900'],
   'Joven, buen potencial productivo.',
   false, null),

  ('EM-004', 'Tornado', 'Brahman', 'macho', 'Gris claro',
   '2020-05-30', 42, 820, 'reproduccion', 'activo', 'Corral de Sementales',
   array['https://images.unsplash.com/photo-1518152006812-edab29b069ac?w=900'],
   'Reproductor de calidad, registrado. Excelente conformación.',
   true, 2500),

  ('EM-005', 'Reina', 'Pardo Suizo', 'hembra', 'Café oscuro',
   '2019-11-08', 35, 600, 'lechera', 'activo', 'Establo Principal',
   array['https://images.unsplash.com/photo-1546445317-29f4545e9d53?w=900'],
   'Vaca matriarca de la hacienda. Muy productiva, longeva.',
   false, null),

  ('EM-006', 'Bonita', 'Holstein', 'hembra', 'Blanco con manchas negras',
   '2022-07-19', 37, 550, 'lechera', 'activo', 'Potrero Sur',
   array['https://images.unsplash.com/photo-1605545856843-3c0bd5b89df7?w=900'],
   'Tranquila, fácil de ordeñar.',
   false, null),

  ('EM-007', 'Manchas', 'Jersey', 'hembra', 'Café con blanco',
   '2023-03-04', 30, 380, 'mixto', 'activo', 'Potrero Sur',
   array['https://images.unsplash.com/photo-1500595046743-cd271d694d30?w=900'],
   'Joven, sigue en desarrollo. Hija de Margarita y Capitán.',
   false, null),

  ('EM-008', 'Café', 'Pardo Suizo', 'hembra', 'Café medio',
   '2021-12-22', 34, 540, 'lechera', 'activo', 'Establo Principal',
   array['https://images.unsplash.com/photo-1518152006812-edab29b069ac?w=900'],
   'Buena productora, resistente al calor.',
   false, null),

  ('EM-009', 'Princesa', 'Holstein', 'hembra', 'Blanco con negro',
   '2022-09-10', 39, 565, 'lechera', 'activo', 'Potrero Norte',
   array['https://images.unsplash.com/photo-1546445317-29f4545e9d53?w=900'],
   'Genética premium. Documentos de pedigrí disponibles.',
   true, 2200),

  ('EM-010', 'Negrita', 'Jersey', 'hembra', 'Café muy oscuro',
   '2023-06-18', 31, 360, 'lechera', 'activo', 'Potrero Sur',
   array['https://images.unsplash.com/photo-1605545856843-3c0bd5b89df7?w=900'],
   'Joven prometedora. Hija de Reina y Capitán.',
   false, null),

  ('EM-011', 'Capitán', 'Brahman', 'macho', 'Gris medio',
   '2021-02-14', 41, 780, 'reproduccion', 'activo', 'Corral de Sementales',
   array['https://images.unsplash.com/photo-1518152006812-edab29b069ac?w=900'],
   'Semental joven con buena descendencia hasta el momento.',
   false, null),

  ('EM-012', 'Trueno', 'Holstein', 'macho', 'Negro con blanco',
   '2022-11-25', 40, 620, 'engorde', 'activo', 'Potrero de Engorde',
   array['https://images.unsplash.com/photo-1500595046743-cd271d694d30?w=900'],
   'Listo para engorde, peso ideal en 6-8 meses.',
   true, 950)
on conflict (tag_number) do nothing;

-- 2) Asignar genealogía (madre/padre) en una segunda pasada,
--    una vez que todos los animales ya existen.
update public.animals as a
   set mother_id = m.id
  from public.animals as m
 where a.tag_number = 'EM-007' and m.tag_number = 'EM-002'
   and a.mother_id is null;

update public.animals as a
   set father_id = f.id
  from public.animals as f
 where a.tag_number = 'EM-007' and f.tag_number = 'EM-011'
   and a.father_id is null;

update public.animals as a
   set mother_id = m.id
  from public.animals as m
 where a.tag_number = 'EM-010' and m.tag_number = 'EM-005'
   and a.mother_id is null;

update public.animals as a
   set father_id = f.id
  from public.animals as f
 where a.tag_number = 'EM-010' and f.tag_number = 'EM-011'
   and a.father_id is null;

update public.animals as a
   set mother_id = m.id
  from public.animals as m
 where a.tag_number = 'EM-001' and m.tag_number = 'EM-005'
   and a.mother_id is null;

-- 3) Generar 30 días de producción de leche para todas las hembras
--    lecheras activas que NO tengan registros aún. Mañana + tarde.
--    Los litros varían un poco por vaca y por día para que el gráfico
--    se vea realista.
do $$
declare
  v record;
  d date;
  base numeric;
begin
  for v in
    select a.id
      from public.animals a
     where a.purpose = 'lechera'
       and a.sex = 'hembra'
       and a.status = 'activo'
       and not exists (
         select 1 from public.milk_production mp where mp.animal_id = a.id
       )
  loop
    base := 10 + random() * 6;  -- entre 10 y 16 L/día base
    for i in 0..29 loop
      d := current_date - i;
      insert into public.milk_production (animal_id, fecha, turno, litros)
      values (
        v.id, d, 'mañana',
        round((base * 0.6 + (random() - 0.5) * 1.2)::numeric, 1)
      )
      on conflict do nothing;

      insert into public.milk_production (animal_id, fecha, turno, litros)
      values (
        v.id, d, 'tarde',
        round((base * 0.4 + (random() - 0.5) * 1.0)::numeric, 1)
      )
      on conflict do nothing;
    end loop;
  end loop;
end $$;
