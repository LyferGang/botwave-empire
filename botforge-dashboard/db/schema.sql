CREATE TABLE IF NOT EXISTS edge_nodes (
    id TEXT PRIMARY KEY,
    client_name TEXT NOT NULL,
    trade_type TEXT,
    tailscale_ip TEXT UNIQUE NOT NULL,
    status TEXT DEFAULT 'offline',
    monthly_fee REAL,
    last_ping DATETIME
);

CREATE TABLE IF NOT EXISTS node_telemetry (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    node_id TEXT,
    bids_processed INTEGER DEFAULT 0,
    payroll_runs INTEGER DEFAULT 0,
    money_saved REAL DEFAULT 0,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(node_id) REFERENCES edge_nodes(id)
);
