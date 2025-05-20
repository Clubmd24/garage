# Dev Portal Discussion & Decisions

_This file captures the high-level decisions and context from our ChatGPT session on May 19–20, 2025._

## Authentication & User Management
- **JWT-based auth**  
  - `POST /api/auth/login` issues token  
  - `GET /api/auth/me` validates session  
- **Login UI** at `pages/login.js` with light/dark theme toggle  
- **Admin Users Management**  
  - UI in `pages/admin/users.js` using a shared `Card` component  
  - Endpoints:  
    - `GET /api/admin/users` → list users  
    - `POST /api/admin/users` → create user + assign role  
    - `DELETE /api/admin/users/[id]` → delete user and role mapping  

## Design & Front-End
- **`components/Card.js`** for consistent rounded-2xl, shadow-xl, padding styling  
- **Tailwind CSS** with CSS variables (`--color-bg`, `--color-surface`, `--color-text-primary`, etc.)  
- Responsive grid layouts and overflow handling for tables  

## Database Schema
- **Core tables:**  
  - `users (id, username, email, password_hash, created_at)`  
  - `roles (id, name)`  
  - `user_roles (user_id, role_id)`  
- **Dev Portal tables:**  
  - `dev_projects (id, name, description, status, created_at, created_by)`  
  - `dev_tasks (id, dev_project_id, title, description, status, assignee_id, due_date)`  

## Dev Portal API
- **Projects** (`pages/api/dev/projects`):  
  - `index.js` → GET list, POST create  
  - `[id].js` → GET one, PUT update, DELETE  
- **Tasks** (`pages/api/dev/tasks`):  
  - `index.js` → GET list (opt. `project_id`), POST create  
  - `[id].js` → GET one, PUT update, DELETE  

## Environment & Infrastructure
- **Heroku** auto-deploy from `main`  
- **MariaDB** on AWS RDS (`DATABASE_URL`)  
- **AWS S3** for file storage (`S3_BUCKET`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_REGION`)  
- **OpenAI** integration (`OPENAI_API_KEY`)  
- Secrets managed in **GitHub Codespaces** & **Actions**

## GitHub Integration
- **ChatGPT GitHub App** installed  
- Trigger AI review via PR comments:  
