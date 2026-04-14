import { createClient } from "@libsql/client";
import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

// .envを手動で読み込む
const envPath = resolve(__dirname, "../.env");
const envContent = readFileSync(envPath, "utf-8");
for (const line of envContent.split("\n")) {
  const match = line.match(/^([^#=]+)=["']?(.+?)["']?\s*$/);
  if (match) process.env[match[1].trim()] = match[2].trim();
}

const url = process.env.DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;

if (!url || !authToken) {
  console.error("DATABASE_URL または TURSO_AUTH_TOKEN が設定されていません");
  process.exit(1);
}

const client = createClient({ url, authToken });

const sql = readFileSync(
  resolve(__dirname, "../prisma/migrations/20260414123031_add_user_model/migration.sql"),
  "utf-8"
);

const statements = sql
  .split(";")
  .map((s) => s.trim())
  .filter((s) => s.length > 0);

console.log(`${statements.length}件のSQLを実行します...`);

for (const stmt of statements) {
  console.log("実行:", stmt.substring(0, 60) + "...");
  await client.execute(stmt);
}

console.log("マイグレーション完了！");
client.close();
