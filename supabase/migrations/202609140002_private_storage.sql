begin;
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values('study-documents','study-documents',false,26214400,array[
'application/pdf','application/vnd.openxmlformats-officedocument.wordprocessingml.document',
'application/vnd.openxmlformats-officedocument.presentationml.presentation','text/plain','text/markdown',
'image/png','image/jpeg','image/webp','image/gif'])
on conflict(id) do update set public=false,file_size_limit=excluded.file_size_limit,allowed_mime_types=excluded.allowed_mime_types;

-- Storage names are immutable: moves between brains only change the DB brain_id.
-- There is deliberately no UPDATE policy; uploads never use upsert.
create policy study_files_read on storage.objects for select to authenticated using (
 bucket_id='study-documents' and (storage.foldername(name))[1]=(select auth.uid())::text
 and exists(select 1 from public.documents d where d.storage_path=name and d.user_id=(select auth.uid()))
);
create policy study_files_insert on storage.objects for insert to authenticated with check (
 bucket_id='study-documents' and (storage.foldername(name))[1]=(select auth.uid())::text
 and exists(select 1 from public.documents d where d.storage_path=name and d.user_id=(select auth.uid()) and d.processing_status='uploading')
);
create policy study_files_delete on storage.objects for delete to authenticated using (
 bucket_id='study-documents' and (storage.foldername(name))[1]=(select auth.uid())::text
 and exists(select 1 from public.documents d where d.storage_path=name and d.user_id=(select auth.uid()) and d.processing_status in ('deleting','delete_failed','upload_failed'))
);
-- Block raw Data API deletion until the Storage API has removed the object.
-- Never delete storage.objects rows with SQL: that does not delete actual files.
create function public.require_storage_cleanup() returns trigger language plpgsql set search_path='' as $$
begin
 if exists(select 1 from storage.objects o where o.bucket_id='study-documents' and o.name=old.storage_path) then
  raise exception 'Remove the private storage object before deleting its metadata' using errcode='23514';
 end if;
 return old;
end; $$;
create trigger document_requires_storage_cleanup before delete on public.documents for each row execute function public.require_storage_cleanup();
commit;
