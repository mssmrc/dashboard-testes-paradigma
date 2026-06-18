import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import path from "path";
import * as schema from "./schema";

const dbPath = path.join(process.cwd(), "database.sqlite");

const sqlite = new Database(dbPath);
sqlite.pragma("journal_mode = WAL");
sqlite.pragma("foreign_keys = ON");

export const db = drizzle(sqlite, { schema });

export function initializeDatabase() {
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS scenarios (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      module TEXT NOT NULL,
      functionality TEXT NOT NULL,
      name TEXT NOT NULL,
      expected_result TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'Não iniciado',
      execution_date TEXT,
      executor TEXT,
      observations TEXT
    );

    CREATE TABLE IF NOT EXISTS evidences (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      scenario_id INTEGER NOT NULL,
      file_path TEXT NOT NULL,
      FOREIGN KEY (scenario_id) REFERENCES scenarios(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS project_metadata (
      id INTEGER PRIMARY KEY,
      client_name TEXT,
      project_name TEXT,
      analyst_name TEXT,
      pm_name TEXT
    );

    INSERT OR IGNORE INTO project_metadata (id, client_name, project_name, analyst_name, pm_name)
    VALUES (1, NULL, NULL, NULL, NULL);
  `);

  const columns = sqlite
    .prepare("PRAGMA table_info(project_metadata)")
    .all() as { name: string }[];

    if (!columns.some((c) => c.name === "client_logo_path")) {
      sqlite.exec(`ALTER TABLE project_metadata ADD COLUMN client_logo_path TEXT`);
    }

    if (!columns.some((c) => c.name === "data_inicio_testes")) {
      sqlite.exec(`ALTER TABLE project_metadata ADD COLUMN data_inicio_testes TEXT`);
    }
    if (!columns.some((c) => c.name === "data_prevista_fim")) {
      sqlite.exec(`ALTER TABLE project_metadata ADD COLUMN data_prevista_fim TEXT`);
    }
    if (!columns.some((c) => c.name === "data_real_fim")) {
      sqlite.exec(`ALTER TABLE project_metadata ADD COLUMN data_real_fim TEXT`);
    }
    if (!columns.some((c) => c.name === "fase_testes")) {
      sqlite.exec(`ALTER TABLE project_metadata ADD COLUMN fase_testes TEXT`);
    }
  }

initializeDatabase();
