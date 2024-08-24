CREATE TABLE IF NOT EXISTS your_table (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    value TEXT
);

INSERT INTO your_table (name, value) VALUES ('Example', 'Value');