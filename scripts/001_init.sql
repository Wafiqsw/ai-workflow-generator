-- 001_init.sql

-- Drop existing database if it exists
DROP DATABASE IF EXISTS myapp;

-- Create database
CREATE DATABASE IF NOT EXISTS myapp;

-- Use the new database
USE myapp;

-- ----------------- Tables -----------------

-- Lead discovery table
DROP TABLE IF EXISTS lead_discovery;
CREATE TABLE lead_discovery (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    status VARCHAR(50) DEFAULT 'new',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Lead management table
DROP TABLE IF EXISTS lead_management;
CREATE TABLE lead_management (
    id INT AUTO_INCREMENT PRIMARY KEY,
    lead_id INT NOT NULL,
    assigned_to VARCHAR(255),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (lead_id) REFERENCES lead_discovery(id)
);

-- Communication table
DROP TABLE IF EXISTS communication;
CREATE TABLE communication (
    id INT AUTO_INCREMENT PRIMARY KEY,
    lead_id INT NOT NULL,
    message TEXT,
    sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (lead_id) REFERENCES lead_discovery(id)
);

-- Places table
DROP TABLE IF EXISTS places;
CREATE TABLE places (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    address TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
