import { query } from "@/lib/db";

async function ensureCredentialsTable() {
  await query(`
    create table if not exists admin_credentials (
      username varchar(100) primary key,
      password_hash text not null,
      updated_at timestamptz not null default now()
    )
  `);
}

export async function getAdminPasswordHash(username: string) {
  await ensureCredentialsTable();
  const result = await query<{ password_hash: string }>(
    "select password_hash from admin_credentials where username = $1 limit 1",
    [username],
  );
  return result.rows[0]?.password_hash || process.env.ADMIN_PASSWORD_HASH || "";
}

export async function saveAdminPasswordHash(username: string, passwordHash: string) {
  await ensureCredentialsTable();
  await query(
    `insert into admin_credentials (username, password_hash)
     values ($1, $2)
     on conflict (username) do update
     set password_hash = excluded.password_hash, updated_at = now()`,
    [username, passwordHash],
  );
}
