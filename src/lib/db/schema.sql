-- M0Desk local schema (SQLite / node:sqlite)
-- Mirrors the original Postgres design minus multi-user concerns.
-- Timestamps are ISO-8601 UTC strings so TEXT comparison == chronological order.

CREATE TABLE IF NOT EXISTS projects (
  id            TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  user_id       TEXT NOT NULL DEFAULT 'local',
  title         TEXT NOT NULL,
  description   TEXT NOT NULL DEFAULT '',
  status        TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','paused','completed','archived')),
  priority      TEXT NOT NULL DEFAULT 'P2' CHECK (priority IN ('P0','P1','P2','P3')),
  deadline      TEXT,
  current_stage TEXT NOT NULL DEFAULT '',
  next_action   TEXT NOT NULL DEFAULT '',
  notes         TEXT NOT NULL DEFAULT '',
  created_at    TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  updated_at    TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);

CREATE TABLE IF NOT EXISTS tasks (
  id           TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  user_id      TEXT NOT NULL DEFAULT 'local',
  project_id   TEXT REFERENCES projects (id) ON DELETE SET NULL,
  title        TEXT NOT NULL,
  description  TEXT NOT NULL DEFAULT '',
  status       TEXT NOT NULL DEFAULT 'todo' CHECK (status IN ('todo','doing','done')),
  priority     TEXT NOT NULL DEFAULT 'P2' CHECK (priority IN ('P0','P1','P2','P3')),
  due_date     TEXT,
  completed_at TEXT,
  created_at   TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  updated_at   TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);

CREATE TABLE IF NOT EXISTS knowledge (
  id         TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  user_id    TEXT NOT NULL DEFAULT 'local',
  project_id TEXT REFERENCES projects (id) ON DELETE SET NULL,
  title      TEXT NOT NULL,
  summary    TEXT NOT NULL DEFAULT '',
  content    TEXT NOT NULL DEFAULT '',
  category   TEXT NOT NULL DEFAULT '',
  tags       TEXT NOT NULL DEFAULT '[]',
  status     TEXT NOT NULL DEFAULT 'learning' CHECK (status IN ('learning','understood','review')),
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);

CREATE TABLE IF NOT EXISTS library_items (
  id          TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  user_id     TEXT NOT NULL DEFAULT 'local',
  project_id  TEXT REFERENCES projects (id) ON DELETE SET NULL,
  title       TEXT NOT NULL,
  type        TEXT NOT NULL DEFAULT 'other' CHECK (type IN ('paper','website','github','course','video','book','document','other')),
  url         TEXT NOT NULL DEFAULT '',
  description TEXT NOT NULL DEFAULT '',
  tags        TEXT NOT NULL DEFAULT '[]',
  status      TEXT NOT NULL DEFAULT 'unread' CHECK (status IN ('unread','reading','finished','reference')),
  created_at  TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  updated_at  TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);

CREATE TABLE IF NOT EXISTS inbox_items (
  id         TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  user_id    TEXT NOT NULL DEFAULT 'local',
  content    TEXT NOT NULL,
  status     TEXT NOT NULL DEFAULT 'unprocessed' CHECK (status IN ('unprocessed','processed')),
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);

CREATE INDEX IF NOT EXISTS idx_tasks_project ON tasks (project_id);
CREATE INDEX IF NOT EXISTS idx_tasks_due ON tasks (due_date);
CREATE INDEX IF NOT EXISTS idx_knowledge_project ON knowledge (project_id);
CREATE INDEX IF NOT EXISTS idx_library_project ON library_items (project_id);

-- updated_at maintenance (recursive triggers are off by default, so the
-- nested UPDATE does not re-fire)
CREATE TRIGGER IF NOT EXISTS trg_projects_updated_at AFTER UPDATE ON projects
  FOR EACH ROW BEGIN
    UPDATE projects SET updated_at = strftime('%Y-%m-%dT%H:%M:%fZ','now') WHERE id = NEW.id;
  END;
CREATE TRIGGER IF NOT EXISTS trg_tasks_updated_at AFTER UPDATE ON tasks
  FOR EACH ROW BEGIN
    UPDATE tasks SET updated_at = strftime('%Y-%m-%dT%H:%M:%fZ','now') WHERE id = NEW.id;
  END;
CREATE TRIGGER IF NOT EXISTS trg_knowledge_updated_at AFTER UPDATE ON knowledge
  FOR EACH ROW BEGIN
    UPDATE knowledge SET updated_at = strftime('%Y-%m-%dT%H:%M:%fZ','now') WHERE id = NEW.id;
  END;
CREATE TRIGGER IF NOT EXISTS trg_library_items_updated_at AFTER UPDATE ON library_items
  FOR EACH ROW BEGIN
    UPDATE library_items SET updated_at = strftime('%Y-%m-%dT%H:%M:%fZ','now') WHERE id = NEW.id;
  END;
CREATE TRIGGER IF NOT EXISTS trg_inbox_items_updated_at AFTER UPDATE ON inbox_items
  FOR EACH ROW BEGIN
    UPDATE inbox_items SET updated_at = strftime('%Y-%m-%dT%H:%M:%fZ','now') WHERE id = NEW.id;
  END;
