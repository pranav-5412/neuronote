begin;
alter table public.documents
 add column processing_run_id uuid,
 add column processing_started_at timestamptz,
 add column extracted_pages jsonb not null default '[]' check(jsonb_typeof(extracted_pages)='array'),
 add column extracted_character_count integer not null default 0 check(extracted_character_count between 0 and 2000000),
 add column chunk_count integer not null default 0 check(chunk_count between 0 and 1500),
 add column extracted_at timestamptz,
 add column extraction_version text,
 add column extraction_warnings jsonb not null default '[]';
alter table public.document_chunks
 add column section_title text,
 add column heading_path text[] not null default '{}',
 add column character_count integer not null default 0 check(character_count>=0);
update public.document_chunks set character_count=char_length(content);
-- Avoid escape-string ambiguity when migrations are applied through SQL editors.
alter table public.documents drop constraint documents_safe_path;
alter table public.documents add constraint documents_safe_path check (
 split_part(storage_path,'/',1)=user_id::text
 and split_part(storage_path,'/',2)=id::text
 and split_part(storage_path,'/',3) not in ('','.','..')
 and array_length(string_to_array(storage_path,'/'),1)=3
 and strpos(storage_path,chr(92))=0
);

-- One transaction replaces the old generation. RLS and the current lease apply
-- to every statement; an error rolls back both deletion and partial insertion.
create function public.complete_document_extraction(
 p_document_id uuid, p_run_id uuid, p_pages jsonb, p_chunks jsonb,
 p_version text, p_warnings jsonb
) returns void language plpgsql security invoker set search_path = '' as $$
declare
 doc public.documents;
 item jsonb;
 n integer;
 characters integer;
begin
 select * into doc from public.documents where id=p_document_id and user_id=auth.uid() for update;
 if not found or doc.processing_run_id is distinct from p_run_id
 or doc.processing_status <> 'saving' or doc.processing_started_at is null
 or doc.processing_started_at < now()-interval '120 seconds' then
   raise exception 'Extraction lease is no longer active';
 end if;
 if doc.file_type not in ('PDF','TXT','Markdown','Pasted text')
 or jsonb_typeof(p_pages) is distinct from 'array'
 or jsonb_typeof(p_chunks) is distinct from 'array' then
   raise exception 'Invalid extraction payload';
 end if;
 n := jsonb_array_length(p_pages);
 if n < 1 or n > 300 or jsonb_array_length(p_chunks) not between 1 and 1500
 or (doc.file_type <> 'PDF' and n <> 1) then raise exception 'Extraction limit exceeded'; end if;
 for item in select value from jsonb_array_elements(p_pages) loop
   if jsonb_typeof(item->'text') is distinct from 'string' then raise exception 'Invalid page text'; end if;
 end loop;
 if exists(select 1 from jsonb_array_elements(p_pages) with ordinality p(value,ord)
   where (doc.file_type='PDF' and (value->>'pageNumber')::integer is distinct from ord::integer)
   or (doc.file_type<>'PDF' and value->>'pageNumber' is not null)) then raise exception 'Invalid source pages'; end if;
 select sum(char_length(value->>'text')) into characters from jsonb_array_elements(p_pages);
 if characters not between 1 and 2000000 then raise exception 'Text limit exceeded'; end if;
 delete from public.document_chunks where document_id=doc.id and user_id=auth.uid();
 for item in select value from jsonb_array_elements(p_chunks) loop
   if coalesce(char_length(btrim(item->>'content')),0)=0
   or (item->>'ordinal')::integer is null
   or (item->>'token_count')::integer not between 1 and 700
   or (doc.file_type='PDF' and ((item->>'page_start')::integer is null or (item->>'page_end')::integer is null
       or (item->>'page_start')::integer < 1 or (item->>'page_end')::integer > n
       or (item->>'page_end')::integer < (item->>'page_start')::integer))
   or (doc.file_type<>'PDF' and (item->>'page_start' is not null or item->>'page_end' is not null)) then
     raise exception 'Invalid chunk metadata';
   end if;
   insert into public.document_chunks(user_id,document_id,ordinal,content,page_start,page_end,token_count,section_title,heading_path,character_count)
   values(auth.uid(),doc.id,(item->>'ordinal')::integer,item->>'content',
     (item->>'page_start')::integer,(item->>'page_end')::integer,(item->>'token_count')::integer,
     item->>'section_title',array(select jsonb_array_elements_text(item->'heading_path')),char_length(item->>'content'));
 end loop;
 if (select max(ordinal) from public.document_chunks where document_id=doc.id) <> jsonb_array_length(p_chunks)-1 then
   raise exception 'Chunk order must be contiguous';
 end if;
 update public.documents set extracted_pages=p_pages,extracted_character_count=characters,
   page_count=case when file_type='PDF' then n else null end,
   chunk_count=jsonb_array_length(p_chunks),extracted_at=now(),extraction_version=p_version,
   extraction_warnings=p_warnings,processing_status='complete',processing_progress=100,
   processing_error=null,processing_run_id=null,processing_started_at=null where id=doc.id;
end;
$$;
revoke all on function public.complete_document_extraction(uuid,uuid,jsonb,jsonb,text,jsonb) from public, anon;
grant execute on function public.complete_document_extraction(uuid,uuid,jsonb,jsonb,text,jsonb) to authenticated;
commit;
