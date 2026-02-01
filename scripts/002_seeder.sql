-- 002_seed.sql

-- Insert sample leads
INSERT INTO lead_discovery (name, email, status) VALUES
('Alice', 'alice@example.com', 'new'),
('Bob', 'bob@example.com', 'contacted'),
('Charlie', 'charlie@example.com', 'converted');

-- Assign leads
INSERT INTO lead_management (lead_id, assigned_to, notes) VALUES
(1, 'Manager1', 'Follow up next week'),
(2, 'Manager2', 'Sent proposal'),
(3, 'Manager1', 'Closed deal');

-- Add communication logs
INSERT INTO communication (lead_id, message) VALUES
(1, 'Sent introduction email'),
(2, 'Called via phone'),
(3, 'Signed contract');

-- Add sample places
INSERT INTO places (name, address) VALUES
('HQ Office', '123 Main St, City'),
('Branch Office', '456 Side Rd, City');
