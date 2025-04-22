
CREATE TABLE endpoints (
    endpoint_id INT AUTO_INCREMENT PRIMARY KEY,
    authkey VARCHAR(255) NOT NULL,
    hostname VARCHAR(255) NOT NULL,
    ip_address VARCHAR(45) NOT NULL,
    Name VARCHAR(64)
);

CREATE TABLE events (
    event_id SERIAL PRIMARY KEY,
    endpoint_id INT,
    event_time INT NOT NULL,
    message TEXT NOT NULL,
    event_type VARCHAR(16),
    pid INT
);

CREATE TABLE alert_rules (
    rule_id SERIAL PRIMARY KEY,
    rule_name VARCHAR(255) NOT NULL,
    description TEXT,
    severity VARCHAR(50),
    active BOOLEAN DEFAULT TRUE
);

CREATE TABLE alerts (
    alert_id SERIAL PRIMARY KEY,
    alert_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    severity VARCHAR(50),
    acknowledged BOOLEAN DEFAULT FALSE,
    acknowledged_by VARCHAR(255),
    acknowledged_at TIMESTAMP,
    resolution TEXT
);

CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    passwordhash VARCHAR(255)
);
