-- 001_init.sql

-- Drop existing database if it exists
DROP DATABASE IF EXISTS myapp;

-- Create database
CREATE DATABASE IF NOT EXISTS myapp;

-- Use the new database
USE myapp;

-- ----------------- Tables -----------------

-- API List table
DROP TABLE IF EXISTS api_list;
CREATE TABLE api_list (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    system_name VARCHAR(255) NOT NULL,
    api_name VARCHAR(255) NOT NULL,
    params_values JSON,
    return_values JSON,
    description VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
