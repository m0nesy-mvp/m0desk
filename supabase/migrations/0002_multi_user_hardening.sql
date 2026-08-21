-- Multi-user integrity and atomic inbox conversion.
-- Apply after 0001_init.sql.

begin;

-- Repair any legacy cross-account references before enforcing the new rules.
update tasks t
set project_id = null
where project_id is not null
  and not exists (
    select 1 from projects p
    where p.id = t.project_id and p.user_id = t.user_id
  );

update knowledge k
set project_id = null
where project_id is not null
  and not exists (
    select 1 from projects p
    where p.id = k.project_id and p.user_id = k.user_id
  );

update library_items l
set project_id = null
where project_id is not null
  and not exists (
    select 1 from projects p
    where p.id = l.project_id and p.user_id = l.user_id
  );

-- Child rows may only reference a project owned by the same signed-in user.
drop policy if exists "tasks_own" on tasks;
create policy "tasks_own" on tasks
  for all
  using (auth.uid() = user_id)
  with check (
    auth.uid() = user_id
    and (
      project_id is null
      or exists (
        select 1 from projects p
        where p.id = tasks.project_id and p.user_id = tasks.user_id
      )
    )
  );

drop policy if exists "knowledge_own" on knowledge;
create policy "knowledge_own" on knowledge
  for all
  using (auth.uid() = user_id)
  with check (
    auth.uid() = user_id
    and (
      project_id is null
      or exists (
        select 1 from projects p
        where p.id = knowledge.project_id and p.user_id = knowledge.user_id
      )
    )
  );

drop policy if exists "library_items_own" on library_items;
create policy "library_items_own" on library_items
  for all
  using (auth.uid() = user_id)
  with check (
    auth.uid() = user_id
    and (
      project_id is null
      or exists (
        select 1 from projects p
        where p.id = library_items.project_id
          and p.user_id = library_items.user_id
      )
    )
  );

-- Keep the Settings view subject to the caller's RLS context.
create or replace view data_counts
with (security_invoker = true)
as
select
  auth.uid() as user_id,
  (select count(*) from projects) as projects,
  (select count(*) from tasks) as tasks,
  (select count(*) from knowledge) as knowledge,
  (select count(*) from library_items) as library,
  (select count(*) from inbox_items) as inbox;

-- Convert and mark the source item in one transaction. SECURITY INVOKER keeps
-- all table access subject to the caller's RLS policies.
create or replace function convert_inbox_item(
  p_item_id uuid,
  p_target text
)
returns uuid
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_item inbox_items%rowtype;
  v_created_id uuid;
begin
  if auth.uid() is null then
    raise exception 'Not signed in.';
  end if;

  select * into v_item
  from inbox_items
  where id = p_item_id and user_id = auth.uid()
  for update;

  if not found then
    raise exception 'Inbox item not found.';
  end if;

  if v_item.status = 'processed' then
    raise exception 'Already processed.';
  end if;

  case p_target
    when 'task' then
      insert into tasks (user_id, title)
      values (auth.uid(), btrim(v_item.content))
      returning id into v_created_id;
    when 'project' then
      insert into projects (user_id, title)
      values (auth.uid(), btrim(v_item.content))
      returning id into v_created_id;
    when 'knowledge' then
      insert into knowledge (user_id, title)
      values (auth.uid(), btrim(v_item.content))
      returning id into v_created_id;
    when 'library' then
      insert into library_items (user_id, title)
      values (auth.uid(), btrim(v_item.content))
      returning id into v_created_id;
    else
      raise exception 'Invalid conversion target.';
  end case;

  update inbox_items
  set status = 'processed'
  where id = p_item_id and user_id = auth.uid() and status = 'unprocessed';

  if not found then
    raise exception 'Inbox item was converted concurrently.';
  end if;

  return v_created_id;
end;
$$;

revoke all on function convert_inbox_item(uuid, text) from public;
grant execute on function convert_inbox_item(uuid, text) to authenticated;

-- One safe, RLS-aware search call. User input remains SQL data rather than
-- becoming part of PostgREST's raw filter grammar.
create or replace function search_all(
  p_query text,
  p_limit integer default 5
)
returns jsonb
language plpgsql
stable
security invoker
set search_path = public
as $$
declare
  v_query text := btrim(p_query);
  v_limit integer := greatest(1, least(coalesce(p_limit, 5), 50));
  v_pattern text;
begin
  if v_query = '' then
    return jsonb_build_object(
      'projects', '[]'::jsonb,
      'tasks', '[]'::jsonb,
      'knowledge', '[]'::jsonb,
      'library', '[]'::jsonb,
      'inbox', '[]'::jsonb
    );
  end if;

  v_pattern := '%' || replace(
    replace(replace(v_query, E'\\', E'\\\\'), '%', E'\\%'),
    '_', E'\\_'
  ) || '%';

  return jsonb_build_object(
    'projects', coalesce((
      select jsonb_agg(to_jsonb(row_data) order by row_data.updated_at desc)
      from (
        select * from projects
        where title ilike v_pattern escape E'\\'
          or description ilike v_pattern escape E'\\'
          or current_stage ilike v_pattern escape E'\\'
          or next_action ilike v_pattern escape E'\\'
        order by updated_at desc
        limit v_limit
      ) row_data
    ), '[]'::jsonb),
    'tasks', coalesce((
      select jsonb_agg(to_jsonb(row_data) order by row_data.updated_at desc)
      from (
        select * from tasks
        where title ilike v_pattern escape E'\\'
          or description ilike v_pattern escape E'\\'
        order by updated_at desc
        limit v_limit
      ) row_data
    ), '[]'::jsonb),
    'knowledge', coalesce((
      select jsonb_agg(to_jsonb(row_data) order by row_data.updated_at desc)
      from (
        select * from knowledge
        where title ilike v_pattern escape E'\\'
          or summary ilike v_pattern escape E'\\'
          or category ilike v_pattern escape E'\\'
          or v_query = any(tags)
        order by updated_at desc
        limit v_limit
      ) row_data
    ), '[]'::jsonb),
    'library', coalesce((
      select jsonb_agg(to_jsonb(row_data) order by row_data.updated_at desc)
      from (
        select * from library_items
        where title ilike v_pattern escape E'\\'
          or description ilike v_pattern escape E'\\'
          or url ilike v_pattern escape E'\\'
          or v_query = any(tags)
        order by updated_at desc
        limit v_limit
      ) row_data
    ), '[]'::jsonb),
    'inbox', coalesce((
      select jsonb_agg(to_jsonb(row_data) order by row_data.created_at desc)
      from (
        select * from inbox_items
        where content ilike v_pattern escape E'\\'
        order by created_at desc
        limit v_limit
      ) row_data
    ), '[]'::jsonb)
  );
end;
$$;

revoke all on function search_all(text, integer) from public;
grant execute on function search_all(text, integer) to authenticated;

commit;
