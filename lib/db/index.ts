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
      client_name TEXT NOT NULL DEFAULT '',
      project_name TEXT NOT NULL DEFAULT '',
      analyst_name TEXT NOT NULL DEFAULT '',
      pm_name TEXT NOT NULL DEFAULT '',
      client_logo_path TEXT NOT NULL DEFAULT '',
      data_inicio_testes TEXT NOT NULL DEFAULT '',
      data_prevista_fim TEXT NOT NULL DEFAULT '',
      data_real_fim TEXT NOT NULL DEFAULT '',
      fase_testes TEXT NOT NULL DEFAULT ''
    );

    INSERT OR IGNORE INTO project_metadata (id, client_name, project_name, analyst_name, pm_name, client_logo_path, data_inicio_testes, data_prevista_fim, data_real_fim, fase_testes)
    VALUES (1, '', '', '', '', '', '', '', '', '');
  `);

  const columns = sqlite
    .prepare("PRAGMA table_info(project_metadata)")
    .all() as { name: string }[];

    if (!columns.some((c) => c.name === "client_logo_path")) {
      sqlite.exec(`ALTER TABLE project_metadata ADD COLUMN client_logo_path TEXT NOT NULL DEFAULT ''`);
    }

    if (!columns.some((c) => c.name === "data_inicio_testes")) {
      sqlite.exec(`ALTER TABLE project_metadata ADD COLUMN data_inicio_testes TEXT NOT NULL DEFAULT ''`);
    }
    if (!columns.some((c) => c.name === "data_prevista_fim")) {
      sqlite.exec(`ALTER TABLE project_metadata ADD COLUMN data_prevista_fim TEXT NOT NULL DEFAULT ''`);
    }
    if (!columns.some((c) => c.name === "data_real_fim")) {
      sqlite.exec(`ALTER TABLE project_metadata ADD COLUMN data_real_fim TEXT NOT NULL DEFAULT ''`);
    }
    if (!columns.some((c) => c.name === "fase_testes")) {
      sqlite.exec(`ALTER TABLE project_metadata ADD COLUMN fase_testes TEXT NOT NULL DEFAULT ''`);
    }

    // Update any existing null values in the database
    sqlite.exec(`
      UPDATE project_metadata
      SET client_name = COALESCE(client_name, ''),
          project_name = COALESCE(project_name, ''),
          analyst_name = COALESCE(analyst_name, ''),
          pm_name = COALESCE(pm_name, ''),
          client_logo_path = COALESCE(client_logo_path, ''),
          data_inicio_testes = COALESCE(data_inicio_testes, ''),
          data_prevista_fim = COALESCE(data_prevista_fim, ''),
          data_real_fim = COALESCE(data_real_fim, ''),
          fase_testes = COALESCE(fase_testes, '')
      WHERE id = 1;
    `);
  }

initializeDatabase();
