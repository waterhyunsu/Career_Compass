// Real PostgreSQL semantics in PGlite. Supabase auth.uid is emulated; hosted JWT tests are separate.
import { PGlite } from "@electric-sql/pglite";
import { readFile, readdir } from "node:fs/promises";
import assert from "node:assert/strict";
const db = new PGlite();
await db.exec(
  `create role anon; create role authenticated; alter default privileges in schema public grant all on tables to anon,authenticated; create schema auth; create table auth.users(id uuid primary key); create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$; grant usage on schema auth to authenticated; grant execute on function auth.uid() to authenticated;`,
);
for (const file of (
  await readdir(new URL("../supabase/migrations/", import.meta.url))
)
  .filter((f) => f.endsWith(".sql"))
  .sort()) {
  await db.exec(
    await readFile(
      new URL("../supabase/migrations/" + file, import.meta.url),
      "utf8",
    ),
  );
}
assert.equal(
  (
    await db.query(
      "select count(*)::int n from public.survey_versions where id='approved-2026-11-11-v2' and approved and jsonb_array_length(questions)=55",
    )
  ).rows[0].n,
  1,
  "approved questionnaire must come from migrations before seed",
);
await db.exec(
  await readFile(new URL("../supabase/seed.sql", import.meta.url), "utf8"),
);
assert.equal(
  (await db.query("select count(*)::int n from public.schools")).rows[0].n,
  11,
);
assert.equal(
  (await db.query("select count(*)::int n from public.departments")).rows[0].n,
  22,
);
await db.exec("set role anon");
assert.equal((await db.query("select * from public.schools")).rows.length, 11);
await assert.rejects(
  () => db.query("select * from public.submissions"),
  /permission denied/,
);
await db.exec("reset role");
const ids = [
  "00000000-0000-0000-0000-000000000001",
  "00000000-0000-0000-0000-000000000002",
  "00000000-0000-0000-0000-000000000003",
];
for (const id of ids) await db.query("insert into auth.users values($1)", [id]);
await db.query("insert into private.admins values($1)", [ids[2]]);
await db.query(
  "update public.profiles set is_test=true,nickname=$2 where id=$1",
  [ids[0], "test"],
);
const questions = [
  ...Array.from({ length: 50 }, (_, i) => ({ id: "q" + i, kind: "scale" })),
  ...Array.from({ length: 5 }, (_, i) => ({ id: "t" + i, kind: "text" })),
];
await db.query(
  "insert into public.survey_versions(id,title,questions) values($1,$2,$3)",
  ["draft", "test", JSON.stringify(questions)],
);
const answers = Object.fromEntries(
  questions.filter((q) => q.kind === "scale").map((q) => [q.id, 1]),
);
answers.q0 = "unknown";
async function asUser(id, fn) {
  await db.exec("set role authenticated");
  await db.query("select set_config('request.jwt.claim.sub',$1,false)", [id]);
  try {
    return await fn();
  } finally {
    await db.exec("reset role");
  }
}
async function rejected(fn, message) {
  await assert.rejects(fn, message);
}
await asUser(ids[1], async () => {
  await rejected(
    () =>
      db.query("select public.save_survey('draft',$1,true)", [
        JSON.stringify(answers),
      ]),
    /approval pending/,
  );
  await rejected(
    () =>
      db.query("select public.save_survey('draft',$1,false)", [
        JSON.stringify({ q0: 0 }),
      ]),
    /Invalid scale/,
  );
  await rejected(
    () =>
      db.query("update public.profiles set is_test=true where id=$1", [ids[1]]),
    /permission denied/,
  );
  await rejected(
    () => db.query("select public.delete_test_data($1)", [ids[0]]),
    /Administrator required/,
  );
});
let submission;
await asUser(ids[0], async () => {
  await rejected(
    () => db.query("select public.save_survey('draft','{}',true)"),
    /50 scale/,
  );
  await db.query("select public.save_survey('draft',$1,false)", [
    JSON.stringify({ q0: "unknown" }),
  ]);
  const r = await db.query("select (public.save_survey('draft',$1,true)).*", [
    JSON.stringify(answers),
  ]);
  submission = r.rows[0].id;
  await db.query("select public.save_survey('draft',$1,true)", [
    JSON.stringify(answers),
  ]);
  assert.equal(
    (await db.query("select * from public.submissions")).rows.length,
    1,
  );
  await rejected(
    () =>
      db.query("select public.save_survey('draft',$1,false)", [
        JSON.stringify(answers),
      ]),
    /locked/,
  );
  await rejected(
    () =>
      db.query("insert into public.report_drafts values($1,'attack')", [
        submission,
      ]),
    /row-level security/,
  );
});
await asUser(ids[0], async () => {
  await db.query(
    "insert into public.favorites(user_id,school_id,department_id,note) values($1,'chungjuch',null,'synthetic')",
    [ids[0]],
  );
  await assert.rejects(
    () =>
      db.query(
        "insert into public.favorites(user_id,school_id,department_id) values($1,'chungjuch','cjth-civil')",
        [ids[0]],
      ),
    /foreign key/,
  );
  await assert.rejects(
    () =>
      db.query(
        "insert into public.favorites(user_id,school_id) values($1,'gukwon')",
        [ids[1]],
      ),
    /row-level security/,
  );
});
await asUser(ids[1], async () =>
  assert.equal(
    (await db.query("select * from public.favorites")).rows.length,
    0,
  ),
);
await rejected(
  () => db.exec("update public.survey_versions set title='changed'"),
  /immutable/,
);
await asUser(ids[1], async () =>
  assert.equal(
    (await db.query("select * from public.submissions")).rows.length,
    0,
  ),
);
await asUser(ids[2], async () => {
  await db.query(
    "insert into public.report_drafts(submission_id,markdown) values($1,'first')",
    [submission],
  );
});
await asUser(ids[0], async () => {
  assert.equal(
    (await db.query("select * from public.report_drafts")).rows.length,
    0,
  );
  assert.equal(
    (await db.query("select * from public.published_reports")).rows.length,
    0,
  );
});
await asUser(ids[2], () =>
  db.query("select public.publish_report($1,'first')", [submission]),
);
await asUser(ids[0], async () =>
  assert.equal(
    (await db.query("select * from public.published_reports")).rows[0].markdown,
    "first",
  ),
);
await asUser(ids[1], async () =>
  assert.equal(
    (await db.query("select * from public.published_reports")).rows.length,
    0,
  ),
);
await asUser(ids[2], async () => {
  await db.query(
    "update public.report_drafts set markdown='private revision' where submission_id=$1",
    [submission],
  );
});
await asUser(ids[0], async () =>
  assert.equal(
    (await db.query("select * from public.published_reports")).rows[0].markdown,
    "first",
  ),
);
await asUser(ids[2], () =>
  db.query("select public.set_report_status($1,'unpublish')", [submission]),
);
await asUser(ids[0], async () =>
  assert.equal(
    (await db.query("select * from public.published_reports")).rows.length,
    0,
  ),
);
await asUser(ids[0], () =>
  rejected(
    () =>
      db.query("select public.publish_report($1,'forbidden')", [submission]),
    /Administrator/,
  ),
);
await asUser(ids[2], async () => {
  // Tab A reviewed this body; tab B then saved a different private revision.
  const reviewed = "reviewed in tab A";
  await db.query(
    "update public.report_drafts set markdown='unreviewed tab B' where submission_id=$1",
    [submission],
  );
  await rejected(
    () => db.query("select public.publish_report($1,'   ')", [submission]),
    /Report required/,
  );
  await db.query("select public.publish_report($1,$2)", [submission, reviewed]);
});
await asUser(ids[0], async () =>
  assert.equal(
    (await db.query("select markdown from public.published_reports")).rows[0]
      .markdown,
    "reviewed in tab A",
  ),
);
await asUser(ids[2], async () => {
  await rejected(
    () => db.query("select public.delete_test_data($1)", [ids[1]]),
    /Only test/,
  );
  await rejected(
    () =>
      db.query("select public.set_report_status($1,'publish')", [submission]),
    /publish_report/,
  );
  await db.query("select public.publish_report($1,'private revision')", [
    submission,
  ]);
  await db.query("select public.delete_test_data($1)", [ids[0]]);
  assert.equal(
    (await db.query("select * from public.published_reports")).rows.length,
    0,
  );
});
await db.close();
console.log(
  "PASS: ordered migrations, atomic reviewed-body publish, legacy publish rejection, PostgreSQL RLS isolation, approval gate, unknown, immutability, duplicate submit, draft secrecy, publication snapshot, unpublish, test-only cascade deletion",
);
