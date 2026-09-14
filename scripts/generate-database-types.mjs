import { writeFile } from "node:fs/promises";
import { schemaDatabase } from "./schema-database.mjs";
const db = await schemaDatabase();
const tables = (
  await db.query(
    "select table_name from information_schema.tables where table_schema='public' and table_type='BASE TABLE' order by table_name",
  )
).rows;
const enums = (
  await db.query(
    "select t.typname name,string_agg(quote_literal(e.enumlabel),' | ' order by e.enumsortorder) values from pg_type t join pg_enum e on e.enumtypid=t.oid join pg_namespace n on n.oid=t.typnamespace where n.nspname='public' group by t.typname",
  )
).rows;
const map = {
  uuid: "string",
  text: "string",
  timestamptz: "string",
  int2: "number",
  int4: "number",
  int8: "number",
  numeric: "number",
  bool: "boolean",
  jsonb: "Json",
  _text: "string[]",
};
let output =
  "// Generated from supabase/migrations by npm run db:types. Do not edit.\nexport type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];\nexport type Database = { public: { Tables: {\n";
for (const { table_name: name } of tables) {
  const columns = (
    await db.query(
      "select column_name,is_nullable,column_default,udt_name from information_schema.columns where table_schema='public' and table_name=$1 order by ordinal_position",
      [name],
    )
  ).rows;
  output += `${name}: {\n`;
  for (const mode of ["Row", "Insert", "Update"]) {
    output += `${mode}: {\n`;
    for (const c of columns) {
      const type =
        map[c.udt_name] ?? `Database['public']['Enums']['${c.udt_name}']`;
      const optional =
        mode === "Update" ||
        (mode === "Insert" &&
          (c.is_nullable === "YES" || c.column_default !== null));
      output += `${c.column_name}${optional ? "?" : ""}: ${type}${c.is_nullable === "YES" ? " | null" : ""};\n`;
    }
    output += "};\n";
  }
  const relationships = (
    await db.query(
      `
    select c.conname, target.relname as target,
      array(select attname from unnest(c.conkey) with ordinality k(num,ord)
        join pg_attribute a on a.attrelid=c.conrelid and a.attnum=k.num order by k.ord) as columns,
      array(select attname from unnest(c.confkey) with ordinality k(num,ord)
        join pg_attribute a on a.attrelid=c.confrelid and a.attnum=k.num order by k.ord) as referenced_columns,
      exists(select 1 from pg_constraint u where u.conrelid=c.conrelid and u.contype in ('p','u') and u.conkey=c.conkey) as one_to_one
    from pg_constraint c join pg_class source on source.oid=c.conrelid
      join pg_class target on target.oid=c.confrelid
      join pg_namespace n on n.oid=source.relnamespace
      join pg_namespace tn on tn.oid=target.relnamespace
    where c.contype='f' and n.nspname='public' and tn.nspname='public' and source.relname=$1 order by c.conname`,
      [name],
    )
  ).rows;
  output +=
    "Relationships: [" +
    relationships
      .map(
        (r) =>
          `{ foreignKeyName: ${JSON.stringify(r.conname)}; columns: ${JSON.stringify(r.columns)}; isOneToOne: ${r.one_to_one}; referencedRelation: ${JSON.stringify(r.target)}; referencedColumns: ${JSON.stringify(r.referenced_columns)}; }`,
      )
      .join(",") +
    "];\n};\n";
}
output += "}; Views: { [_ in never]: never }; Functions: {\n";
const functions = (
  await db.query(
    `select p.proname, p.proargnames, array(select t.typname from unnest(p.proargtypes) with ordinality a(id,ord) join pg_type t on t.oid=a.id order by ord) argtypes from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname='public' and p.prorettype='void'::regtype and p.proname='complete_document_extraction'`,
  )
).rows;
for (const fn of functions)
  output += `${fn.proname}: { Args: { ${fn.proargnames.map((name, i) => `${name}: ${map[fn.argtypes[i]]}`).join(";")} }; Returns: undefined };\n`;
output += "}; Enums: {\n";
for (const e of enums) output += `${e.name}: ${e.values};\n`;
output +=
  '}; CompositeTypes: { [_ in never]: never }; }; };\nexport type Tables<T extends keyof Database["public"]["Tables"]> = Database["public"]["Tables"][T]["Row"];\n';
await writeFile(new URL("../src/types/database.ts", import.meta.url), output);
await db.close();
console.log(`Generated types for ${tables.length} tables.`);
