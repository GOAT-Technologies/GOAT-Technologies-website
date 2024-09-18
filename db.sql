CREATE TABLE form_submissions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    company VARCHAR(255),
    country VARCHAR(100),
    phone_number VARCHAR(20),
    city VARCHAR(100),
    enquiry_for VARCHAR(255),
    message TEXT,
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
