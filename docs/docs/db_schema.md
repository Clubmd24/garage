# Database Schema Documentation

## Table: `cameras`

| Column | Definition |
|--------|------------|
| `id` | int(11) NOT NULL AUTO_INCREMENT |
| `type` | varchar(50) DEFAULT NULL |
| `poe_port` | varchar(50) DEFAULT NULL |
| `location` | varchar(255) DEFAULT NULL |
| `description` | text DEFAULT NULL |

## Table: `checklist_logs`

| Column | Definition |
|--------|------------|
| `id` | int(11) NOT NULL AUTO_INCREMENT |
| `job_id` | int(11) NOT NULL |
| `template_id` | int(11) NOT NULL |
| `status` | varchar(50) DEFAULT NULL |
| `ts` | datetime DEFAULT current_timestamp() |
| `camera_id` | int(11) DEFAULT NULL |

## Table: `checklist_templates`

| Column | Definition |
|--------|------------|
| `id` | int(11) NOT NULL AUTO_INCREMENT |
| `name` | varchar(100) NOT NULL |
| `description` | text DEFAULT NULL |
| `step_order` | int(11) DEFAULT NULL |

## Table: `contracts`

| Column | Definition |
|--------|------------|
| `id` | int(11) NOT NULL AUTO_INCREMENT |
| `employee_id` | int(11) DEFAULT NULL |
| `contract_type` | varchar(100) DEFAULT NULL |
| `file_path` | varchar(255) DEFAULT NULL |
| `start_date` | date DEFAULT NULL |
| `end_date` | date DEFAULT NULL |

## Table: `customers`

| Column | Definition |
|--------|------------|
| `id` | int(11) NOT NULL AUTO_INCREMENT |
| `name` | varchar(255) DEFAULT NULL |
| `contact_info` | longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`contact_info`)) |
| `billing_details` | longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`billing_details`)) |

## Table: `dev_ai_agents`

| Column | Definition |
|--------|------------|
| `id` | int(11) NOT NULL AUTO_INCREMENT |
| `name` | varchar(100) NOT NULL |
| `system_prompt` | text NOT NULL |
| `created_at` | datetime DEFAULT current_timestamp() |

## Table: `dev_ai_conversations`

| Column | Definition |
|--------|------------|
| `id` | int(11) NOT NULL AUTO_INCREMENT |
| `dev_project_id` | int(11) NOT NULL |
| `agent_id` | int(11) NOT NULL |
| `started_at` | datetime DEFAULT current_timestamp() |
| `fk_dev_convo_project` | (`dev_project_id`) |
| `fk_dev_convo_agent` | (`agent_id`) |
| `fk_dev_convo_agent` | FOREIGN KEY (`agent_id`) REFERENCES `dev_ai_agents` (`id`) ON UPDATE CASCADE |
| `fk_dev_convo_project` | FOREIGN KEY (`dev_project_id`) REFERENCES `dev_projects` (`id`) ON DELETE CASCADE ON UPDATE CASCADE |

## Table: `dev_ai_messages`

| Column | Definition |
|--------|------------|
| `id` | int(11) NOT NULL AUTO_INCREMENT |
| `conversation_id` | int(11) NOT NULL |
| `sender_type` | enum('user' |
| `agent_id` | int(11) DEFAULT NULL |
| `content` | text NOT NULL |
| `created_at` | datetime DEFAULT current_timestamp() |
| `fk_dev_msg_conversation` | (`conversation_id`) |
| `fk_dev_msg_agent` | (`agent_id`) |
| `fk_dev_msg_agent` | FOREIGN KEY (`agent_id`) REFERENCES `dev_ai_agents` (`id`) ON DELETE SET NULL ON UPDATE CASCADE |
| `fk_dev_msg_conversation` | FOREIGN KEY (`conversation_id`) REFERENCES `dev_ai_conversations` (`id`) ON DELETE CASCADE ON UPDATE CASCADE |

## Table: `dev_documents`

| Column | Definition |
|--------|------------|
| `id` | int(11) NOT NULL AUTO_INCREMENT |
| `dev_project_id` | int(11) NOT NULL |
| `uploader_id` | int(11) NOT NULL |
| `filename` | varchar(512) NOT NULL |
| `url` | text NOT NULL |
| `uploaded_at` | datetime DEFAULT current_timestamp() |
| `fk_dev_docs_project` | (`dev_project_id`) |
| `fk_dev_docs_project` | FOREIGN KEY (`dev_project_id`) REFERENCES `dev_projects` (`id`) ON DELETE CASCADE ON UPDATE CASCADE |

## Table: `dev_messages`

| Column | Definition |
|--------|------------|
| `id` | int(11) NOT NULL AUTO_INCREMENT |
| `dev_thread_id` | int(11) NOT NULL |
| `author_id` | int(11) NOT NULL |
| `content` | text NOT NULL |
| `created_at` | datetime DEFAULT current_timestamp() |
| `fk_dev_thread_msgs` | (`dev_thread_id`) |
| `fk_dev_thread_msgs` | FOREIGN KEY (`dev_thread_id`) REFERENCES `dev_threads` (`id`) ON DELETE CASCADE ON UPDATE CASCADE |

## Table: `dev_projects`

| Column | Definition |
|--------|------------|
| `id` | int(11) NOT NULL AUTO_INCREMENT |
| `name` | varchar(255) NOT NULL |
| `description` | text DEFAULT NULL |
| `status` | varchar(50) DEFAULT 'active' |
| `created_at` | datetime DEFAULT current_timestamp() |
| `created_by` | int(11) NOT NULL |
| `updated_at` | datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp() |

## Table: `dev_tasks`

| Column | Definition |
|--------|------------|
| `id` | int(11) NOT NULL AUTO_INCREMENT |
| `dev_project_id` | int(11) NOT NULL |
| `title` | varchar(255) NOT NULL |
| `description` | text DEFAULT NULL |
| `assignee_id` | int(11) DEFAULT NULL |
| `status` | varchar(50) DEFAULT 'todo' |
| `created_by` | int(11) NOT NULL |
| `assigned_to` | int(11) DEFAULT NULL |
| `due_date` | date DEFAULT NULL |
| `created_at` | datetime DEFAULT current_timestamp() |
| `fk_dev_tasks_project` | (`dev_project_id`) |
| `fk_dev_tasks_assigned_to` | (`assigned_to`) |
| `fk_dev_tasks_created_by` | (`created_by`) |
| `fk_dev_tasks_assigned_to` | FOREIGN KEY (`assigned_to`) REFERENCES `users` (`id`) |
| `fk_dev_tasks_created_by` | FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) |
| `fk_dev_tasks_project` | FOREIGN KEY (`dev_project_id`) REFERENCES `dev_projects` (`id`) ON DELETE CASCADE ON UPDATE CASCADE |

## Table: `dev_threads`

| Column | Definition |
|--------|------------|
| `id` | int(11) NOT NULL AUTO_INCREMENT |
| `dev_project_id` | int(11) NOT NULL |
| `title` | varchar(255) NOT NULL |
| `created_by` | int(11) NOT NULL |
| `created_at` | datetime DEFAULT current_timestamp() |
| `fk_dev_threads_project` | (`dev_project_id`) |
| `fk_dev_threads_project` | FOREIGN KEY (`dev_project_id`) REFERENCES `dev_projects` (`id`) ON DELETE CASCADE ON UPDATE CASCADE |

## Table: `driver_tasks`

| Column | Definition |
|--------|------------|
| `id` | int(11) NOT NULL AUTO_INCREMENT |
| `job_id` | int(11) DEFAULT NULL |
| `driver_id` | int(11) DEFAULT NULL |
| `task_type` | varchar(50) DEFAULT NULL |
| `status` | varchar(50) DEFAULT NULL |
| `ts` | datetime DEFAULT current_timestamp() |

## Table: `emergency_contacts`

| Column | Definition |
|--------|------------|
| `id` | int(11) NOT NULL AUTO_INCREMENT |
| `employee_id` | int(11) DEFAULT NULL |
| `name` | varchar(255) DEFAULT NULL |
| `relationship` | varchar(100) DEFAULT NULL |
| `phone` | varchar(50) DEFAULT NULL |

## Table: `event_logs`

| Column | Definition |
|--------|------------|
| `id` | int(11) NOT NULL AUTO_INCREMENT |
| `event_id` | int(11) NOT NULL |
| `job_id` | int(11) DEFAULT NULL |
| `processed_ts` | datetime DEFAULT current_timestamp() |
| `result` | longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`result`)) |

## Table: `events`

| Column | Definition |
|--------|------------|
| `id` | int(11) NOT NULL AUTO_INCREMENT |
| `camera_id` | int(11) DEFAULT NULL |
| `ts` | datetime DEFAULT current_timestamp() |
| `event_type` | varchar(50) DEFAULT NULL |
| `metadata` | longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`metadata`)) |

## Table: `fleets`

| Column | Definition |
|--------|------------|
| `id` | int(11) NOT NULL AUTO_INCREMENT |
| `company_name` | varchar(255) DEFAULT NULL |
| `account_rep` | varchar(255) DEFAULT NULL |
| `payment_terms` | text DEFAULT NULL |

## Table: `hardware_kit_items`

| Column | Definition |
|--------|------------|
| `id` | int(11) NOT NULL AUTO_INCREMENT |
| `kit_id` | int(11) NOT NULL |
| `part_id` | int(11) NOT NULL |
| `qty` | int(11) DEFAULT NULL |

## Table: `hardware_kits`

| Column | Definition |
|--------|------------|
| `id` | int(11) NOT NULL AUTO_INCREMENT |
| `name` | varchar(100) DEFAULT NULL |
| `description` | text DEFAULT NULL |
| `created_ts` | datetime DEFAULT current_timestamp() |

## Table: `holiday_requests`

| Column | Definition |
|--------|------------|
| `id` | int(11) NOT NULL AUTO_INCREMENT |
| `employee_id` | int(11) DEFAULT NULL |
| `start_date` | date DEFAULT NULL |
| `end_date` | date DEFAULT NULL |
| `status` | varchar(50) DEFAULT NULL |
| `created_ts` | datetime DEFAULT current_timestamp() |

## Table: `invoice_items`

| Column | Definition |
|--------|------------|
| `id` | int(11) NOT NULL AUTO_INCREMENT |
| `invoice_id` | int(11) NOT NULL |
| `description` | text DEFAULT NULL |
| `qty` | int(11) DEFAULT NULL |
| `unit_price` | decimal(10 |

## Table: `invoices`

| Column | Definition |
|--------|------------|
| `id` | int(11) NOT NULL AUTO_INCREMENT |
| `job_id` | int(11) DEFAULT NULL |
| `customer_id` | int(11) DEFAULT NULL |
| `amount` | decimal(10 |
| `due_date` | date DEFAULT NULL |
| `status` | varchar(50) DEFAULT NULL |
| `created_ts` | datetime DEFAULT current_timestamp() |

## Table: `job_assignments`

| Column | Definition |
|--------|------------|
| `id` | int(11) NOT NULL AUTO_INCREMENT |
| `job_id` | int(11) NOT NULL |
| `user_id` | int(11) NOT NULL |
| `assigned_at` | datetime DEFAULT current_timestamp() |

## Table: `jobs`

| Column | Definition |
|--------|------------|
| `id` | int(11) NOT NULL AUTO_INCREMENT |
| `customer_id` | int(11) DEFAULT NULL |
| `vehicle_id` | int(11) DEFAULT NULL |
| `scheduled_start` | datetime DEFAULT NULL |
| `scheduled_end` | datetime DEFAULT NULL |
| `status` | varchar(50) DEFAULT NULL |
| `bay` | varchar(50) DEFAULT NULL |
| `created_at` | datetime DEFAULT current_timestamp() |

## Table: `maintenance`

| Column | Definition |
|--------|------------|
| `id` | int(11) NOT NULL AUTO_INCREMENT |
| `vehicle_id` | int(11) NOT NULL |
| `date` | date NOT NULL DEFAULT curdate() |
| `description` | varchar(255) DEFAULT NULL |
| `fk_maintenance_vehicles` | (`vehicle_id`) |
| `fk_maintenance_vehicles` | FOREIGN KEY (`vehicle_id`) REFERENCES `vehicles` (`id`) ON DELETE CASCADE ON UPDATE CASCADE |

## Table: `medical_certificates`

| Column | Definition |
|--------|------------|
| `id` | int(11) NOT NULL AUTO_INCREMENT |
| `employee_id` | int(11) DEFAULT NULL |
| `cert_file` | varchar(255) DEFAULT NULL |
| `expiry_date` | date DEFAULT NULL |
| `created_ts` | datetime DEFAULT current_timestamp() |

## Table: `notification_logs`

| Column | Definition |
|--------|------------|
| `id` | int(11) NOT NULL AUTO_INCREMENT |
| `notification_id` | int(11) NOT NULL |
| `channel` | varchar(50) DEFAULT NULL |
| `provider_msg_id` | varchar(255) DEFAULT NULL |
| `delivered_ts` | datetime DEFAULT NULL |
| `status` | varchar(50) DEFAULT NULL |

## Table: `notifications`

| Column | Definition |
|--------|------------|
| `id` | int(11) NOT NULL AUTO_INCREMENT |
| `job_id` | int(11) DEFAULT NULL |
| `user_id` | int(11) DEFAULT NULL |
| `type` | varchar(50) DEFAULT NULL |
| `payload` | longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`payload`)) |
| `created_ts` | datetime DEFAULT current_timestamp() |
| `status` | varchar(50) DEFAULT NULL |

## Table: `parts`

| Column | Definition |
|--------|------------|
| `id` | int(11) NOT NULL AUTO_INCREMENT |
| `part_number` | varchar(100) NOT NULL |
| `description` | text DEFAULT NULL |
| `unit_cost` | decimal(10 |
| `part_number` | (`part_number`) |

## Table: `payments`

| Column | Definition |
|--------|------------|
| `id` | int(11) NOT NULL AUTO_INCREMENT |
| `invoice_id` | int(11) NOT NULL |
| `amount` | decimal(10 |
| `method` | varchar(50) DEFAULT NULL |
| `transaction_ref` | varchar(255) DEFAULT NULL |
| `paid_ts` | datetime DEFAULT current_timestamp() |

## Table: `payslips`

| Column | Definition |
|--------|------------|
| `id` | int(11) NOT NULL AUTO_INCREMENT |
| `employee_id` | int(11) DEFAULT NULL |
| `period` | date DEFAULT NULL |
| `file_path` | varchar(255) DEFAULT NULL |
| `created_ts` | datetime DEFAULT current_timestamp() |

## Table: `performance`

| Column | Definition |
|--------|------------|
| `id` | int(11) NOT NULL AUTO_INCREMENT |
| `vehicle_id` | int(11) NOT NULL |
| `date` | date NOT NULL DEFAULT curdate() |
| `metrics` | longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`metrics`)) |
| `fk_performance_vehicles` | (`vehicle_id`) |
| `fk_performance_vehicles` | FOREIGN KEY (`vehicle_id`) REFERENCES `vehicles` (`id`) ON DELETE CASCADE ON UPDATE CASCADE |

## Table: `pricing_plans`

| Column | Definition |
|--------|------------|
| `id` | int(11) NOT NULL AUTO_INCREMENT |
| `name` | varchar(100) DEFAULT NULL |
| `monthly_fee` | decimal(10 |
| `features_json` | longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`features_json`)) |

## Table: `quotes`

| Column | Definition |
|--------|------------|
| `id` | int(11) NOT NULL AUTO_INCREMENT |
| `customer_id` | int(11) DEFAULT NULL |
| `job_id` | int(11) DEFAULT NULL |
| `total_amount` | decimal(10 |
| `status` | varchar(50) DEFAULT NULL |
| `created_ts` | datetime DEFAULT current_timestamp() |

## Table: `reminders`

| Column | Definition |
|--------|------------|
| `id` | int(11) NOT NULL AUTO_INCREMENT |
| `job_id` | int(11) DEFAULT NULL |
| `user_id` | int(11) DEFAULT NULL |
| `message` | text DEFAULT NULL |
| `scheduled_ts` | datetime DEFAULT NULL |
| `sent_ts` | datetime DEFAULT NULL |
| `status` | varchar(50) DEFAULT NULL |

## Table: `roles`

| Column | Definition |
|--------|------------|
| `id` | int(11) NOT NULL AUTO_INCREMENT |
| `name` | varchar(50) NOT NULL |
| `name` | (`name`) |

## Table: `sessions`

| Column | Definition |
|--------|------------|
| `id` | int(11) NOT NULL AUTO_INCREMENT |
| `user_id` | int(11) NOT NULL |
| `token` | varchar(255) NOT NULL |
| `created_at` | datetime DEFAULT current_timestamp() |
| `expires_at` | datetime NOT NULL |
| `token` | (`token`) |

## Table: `sick_leaves`

| Column | Definition |
|--------|------------|
| `id` | int(11) NOT NULL AUTO_INCREMENT |
| `employee_id` | int(11) DEFAULT NULL |
| `date` | date DEFAULT NULL |
| `notes` | text DEFAULT NULL |
| `status` | varchar(50) DEFAULT NULL |
| `created_ts` | datetime DEFAULT current_timestamp() |

## Table: `stock_levels`

| Column | Definition |
|--------|------------|
| `id` | int(11) NOT NULL AUTO_INCREMENT |
| `part_id` | int(11) NOT NULL |
| `quantity` | int(11) DEFAULT 0 |

## Table: `stock_transactions`

| Column | Definition |
|--------|------------|
| `id` | int(11) NOT NULL AUTO_INCREMENT |
| `part_id` | int(11) NOT NULL |
| `job_id` | int(11) DEFAULT NULL |
| `qty` | int(11) DEFAULT NULL |
| `transaction_type` | varchar(50) DEFAULT NULL |
| `ts` | datetime DEFAULT current_timestamp() |

## Table: `time_entries`

| Column | Definition |
|--------|------------|
| `id` | int(11) NOT NULL AUTO_INCREMENT |
| `job_id` | int(11) NOT NULL |
| `user_id` | int(11) NOT NULL |
| `start_ts` | datetime DEFAULT NULL |
| `end_ts` | datetime DEFAULT NULL |
| `duration` | time DEFAULT NULL |

## Table: `user_roles`

| Column | Definition |
|--------|------------|
| `user_id` | int(11) NOT NULL |
| `role_id` | int(11) NOT NULL |

## Table: `users`

| Column | Definition |
|--------|------------|
| `id` | int(11) NOT NULL AUTO_INCREMENT |
| `username` | varchar(100) NOT NULL |
| `email` | varchar(255) NOT NULL |
| `password_hash` | varchar(255) NOT NULL |
| `created_at` | datetime DEFAULT current_timestamp() |
| `username` | (`username`) |
| `email` | (`email`) |

## Table: `vehicles`

| Column | Definition |
|--------|------------|
| `id` | int(11) NOT NULL AUTO_INCREMENT |
| `license_plate` | varchar(20) NOT NULL |
| `make` | varchar(50) DEFAULT NULL |
| `model` | varchar(50) DEFAULT NULL |
| `color` | varchar(30) DEFAULT NULL |
| `customer_id` | int(11) DEFAULT NULL |
| `fleet_id` | int(11) DEFAULT NULL |
| `license_plate` | (`license_plate`) |

## Table: `virtual_titles`

| Column | Definition |
|--------|------------|
| `id` | int(11) NOT NULL AUTO_INCREMENT |
| `job_id` | int(11) NOT NULL |
| `data_payload` | longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`data_payload`)) |
| `status` | varchar(50) DEFAULT NULL |
| `created_ts` | datetime DEFAULT current_timestamp() |