-- 003_mock_data.sql
-- Create tables for mock API data

USE myapp;

-- Mock Users table (for UserSystem APIs)
DROP TABLE IF EXISTS mock_users;
CREATE TABLE mock_users (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    username VARCHAR(255) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Mock Transactions table (for PaymentSystem APIs)
DROP TABLE IF EXISTS mock_transactions;
CREATE TABLE mock_transactions (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    amount DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(10) NOT NULL,
    status VARCHAR(50) DEFAULT 'completed',
    transaction_type VARCHAR(50) DEFAULT 'payment',
    refund_id CHAR(36) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Mock Notifications table (for NotificationSystem APIs)
DROP TABLE IF EXISTS mock_notifications;
CREATE TABLE mock_notifications (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    notification_type VARCHAR(50) NOT NULL, -- 'email' or 'sms'
    recipient VARCHAR(255) NOT NULL, -- email address or phone number
    subject VARCHAR(255) NULL, -- for emails
    message TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'sent',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
