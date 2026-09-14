import { beforeAll, afterAll, expect, test } from "vitest";
import { schemaDatabase } from "../../scripts/schema-database.mjs";
let db;
const a = "11111111-1111-4111-8111-111111111111",
  b = "22222222-2222-4222-8222-222222222222";
const brain = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
  other = "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",
  doc = "dddddddd-dddd-4ddd-8ddd-dddddddddddd";
const path = `${a}/${doc}/source.txt`;
async function asUser(id = a) {
  await db.exec("reset role");
  await db.query("select set_config('request.jwt.claim.sub',$1,false)", [id]);
  await db.exec("set role authenticated");
}
beforeAll(async () => {
  db = await schemaDatabase();
  await db.query(
    "insert into auth.users(id,raw_user_meta_data) values($1,'{\"display_name\":\"Ada\"}'),($2,'{}')",
    [a, b],
  );
  await asUser();
  await db.query(
    "insert into brains(id,user_id,name) values($1,$2,'Biology')",
    [brain, a],
  );
  await asUser(b);
  await db.query(
    "insert into brains(id,user_id,name) values($1,$2,'Physics')",
    [other, b],
  );
  await asUser();
  await db.query(
    "insert into documents(id,user_id,brain_id,original_filename,display_name,file_type,mime_type,file_size,storage_path) values($1,$2,$3,'source.txt','Source','TXT','text/plain',12,$4)",
    [doc, a, brain, path],
  );
});
afterAll(async () => {
  await db?.close();
});
test("all 13 tables enable RLS, four owner policies, and timestamp triggers", async () => {
  await db.exec("reset role");
  const tables = await db.query(
    "select tablename,rowsecurity from pg_tables where schemaname='public'",
  );
  expect(tables.rows).toHaveLength(13);
  expect(tables.rows.every((row) => row.rowsecurity)).toBe(true);
  const policies = await db.query(
    "select * from pg_policies where schemaname='public'",
  );
  expect(policies.rows).toHaveLength(52);
  const triggers = await db.query(
    "select * from information_schema.triggers where trigger_schema='public' and trigger_name='touch_updated_at'",
  );
  expect(triggers.rows).toHaveLength(13);
});
test("profile trigger creates own profile and hides other profiles", async () => {
  await asUser();
  const result = await db.query("select id,display_name from profiles");
  expect(result.rows).toEqual([{ id: a, display_name: "Ada" }]);
  await db.query(
    "update profiles set display_name='Ada Lovelace' where id=$1",
    [a],
  );
  expect(
    (await db.query("select display_name from profiles")).rows[0].display_name,
  ).toBe("Ada Lovelace");
});
test("other users cannot read, update, or delete brains and documents", async () => {
  await asUser(b);
  for (const [table, id] of [
    ["brains", brain],
    ["documents", doc],
  ]) {
    expect(
      (await db.query(`select id from ${table} where id=$1`, [id])).rows,
    ).toHaveLength(0);
    expect(
      (
        await db.query(
          `update ${table} set updated_at=now() where id=$1 returning id`,
          [id],
        )
      ).rows,
    ).toHaveLength(0);
    expect(
      (await db.query(`delete from ${table} where id=$1 returning id`, [id]))
        .rows,
    ).toHaveLength(0);
  }
});
test("user ownership cannot be spoofed on insertion or update", async () => {
  await asUser();
  await expect(
    db.query("insert into brains(user_id,name) values($1,'Spoof')", [b]),
  ).rejects.toThrow();
  await expect(
    db.query("update brains set user_id=$1 where id=$2", [b, brain]),
  ).rejects.toThrow();
});
test("cross-owner child references are rejected independently of RLS", async () => {
  await asUser();
  await expect(
    db.query("update documents set brain_id=$1 where id=$2", [other, doc]),
  ).rejects.toThrow();
  await expect(
    db.query(
      "insert into notes(user_id,brain_id,title) values($1,$2,'Cross owner')",
      [a, other],
    ),
  ).rejects.toThrow();
});
test("anonymous access is denied for all public tables", async () => {
  await db.exec("reset role");
  const { rows } = await db.query(
    "select tablename from pg_tables where schemaname='public'",
  );
  await db.exec("set role anon");
  for (const row of rows)
    await expect(
      db.query(`select * from public.${row.tablename}`),
    ).rejects.toThrow();
});
test("private bucket only accepts objects with owned metadata and valid lifecycle", async () => {
  await asUser();
  await expect(
    db.query(
      "insert into storage.objects(bucket_id,name) values('study-documents',$1)",
      [`${a}/orphan.txt`],
    ),
  ).rejects.toThrow();
  await db.query(
    "insert into storage.objects(bucket_id,name) values('study-documents',$1)",
    [path],
  );
  await db.query(
    "update documents set processing_status='uploaded' where id=$1",
    [doc],
  );
  expect((await db.query("select name from storage.objects")).rows).toEqual([
    { name: path },
  ]);
  expect(
    (await db.query("delete from storage.objects returning id")).rows,
  ).toHaveLength(0);
  expect(
    (await db.query("update storage.objects set name='changed' returning id"))
      .rows,
  ).toHaveLength(0);
  await db.exec("reset role");
  expect(
    (
      await db.query(
        "select public from storage.buckets where id='study-documents'",
      )
    ).rows[0].public,
  ).toBe(false);
});
test("other users cannot read, overwrite, delete, or insert into another storage path", async () => {
  await asUser(b);
  expect((await db.query("select * from storage.objects")).rows).toHaveLength(
    0,
  );
  expect(
    (await db.query("delete from storage.objects returning id")).rows,
  ).toHaveLength(0);
  await expect(
    db.query(
      "insert into storage.objects(bucket_id,name) values('study-documents',$1)",
      [path],
    ),
  ).rejects.toThrow();
});
test("metadata deletion and nonempty brain deletion are blocked", async () => {
  await asUser();
  await expect(
    db.query("delete from documents where id=$1", [doc]),
  ).rejects.toThrow(/storage/i);
  await expect(
    db.query("delete from brains where id=$1", [brain]),
  ).rejects.toThrow();
  await expect(
    db.query("update documents set storage_path='../escape' where id=$1", [
      doc,
    ]),
  ).rejects.toThrow();
});
test("rename and move persist while storage path stays stable; timestamp is database maintained", async () => {
  await asUser();
  const {
    rows: [before],
  } = await db.query("select updated_at from documents where id=$1", [doc]);
  const {
    rows: [target],
  } = await db.query(
    "insert into brains(user_id,name) values($1,'Chemistry') returning id",
    [a],
  );
  await db.query(
    "update documents set display_name='Renamed',brain_id=$1,updated_at='2000-01-01' where id=$2",
    [target.id, doc],
  );
  const {
    rows: [after],
  } = await db.query("select * from documents where id=$1", [doc]);
  expect(after.display_name).toBe("Renamed");
  expect(after.brain_id).toBe(target.id);
  expect(after.storage_path).toBe(path);
  expect(new Date(after.updated_at).getTime()).toBeGreaterThanOrEqual(
    new Date(before.updated_at).getTime(),
  );
  await db.query("delete from brains where id=$1", [brain]);
});
test("ordered storage cleanup permits deletion, retaining human notes and cascading chunks", async () => {
  await asUser();
  const {
    rows: [record],
  } = await db.query("select brain_id from documents where id=$1", [doc]);
  await db.query(
    "insert into notes(user_id,brain_id,source_document_id,title) values($1,$2,$3,'Keep this')",
    [a, record.brain_id, doc],
  );
  await db.query(
    "insert into document_chunks(user_id,document_id,ordinal,content) values($1,$2,0,'Chunk')",
    [a, doc],
  );
  await db.query(
    "update documents set processing_status='deleting' where id=$1",
    [doc],
  );
  expect(
    (
      await db.query("delete from storage.objects where name=$1 returning id", [
        path,
      ])
    ).rows,
  ).toHaveLength(1);
  await db.query("delete from documents where id=$1", [doc]);
  expect((await db.query("select * from document_chunks")).rows).toHaveLength(
    0,
  );
  expect((await db.query("select source_document_id from notes")).rows).toEqual(
    [{ source_document_id: null }],
  );
});

test("every future table enforces read/write isolation and insert ownership", async () => {
  await asUser();
  const ids = {};
  async function insert(table, values) {
    const keys = Object.keys(values);
    const {
      rows: [row],
    } = await db.query(
      `insert into ${table} (${keys.join(",")}) values (${keys.map((_, i) => `$${i + 1}`).join(",")}) returning *`,
      Object.values(values),
    );
    ids[table] = row;
    return row.id;
  }
  const workspace = await insert("brains", {
    user_id: a,
    name: "Security fixtures",
  });
  const sourceId = crypto.randomUUID();
  await insert("documents", {
    id: sourceId,
    user_id: a,
    brain_id: workspace,
    original_filename: "notes.txt",
    display_name: "Notes",
    file_type: "TXT",
    mime_type: "text/plain",
    file_size: 10,
    storage_path: `${a}/${sourceId}/notes.txt`,
  });
  await insert("document_chunks", {
    user_id: a,
    document_id: sourceId,
    ordinal: 0,
    content: "Study source",
  });
  const first = await insert("concepts", {
    user_id: a,
    brain_id: workspace,
    source_document_id: sourceId,
    name: "Cells",
  });
  const second = (
    await db.query(
      "insert into concepts(user_id,brain_id,name) values($1,$2,'Tissues') returning id",
      [a, workspace],
    )
  ).rows[0].id;
  await insert("concept_connections", {
    user_id: a,
    brain_id: workspace,
    source_concept_id: first,
    target_concept_id: second,
    relationship: "composes",
  });
  await insert("notes", { user_id: a, brain_id: workspace, title: "Lecture" });
  const card = await insert("flashcards", {
    user_id: a,
    brain_id: workspace,
    front: "Question",
    back: "Answer",
  });
  await insert("flashcard_reviews", {
    user_id: a,
    flashcard_id: card,
    rating: 3,
  });
  const quiz = await insert("quizzes", {
    user_id: a,
    brain_id: workspace,
    title: "Review",
  });
  await insert("quiz_questions", {
    user_id: a,
    quiz_id: quiz,
    ordinal: 0,
    prompt: "True?",
    question_type: "true_false",
    answer: "true",
  });
  await insert("quiz_attempts", { user_id: a, quiz_id: quiz });
  await insert("mastery_records", { user_id: a, concept_id: first });
  ids.profiles = (
    await db.query("select * from profiles where id=$1", [a])
  ).rows[0];
  await asUser(b);
  for (const [table, row] of Object.entries(ids)) {
    expect(
      (await db.query(`select id from ${table} where id=$1`, [row.id])).rows,
      table,
    ).toHaveLength(0);
    expect(
      (
        await db.query(
          `update ${table} set updated_at=now() where id=$1 returning id`,
          [row.id],
        )
      ).rows,
      table,
    ).toHaveLength(0);
    expect(
      (
        await db.query(`delete from ${table} where id=$1 returning id`, [
          row.id,
        ])
      ).rows,
      table,
    ).toHaveLength(0);
    const copy = { ...row, id: crypto.randomUUID() };
    await expect(
      db.query(
        `insert into ${table} select * from json_populate_record(null::${table},$1::json)`,
        [JSON.stringify(copy)],
      ),
      table,
    ).rejects.toMatchObject({ code: "42501" });
  }
});
