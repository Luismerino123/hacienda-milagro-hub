
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

drop policy "Public can read animal photos" on storage.objects;
create policy "Authenticated can list animal photos"
  on storage.objects for select
  to authenticated
  using (bucket_id = 'animal-photos');
