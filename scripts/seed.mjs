// M0Desk optional dev seed — run with `npm run seed`
// Inserts example data only when the tables are empty.
import { DatabaseSync } from "node:sqlite";
import { mkdirSync, readFileSync } from "node:fs";
import path from "node:path";

const DATA_DIR = path.join(process.cwd(), "data");
const DB_PATH = path.join(DATA_DIR, "m0desk.db");
const SCHEMA_PATH = path.join(process.cwd(), "src/lib/db/schema.sql");

mkdirSync(DATA_DIR, { recursive: true });
const db = new DatabaseSync(DB_PATH);
db.exec("PRAGMA foreign_keys = ON;");
db.exec(readFileSync(SCHEMA_PATH, "utf8"));

const count = (table) => db.prepare(`SELECT COUNT(*) AS n FROM ${table}`).get().n;

if (count("projects") > 0) {
  console.log("Data already exists — skipping seed.");
  process.exit(0);
}

const iso = (daysFromNow = 0) =>
  new Date(Date.now() + daysFromNow * 86400000).toISOString();

// Projects
db.prepare(
  `INSERT INTO projects (title, description, status, priority, deadline, current_stage, next_action)
   VALUES (?, ?, 'active', 'P0', ?, 'Framework Design', 'Define Eval Schema')`,
).run(
  "Skill Eval Framework",
  "Design and validate a rubric-based evaluation framework for skill evaluations.",
  iso(11),
);

db.prepare(
  `INSERT INTO projects (title, description, status, priority, deadline, current_stage, next_action)
   VALUES (?, ?, 'active', 'P2', ?, 'Functions & Modules', 'Practice with exercises')`,
).run(
  "Python Learning",
  "Structured self-study: core language, then tooling and projects.",
  iso(30),
);

db.prepare(
  `INSERT INTO projects (title, description, status, priority, deadline, current_stage, next_action)
   VALUES (?, ?, 'paused', 'P1', ?, 'Topic exploration', 'Read two survey papers')`,
).run(
  "Paper Research",
  "Find a research topic for the upcoming term paper.",
  iso(15),
);

// Real TEXT ids (lastInsertRowid is the integer rowid, not the id column)
const projectIds = db
  .prepare("SELECT id FROM projects ORDER BY rowid")
  .all()
  .map((r) => r.id);

// Tasks
db.prepare(
  `INSERT INTO tasks (project_id, title, status, priority, due_date) VALUES (?, ?, 'todo', 'P0', ?)`,
).run(projectIds[0], "Finish framework design", iso(2));
db.prepare(
  `INSERT INTO tasks (project_id, title, status, priority, due_date) VALUES (?, ?, 'doing', 'P2', ?)`,
).run(projectIds[1], "Learn Python functions", iso(5));
db.prepare(
  `INSERT INTO tasks (project_id, title, status, priority, due_date) VALUES (?, ?, 'todo', 'P1', ?)`,
).run(projectIds[2], "Read two survey papers", iso(7));
db.prepare(
  `INSERT INTO tasks (title, status, priority) VALUES ('Set up M0Desk on my phone', 'todo', 'P3')`,
).run();

// Knowledge
db.prepare(
  `INSERT INTO knowledge (title, summary, content, category, tags, status, project_id) VALUES (?, ?, ?, 'AI Engineering', ?, 'learning', ?)`,
).run(
  "MCP — Model Context Protocol",
  "A protocol that lets AI applications connect to external tools and data sources through a standardized server interface.",
  "## Core idea\n\nMCP decouples AI apps from tool providers:\n\n- **Host** — the AI application (e.g. Claude Desktop)\n- **Client** — one per connection inside the host\n- **Server** — exposes tools/resources via JSON-RPC 2.0\n\n## Key takeaway\n\nTools are just functions with schemas; MCP standardizes how they are advertised and called.",
  JSON.stringify(["mcp", "protocol", "tools"]),
  projectIds[0],
);
db.prepare(
  `INSERT INTO knowledge (title, summary, content, category, tags, status) VALUES (?, ?, ?, 'AI Engineering', ?, 'understood')`,
).run(
  "Verifier Pattern",
  "A separate model or process double-checks an agent's output before it is trusted.",
  "Verifiers are cheap insurance:\n\n1. Generator proposes\n2. Verifier checks against constraints\n3. Only verified results pass\n\nWorks best when the check is simpler than the generation.",
  JSON.stringify(["agents", "verification"]),
);
db.prepare(
  `INSERT INTO knowledge (title, summary, content, category, tags, status, project_id) VALUES (?, ?, ?, 'Programming', ?, 'learning', ?)`,
).run(
  "Python Functions",
  "First-class objects, default arguments, *args/**kwargs, and closures.",
  "```python\ndef greet(name, *, excited=False):\n    msg = f\"Hello, {name}\"\n    return msg + \"!\" if excited else msg\n```\n\nKey ideas: functions are values, keyword-only args after `*`, closures capture enclosing scope.",
  JSON.stringify(["python", "functions"]),
  projectIds[1],
);

// Library
db.prepare(
  `INSERT INTO library_items (title, type, url, description, tags, status, project_id) VALUES (?, 'github', ?, ?, ?, 'unread', ?)`,
).run(
  "Example GitHub Repository",
  "https://github.com/example/example-repo",
  "A well-structured example to study.",
  JSON.stringify(["github", "reference"]),
  projectIds[0],
);
db.prepare(
  `INSERT INTO library_items (title, type, url, description, tags, status, project_id) VALUES (?, 'paper', ?, ?, ?, 'reading', ?)`,
).run(
  "Attention Is All You Need",
  "https://arxiv.org/abs/1706.03762",
  "The original Transformer paper.",
  JSON.stringify(["transformer", "nlp"]),
  projectIds[2],
);

// Inbox
db.prepare(
  `INSERT INTO inbox_items (content, status) VALUES ('Understand MCP vs Tool Calling', 'unprocessed')`,
).run();
db.prepare(
  `INSERT INTO inbox_items (content, status) VALUES ('Buy a second monitor for the desk', 'unprocessed')`,
).run();
db.prepare(
  `INSERT INTO inbox_items (content, status) VALUES ('Read the Supabase docs page on publishable keys', 'processed')`,
).run();

console.log("Seed complete:");
console.log(`  projects: ${count("projects")}`);
console.log(`  tasks:    ${count("tasks")}`);
console.log(`  knowledge: ${count("knowledge")}`);
console.log(`  library:  ${count("library_items")}`);
console.log(`  inbox:    ${count("inbox_items")}`);
