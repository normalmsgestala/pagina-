-- Migración para bases creadas antes de los capitanes. Ejecutar una sola vez en la consola de D1.
ALTER TABLE users ADD COLUMN captain INTEGER NOT NULL DEFAULT 0;
CREATE TABLE IF NOT EXISTS versions ( id INTEGER PRIMARY KEY AUTOINCREMENT, scope TEXT NOT NULL, ref TEXT NOT NULL, action TEXT NOT NULL, label TEXT NOT NULL DEFAULT '', data TEXT NOT NULL, user_id INTEGER, user_name TEXT NOT NULL DEFAULT '', created_at TEXT NOT NULL DEFAULT (datetime('now')) );
CREATE INDEX IF NOT EXISTS idx_versions_scope ON versions(scope, id);
CREATE TABLE IF NOT EXISTS captain_profiles ( user_id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE, semester TEXT NOT NULL, area TEXT NOT NULL, duties TEXT NOT NULL, goals TEXT NOT NULL, wants TEXT NOT NULL DEFAULT '[]', team TEXT NOT NULL DEFAULT '[]', updated_at TEXT NOT NULL DEFAULT (datetime('now')) );
UPDATE users SET role = 'moderador', captain = 1 WHERE username IN ('saul.gonzalez', 'eduardo.olivo', 'cirilo.tovar', 'leisa.sanchez');
