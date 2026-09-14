-- NeuroNote Phase 3. No vector extensions or AI processing are installed.
-- gen_random_uuid() is built into the PostgreSQL version supplied by Supabase.
begin;
create type public.document_status as enum ('uploading','uploaded','upload_failed','deleting','delete_failed','queued','processing','complete','failed');
create type public.document_file_type as enum ('PDF','DOCX','PPTX','TXT','Markdown','Image','Pasted text');

create table public.profiles (
 id uuid primary key references auth.users(id) on delete restrict,
 display_name text not null default 'Student' check (char_length(display_name) between 1 and 80),
 avatar_url text,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);
create table public.brains (
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null references public.profiles(id) on delete restrict,
 name text not null check (char_length(btrim(name)) between 1 and 50),
 category text not null default 'Other' check (char_length(category) between 1 and 80),
 icon text not null default 'book' check (icon in ('leaf','atom','flask','globe','calculator','book')),
 description text not null default '' check (char_length(description) <= 220),
 tone text not null default 'lilac' check (tone in ('sage','sand','lilac','rose')),
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now(),
 unique(id,user_id)
);
create unique index brains_owner_name on public.brains(user_id,lower(btrim(name)));
create table public.documents (
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null references public.profiles(id) on delete restrict,
 brain_id uuid not null,
 original_filename text not null check (char_length(original_filename) between 1 and 255),
 display_name text not null check (char_length(btrim(display_name)) between 1 and 180),
 file_type public.document_file_type not null,
 mime_type text not null check (char_length(mime_type) between 1 and 150),
 file_size bigint not null check (file_size > 0 and file_size <= 26214400),
 storage_path text not null unique,
 page_count integer check (page_count > 0),
 processing_status public.document_status not null default 'uploading',
 processing_progress integer not null default 0 check (processing_progress between 0 and 100),
 processing_error text check (char_length(processing_error) <= 1000),
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now(),
 unique(id,user_id),
 foreign key (brain_id,user_id) references public.brains(id,user_id) on delete restrict,
 constraint documents_safe_path check (
   storage_path like user_id::text || '/' || id::text || '/%'
   and storage_path !~ '(^|/)\.\.?(/|$)' and storage_path !~ E'\\\\'
   and array_length(string_to_array(storage_path,'/'),1)=3
 )
);
create index documents_owner_brain on public.documents(user_id,brain_id,created_at desc);
create index documents_pending on public.documents(user_id,processing_status,updated_at);

-- Future tables contain structure only. Nothing generates their contents in Phase 3.
create table public.document_chunks (
 id uuid primary key default gen_random_uuid(), user_id uuid not null references public.profiles(id) on delete restrict,
 document_id uuid not null, ordinal integer not null check(ordinal>=0), content text not null,
 page_start integer check(page_start>0), page_end integer check(page_end>=page_start), token_count integer check(token_count>=0),
 created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
 unique(id,user_id), unique(document_id,ordinal),
 foreign key(document_id,user_id) references public.documents(id,user_id) on delete cascade
);
create table public.concepts (
 id uuid primary key default gen_random_uuid(), user_id uuid not null references public.profiles(id) on delete restrict,
 brain_id uuid not null, source_document_id uuid, name text not null, definition text not null default '',
 created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
 unique(id,user_id), unique(id,brain_id,user_id),
 foreign key(brain_id,user_id) references public.brains(id,user_id) on delete cascade,
 foreign key(source_document_id,user_id) references public.documents(id,user_id) on delete set null (source_document_id)
);
create table public.concept_connections (
 id uuid primary key default gen_random_uuid(), user_id uuid not null references public.profiles(id) on delete restrict,
 brain_id uuid not null, source_concept_id uuid not null, target_concept_id uuid not null,
 relationship text not null, strength numeric(4,3) not null default 1 check(strength between 0 and 1),
 created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
 check(source_concept_id<>target_concept_id), unique(source_concept_id,target_concept_id,relationship),
 foreign key(source_concept_id,brain_id,user_id) references public.concepts(id,brain_id,user_id) on delete cascade,
 foreign key(target_concept_id,brain_id,user_id) references public.concepts(id,brain_id,user_id) on delete cascade
);
create table public.notes (
 id uuid primary key default gen_random_uuid(), user_id uuid not null references public.profiles(id) on delete restrict,
 brain_id uuid not null, source_document_id uuid, title text not null, content jsonb not null default '{}'::jsonb,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
 unique(id,user_id),
 foreign key(brain_id,user_id) references public.brains(id,user_id) on delete cascade,
 foreign key(source_document_id,user_id) references public.documents(id,user_id) on delete set null (source_document_id)
);
create table public.flashcards (
 id uuid primary key default gen_random_uuid(), user_id uuid not null references public.profiles(id) on delete restrict,
 brain_id uuid not null, concept_id uuid, source_document_id uuid, front text not null, back text not null,
 due_at timestamptz, interval_days integer not null default 0 check(interval_days>=0),
 created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
 unique(id,user_id),
 foreign key(brain_id,user_id) references public.brains(id,user_id) on delete cascade,
 foreign key(concept_id,user_id) references public.concepts(id,user_id) on delete set null (concept_id),
 foreign key(source_document_id,user_id) references public.documents(id,user_id) on delete set null (source_document_id)
);
create table public.flashcard_reviews (
 id uuid primary key default gen_random_uuid(), user_id uuid not null references public.profiles(id) on delete restrict,
 flashcard_id uuid not null, rating smallint not null check(rating between 1 and 4), reviewed_at timestamptz not null default now(),
 created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
 foreign key(flashcard_id,user_id) references public.flashcards(id,user_id) on delete cascade
);
create table public.quizzes (
 id uuid primary key default gen_random_uuid(), user_id uuid not null references public.profiles(id) on delete restrict,
 brain_id uuid not null, source_document_id uuid, title text not null,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
 unique(id,user_id),
 foreign key(brain_id,user_id) references public.brains(id,user_id) on delete cascade,
 foreign key(source_document_id,user_id) references public.documents(id,user_id) on delete set null (source_document_id)
);
create table public.quiz_questions (
 id uuid primary key default gen_random_uuid(), user_id uuid not null references public.profiles(id) on delete restrict,
 quiz_id uuid not null, ordinal integer not null check(ordinal>=0), prompt text not null,
 question_type text not null check(question_type in ('multiple_choice','short_answer','true_false')),
 options jsonb not null default '[]'::jsonb, answer jsonb not null, explanation text not null default '',
 created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
 unique(quiz_id,ordinal),
 foreign key(quiz_id,user_id) references public.quizzes(id,user_id) on delete cascade
);
create table public.quiz_attempts (
 id uuid primary key default gen_random_uuid(), user_id uuid not null references public.profiles(id) on delete restrict,
 quiz_id uuid not null, answers jsonb not null default '{}'::jsonb, score numeric(5,2) check(score between 0 and 100), completed_at timestamptz,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
 foreign key(quiz_id,user_id) references public.quizzes(id,user_id) on delete cascade
);
create table public.mastery_records (
 id uuid primary key default gen_random_uuid(), user_id uuid not null references public.profiles(id) on delete restrict,
 concept_id uuid not null, score numeric(5,2) not null default 0 check(score between 0 and 100), evidence_count integer not null default 0 check(evidence_count>=0), last_reviewed_at timestamptz,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
 unique(user_id,concept_id),
 foreign key(concept_id,user_id) references public.concepts(id,user_id) on delete cascade
);

create function public.set_updated_at() returns trigger language plpgsql set search_path='' as $$
begin new.updated_at=now(); return new; end; $$;
create function public.protect_identity() returns trigger language plpgsql set search_path='' as $$
declare column_name text;
begin
 foreach column_name in array tg_argv loop
  if to_jsonb(new)->column_name is distinct from to_jsonb(old)->column_name then
    raise exception 'Resource identity is immutable' using errcode='23514';
  end if;
 end loop;
 return new;
end; $$;
-- Auth trigger is the only SECURITY DEFINER function; it cannot be called by clients.
create function public.handle_new_user() returns trigger language plpgsql security definer set search_path='' as $$
begin
 insert into public.profiles(id,display_name)
 values(new.id,coalesce(nullif(left(btrim(new.raw_user_meta_data->>'display_name'),80),''),'Student'))
 on conflict(id) do nothing;
 return new;
end; $$;
revoke all on function public.handle_new_user() from public,anon,authenticated;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();
-- Also support projects with existing auth users.
insert into public.profiles(id,display_name)
select id,coalesce(nullif(left(btrim(raw_user_meta_data->>'display_name'),80),''),'Student') from auth.users on conflict(id) do nothing;

-- Explicit ownership RLS for all thirteen tables. Foreign keys independently
-- enforce matching ownership on every cross-table reference.
do $$
declare table_name text; owner_column text;
begin
 foreach table_name in array array['profiles','brains','documents','document_chunks','concepts','concept_connections','notes','flashcards','flashcard_reviews','quizzes','quiz_questions','quiz_attempts','mastery_records'] loop
  owner_column=case when table_name='profiles' then 'id' else 'user_id' end;
  execute format('alter table public.%I enable row level security',table_name);
  execute format('grant select,insert,update,delete on public.%I to authenticated',table_name);
  execute format('revoke all on public.%I from anon',table_name);
  execute format('create policy owner_select on public.%I for select to authenticated using (%I=(select auth.uid()))',table_name,owner_column);
  execute format('create policy owner_insert on public.%I for insert to authenticated with check (%I=(select auth.uid()))',table_name,owner_column);
  execute format('create policy owner_update on public.%I for update to authenticated using (%I=(select auth.uid())) with check (%I=(select auth.uid()))',table_name,owner_column,owner_column);
  execute format('create policy owner_delete on public.%I for delete to authenticated using (%I=(select auth.uid()))',table_name,owner_column);
  execute format('create trigger touch_updated_at before update on public.%I for each row execute function public.set_updated_at()',table_name);
  execute format('create trigger immutable_identity before update on public.%I for each row execute function public.protect_identity(''id'',''%s'',''created_at'')',table_name,owner_column);
  if table_name<>'profiles' then execute format('create index %I on public.%I(user_id)',table_name||'_owner',table_name); end if;
 end loop;
end; $$;
create trigger immutable_document_path before update on public.documents for each row execute function public.protect_identity('storage_path','original_filename','file_type','mime_type','file_size');
commit;
