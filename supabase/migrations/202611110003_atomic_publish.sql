-- Publish exactly the body reviewed in the requesting editor, even across admin tabs.
create function public.publish_report(p_submission uuid, p_markdown text) returns void
language plpgsql security definer set search_path='' as $$
declare current_status text;
begin
 if not public.is_admin() then raise exception 'Administrator required'; end if;
 if p_markdown is null or length(trim(p_markdown))=0 then raise exception 'Report required'; end if;
 if char_length(p_markdown)>100000 then raise exception 'Report exceeds 100000 characters'; end if;
 select status into current_status from public.submissions where id=p_submission for update;
 if current_status is null or current_status='draft' then raise exception 'Submitted survey required'; end if;
 insert into public.report_drafts(submission_id,markdown,updated_at) values(p_submission,p_markdown,now())
  on conflict(submission_id) do update set markdown=excluded.markdown,updated_at=now();
 insert into public.published_reports(submission_id,markdown) values(p_submission,p_markdown)
  on conflict(submission_id) do update set markdown=excluded.markdown,published_at=now();
 update public.submissions set status='published',updated_at=now() where id=p_submission;
end; $$;
revoke all on function public.publish_report(uuid,text) from public;
grant execute on function public.publish_report(uuid,text) to authenticated;

-- Retire the two-request legacy publishing path; cached clients must refresh.
create or replace function public.set_report_status(p_submission uuid,p_action text) returns void
language plpgsql security definer set search_path='' as $$
declare current_status text;
begin
 if not public.is_admin() then raise exception 'Administrator required'; end if;
 select status into current_status from public.submissions where id=p_submission for update;
 if current_status is null or current_status='draft' then raise exception 'Submitted survey required'; end if;
 if p_action not in ('unpublish','review') or p_action is null then
  raise exception 'Refresh the editor and use publish_report to publish the reviewed body';
 end if;
 delete from public.published_reports where submission_id=p_submission;
 update public.submissions set status='under_review',updated_at=now() where id=p_submission;
end; $$;
