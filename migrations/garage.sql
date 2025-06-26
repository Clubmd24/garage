-- Dev Portal schema

CREATE TABLE IF NOT EXISTS dev_projects (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  status VARCHAR(50) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  created_by INT NOT NULL,
  FOREIGN KEY (created_by) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS dev_tasks (
  id INT PRIMARY KEY AUTO_INCREMENT,
  dev_project_id INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  status VARCHAR(50) DEFAULT 'todo',
  created_by INT NOT NULL,
  assigned_to INT,
  due_date DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (dev_project_id) REFERENCES dev_projects(id) ON DELETE CASCADE,
  FOREIGN KEY (created_by) REFERENCES users(id),
  FOREIGN KEY (assigned_to) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS chat_rooms (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL UNIQUE
);

INSERT IGNORE INTO chat_rooms (id, name) VALUES (1, 'General');

CREATE TABLE IF NOT EXISTS messages (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  room_id BIGINT DEFAULT 1,
  user VARCHAR(80),
  body TEXT,
  s3_key VARCHAR(256),
  content_type VARCHAR(80),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL,
  FOREIGN KEY (room_id) REFERENCES chat_rooms(id)
);

CREATE TABLE IF NOT EXISTS embeddings (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  doc_title VARCHAR(200),
  chunk_no INT,
  txt TEXT,
  vec BLOB NOT NULL
);

CREATE TABLE IF NOT EXISTS task_files (
  id INT PRIMARY KEY AUTO_INCREMENT,
  task_id INT DEFAULT NULL,
  project_id INT DEFAULT NULL,
  s3_key VARCHAR(256) NOT NULL,
  content_type VARCHAR(100),
  uploaded_by INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (task_id) REFERENCES dev_tasks(id) ON DELETE CASCADE,
  FOREIGN KEY (project_id) REFERENCES dev_projects(id) ON DELETE CASCADE,
  FOREIGN KEY (uploaded_by) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS clients (
  id INT PRIMARY KEY AUTO_INCREMENT,
  first_name VARCHAR(255),
  last_name VARCHAR(255),
  email VARCHAR(255) UNIQUE NOT NULL,
  mobile VARCHAR(50),
  landline VARCHAR(50),
  nie_number VARCHAR(100),
  street_address VARCHAR(255),
  town VARCHAR(100),
  province VARCHAR(100),
  post_code VARCHAR(20)
);
