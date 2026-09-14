import { PGlite } from "@electric-sql/pglite";
import { readFile, readdir } from "node:fs/promises";
export async function schemaDatabase() {
  const db = new PGlite();
  await db.exec(
    await readFile(
      new URL("../tests/fixtures/supabase-platform.sql", import.meta.url),
      "utf8",
    ),
  );
  const directory = new URL("../supabase/migrations/", import.meta.url);
  for (const name of (await readdir(directory))
    .filter((name) => name.endsWith(".sql"))
    .sort())
    await db.exec(await readFile(new URL(name, directory), "utf8"));
  return db;
}
