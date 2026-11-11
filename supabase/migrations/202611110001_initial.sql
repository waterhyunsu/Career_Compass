-- Run with migration owner, never from the browser.
create schema if not exists private;
revoke all on schema private from public;
create table private.admins (user_id uuid primary key references auth.users(id) on delete cascade);
create function public.is_admin() returns boolean language sql stable security definer set search_path='' as $$
 select exists(select 1 from private.admins where user_id=auth.uid());
$$;
revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated;

create table public.profiles (
 id uuid primary key references auth.users(id) on delete cascade,
 nickname text not null default '탐험가' check(char_length(nickname) between 1 and 30),
 is_test boolean not null default false,
 created_at timestamptz not null default now()
);
create function private.new_profile() returns trigger language plpgsql security definer set search_path='' as $$
begin insert into public.profiles(id) values(new.id); return new; end; $$;
create trigger on_auth_user_created after insert on auth.users for each row execute function private.new_profile();

create table public.survey_versions (
 id text primary key, title text not null, approved boolean not null default false,
 questions jsonb not null check(jsonb_typeof(questions)='array'), created_at timestamptz not null default now()
);
create table public.submissions (
 id uuid primary key default gen_random_uuid(), user_id uuid not null references public.profiles(id) on delete cascade,
 version_id text not null references public.survey_versions(id), answers jsonb not null default '{}',
 status text not null default 'draft' check(status in ('draft','submitted','under_review','published')),
 submitted_at timestamptz, updated_at timestamptz not null default now(), unique(user_id,version_id)
);
create table public.schools (id text primary key, name text not null, details jsonb not null);
create table public.departments (id text primary key,school_id text not null references public.schools(id) on delete cascade,name text not null,details jsonb not null,unique(id,school_id));
create table public.favorites (
 user_id uuid not null references public.profiles(id) on delete cascade,
 school_id text not null references public.schools(id) on delete cascade,
 department_id text, note text not null default '' check(char_length(note)<=2000),
 target_id text generated always as (coalesce(department_id,'')) stored,
 primary key(user_id,school_id,target_id),
 foreign key(department_id,school_id) references public.departments(id,school_id) on delete cascade
);
-- Separate tables prevent draft content leakage through select columns or published=false edits.
create table public.report_drafts (
 submission_id uuid primary key references public.submissions(id) on delete cascade,
 markdown text not null check(char_length(markdown)<=100000), updated_at timestamptz not null default now()
);
create table public.published_reports (
 submission_id uuid primary key references public.submissions(id) on delete cascade,
 markdown text not null, published_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.survey_versions enable row level security;
alter table public.submissions enable row level security;
alter table public.schools enable row level security;
alter table public.departments enable row level security;
alter table public.favorites enable row level security;
alter table public.report_drafts enable row level security;
alter table public.published_reports enable row level security;
create policy own_profile on public.profiles for select to authenticated using(id=auth.uid() or public.is_admin());
create policy versions_read on public.survey_versions for select to authenticated using(true);
create policy submissions_read on public.submissions for select to authenticated using(user_id=auth.uid() or public.is_admin());
create policy schools_read on public.schools for select to anon,authenticated using(true);
create policy departments_read on public.departments for select to anon,authenticated using(true);
create policy favorites_read on public.favorites for select to authenticated using(user_id=auth.uid() or public.is_admin());
create policy favorites_insert on public.favorites for insert to authenticated with check(user_id=auth.uid());
create policy favorites_update on public.favorites for update to authenticated using(user_id=auth.uid()) with check(user_id=auth.uid());
create policy favorites_delete on public.favorites for delete to authenticated using(user_id=auth.uid());
create policy draft_admin on public.report_drafts for all to authenticated using(public.is_admin()) with check(public.is_admin());
create policy published_read on public.published_reports for select to authenticated using(public.is_admin() or exists(select 1 from public.submissions s where s.id=submission_id and s.user_id=auth.uid()));

-- Supabase projects may grant default privileges on newly created public tables.
-- Reset only this application's tables before granting the minimal API contract.
revoke all on public.profiles,public.survey_versions,public.submissions,public.schools,public.departments,public.favorites,public.report_drafts,public.published_reports from anon,authenticated;
grant usage on schema public to anon,authenticated;
grant select on public.schools,public.departments to anon,authenticated;
grant select on public.profiles,public.survey_versions,public.submissions,public.favorites,public.report_drafts,public.published_reports to authenticated;
grant insert,update,delete on public.favorites to authenticated;
grant insert,update on public.report_drafts to authenticated;
-- No direct write grants to submissions, profiles, published_reports, survey_versions.

create function private.freeze_version() returns trigger language plpgsql set search_path='' as $$
begin
 if exists(select 1 from public.submissions where version_id=old.id) then raise exception 'A used survey version is immutable; create a new version'; end if;
 if tg_op='DELETE' then return old; end if; return new;
end; $$;
create trigger immutable_version before update or delete on public.survey_versions for each row execute function private.freeze_version();

create function private.validate_answers(qs jsonb, a jsonb, final boolean) returns void language plpgsql set search_path='' as $$
declare q jsonb; k text; v jsonb;
begin
 if jsonb_typeof(a) is distinct from 'object' then raise exception 'Answers must be an object'; end if;
 if (select count(*) from jsonb_array_elements(qs) item where item->>'kind'='scale')<>50 or
    (select count(*) from jsonb_array_elements(qs) item where item->>'kind'='text')<>5 or
    (select count(distinct item->>'id') from jsonb_array_elements(qs) item)<>55 then raise exception 'Invalid survey definition'; end if;
 for k,v in select * from jsonb_each(a) loop
  select value into q from jsonb_array_elements(qs) where value->>'id'=k;
  if q is null then raise exception 'Unknown question %',k; end if;
  if q->>'kind'='scale' and v not in ('1'::jsonb,'2'::jsonb,'3'::jsonb,'4'::jsonb,'5'::jsonb,'"unknown"'::jsonb) then raise exception 'Invalid scale answer %',k; end if;
  if q->>'kind'='text' and (jsonb_typeof(v)<>'string' or char_length(v#>>'{}')>5000) then raise exception 'Invalid text answer %',k; end if;
 end loop;
 if final and exists(select 1 from jsonb_array_elements(qs) item where item->>'kind'='scale' and not (a ? (item->>'id'))) then raise exception '50 scale answers required'; end if;
end; $$;

create function public.save_survey(p_version text,p_answers jsonb,p_submit boolean default false) returns public.submissions
language plpgsql security definer set search_path='' as $$
declare ver public.survey_versions; result public.submissions; tester boolean;
begin
 if auth.uid() is null then raise exception 'Authentication required'; end if;
 -- Lock version against concurrent edits before first response.
 select * into ver from public.survey_versions where id=p_version for share;
 if not found then raise exception 'Unknown version'; end if;
 select is_test into tester from public.profiles where id=auth.uid();
 if p_submit and not ver.approved and not coalesce(tester,false) then raise exception 'Survey approval pending'; end if;
 perform private.validate_answers(ver.questions,p_answers,p_submit);
 insert into public.submissions(user_id,version_id,answers,status,submitted_at)
 values(auth.uid(),p_version,p_answers,case when p_submit then 'submitted' else 'draft' end,case when p_submit then now() end)
 on conflict(user_id,version_id) do update set answers=excluded.answers,status=excluded.status,submitted_at=excluded.submitted_at,updated_at=now()
 where submissions.status='draft' returning * into result;
 if result.id is null then
  select * into result from public.submissions where user_id=auth.uid() and version_id=p_version;
  -- Idempotent repeat only: a network retry cannot replace final answers.
  if p_submit and result.answers=p_answers then return result; end if;
  raise exception 'Submitted answers are locked';
 end if;
 return result;
end; $$;

create function public.set_report_status(p_submission uuid,p_action text) returns void
language plpgsql security definer set search_path='' as $$
declare body text; current_status text;
begin
 if not public.is_admin() then raise exception 'Administrator required'; end if;
 select status into current_status from public.submissions where id=p_submission for update;
 if current_status is null or current_status='draft' then raise exception 'Submitted survey required'; end if;
 if p_action='publish' then
  select markdown into body from public.report_drafts where submission_id=p_submission;
  if body is null or length(trim(body))=0 then raise exception 'Report required'; end if;
  insert into public.published_reports(submission_id,markdown) values(p_submission,body)
   on conflict(submission_id) do update set markdown=excluded.markdown,published_at=now();
  update public.submissions set status='published',updated_at=now() where id=p_submission;
 elsif p_action in ('unpublish','review') then
  delete from public.published_reports where submission_id=p_submission;
  update public.submissions set status='under_review',updated_at=now() where id=p_submission;
 else raise exception 'Invalid action'; end if;
end; $$;
create function public.delete_test_data(p_user uuid) returns void language plpgsql security definer set search_path='' as $$
begin
 if not public.is_admin() then raise exception 'Administrator required'; end if;
 if not exists(select 1 from public.profiles where id=p_user and is_test) then raise exception 'Only test data can be deleted'; end if;
 delete from public.submissions where user_id=p_user;
 delete from public.favorites where user_id=p_user;
end; $$;
revoke all on function public.save_survey(text,jsonb,boolean),public.set_report_status(uuid,text),public.delete_test_data(uuid) from public;
grant execute on function public.save_survey(text,jsonb,boolean),public.set_report_status(uuid,text),public.delete_test_data(uuid) to authenticated;
