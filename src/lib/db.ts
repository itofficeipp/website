import { Pool, QueryResultRow } from "pg";

const globalForDb = globalThis as unknown as { db?: Pool };
export const db =
  globalForDb.db ??
  new Pool({ connectionString: process.env.DATABASE_URL, max: 10, idleTimeoutMillis: 30_000 });
if (process.env.NODE_ENV !== "production") globalForDb.db = db;

export async function query<T extends QueryResultRow>(text: string, values: unknown[] = []) {
  return db.query<T>(text, values);
}
