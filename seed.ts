/**
 * Script de seed para popular o banco database.sqlite.
 *
 * Uso: npm run db:seed
 *
 * Para importar dados do CSV, substitua o array `sampleScenarios` abaixo
 * ou adicione lógica de leitura de CSV conforme o arquivo fornecido.
 */

import Database from "better-sqlite3";
import path from "path";

const dbPath = path.join(process.cwd(), "database.sqlite");
const db = new Database(dbPath);

db.pragma("foreign_keys = ON");

db.exec(`
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

const columns = db.prepare("PRAGMA table_info(project_metadata)").all() as {
  name: string;
}[];

if (!columns.some((c) => c.name === "client_logo_path")) {
  db.exec(`ALTER TABLE project_metadata ADD COLUMN client_logo_path TEXT`);
}

db.exec(`
  DELETE FROM evidences;
  DELETE FROM scenarios;
`);

type SeedScenario = {
  module: string;
  functionality: string;
  name: string;
  expectedResult: string;
  status?: "Não iniciado" | "Em andamento" | "Concluído";
  executionDate?: string | null;
  executor?: string | null;
  observations?: string | null;
};

const sampleScenarios: SeedScenario[] = [
  {
    module: "Dados Mestres",
    functionality: "Cadastro de Material",
    name: "Cadastrar novo material com campos obrigatórios",
    expectedResult: "Material cadastrado com sucesso e visível na listagem",
    status: "Não iniciado",
  },
  {
    module: "Solicitação de Compras",
    functionality: "Criação de SC",
    name: "Criar solicitação de compra padrão",
    expectedResult: "SC criada e enviada para aprovação",
    status: "Em andamento",
  },
  {
    module: "Cotação",
    functionality: "Convite de Fornecedores",
    name: "Enviar convite para cotação",
    expectedResult: "Fornecedores recebem convite por e-mail",
    status: "Concluído",
  },
];

const insertScenario = db.prepare(`
  INSERT INTO scenarios (
    module, functionality, name, expected_result, status,
    execution_date, executor, observations
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
`);

const insertMany = db.transaction((items: SeedScenario[]) => {
  for (const item of items) {
    insertScenario.run(
      item.module,
      item.functionality,
      item.name,
      item.expectedResult,
      item.status ?? "Não iniciado",
      item.executionDate ?? null,
      item.executor ?? null,
      item.observations ?? null,
    );
  }
});

insertMany(sampleScenarios);

console.log(`Seed concluído: ${sampleScenarios.length} cenários inseridos.`);
db.close();
