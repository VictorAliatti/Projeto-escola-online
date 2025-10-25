[Leia em Português-BR](README-pt-BR.md)

---

# Project: Escola Online (Full-Stack Platform)

Welcome to the Escola Online project, a full-stack e-learning web platform built from scratch. This project simulates a professional online school environment, focusing on a **secure authentication** flow and a **multi-step onboarding process** to collect detailed student and guardian data, ensuring data separation and security.

This project is being built with the goal of learning and applying back-end, front-end, and database web development concepts in a real-world scenario.

## Project Status

**In Development.**

The project's foundation (authentication and user onboarding) is complete. The next phase (Phase 8) will involve creating and displaying course content.

## Features

* **Secure User Authentication:**
    * **Registration:** Account creation with name, email, and password.
    * **Password Encryption:** Passwords are hashed using `bcrypt` before being saved to the database. Plain-text passwords are never stored.
    * **Login:** User authentication that compares the provided password against the stored hash.
    * **Token-Based Authentication (JWT):** Upon successful login, the server generates a JSON Web Token (JWT) that is stored on the Front-End (`localStorage`).
    * **Protected Routes:** Access to sensitive areas (like the Dashboard and Profile) is protected by a security *middleware* that validates the JWT.
    * **Secure Logout:** The "Sair" (Logout) function destroys the JWT from `localStorage`, invalidating the user's session.

* **Two-Step Onboarding Flow:**
    1.  **Step 1 (Quick Registration):** The user creates their login account (name, email, password). The system flags them internally as `perfil_completo = false`.
    2.  **Step 2 (Forced Onboarding):** Upon their first login, the security system (Front-End + Back-End) identifies the incomplete profile and **forcefully redirects** the user to a "Complete Profile" page.
    3.  **Detailed Data Collection:** The user fills out an extensive 17-field form with personal, academic, and guardian information.
    4.  **Status Update:** Upon saving the form, the system updates the user's flag to `perfil_completo = true`.
    5.  **Access Granted:** In all future logins, the system will see `perfil_completo = true` and grant them immediate access to the main Dashboard.

* **Data Security (Database Design):**
    * **Authentication** data (`usuarios`) is stored in a separate table from **sensitive personal data** (`aluno_detalhes`).
    * This minimizes the risk of exposing sensitive data (like CPF or address) in the event of an attack focused on the authentication logic.

## Architecture and Tech Stack

This project uses a decoupled 3-tier architecture (Front-End, Back-End, Database).

### 1. Front-End

The Front-End is built with the "Vanilla Stack" (no frameworks) to focus on web fundamentals.

* **HTML5:** Semantic structure for all pages.
* **CSS3:** Centralized styling (`estilo.css`) and responsiveness (using Media Queries).
* **JavaScript (ES6+):**
    * **`fetch` API:** Used for all asynchronous communication with the Back-End.
    * **`async/await`:** Used to manage the request flow.
    * **`localStorage`:** Used to store and manage the JWT.
    * **DOM Manipulation:** Responsible for displaying error/success messages and handling dynamic redirects.

### 2. Back-End

The Back-End is a RESTful API built on Node.js.

* **`Node.js`:** Server-side JavaScript runtime.
* **`Express.js`:** Framework for managing routes, middleware, and HTTP requests.
* **`jsonwebtoken` (JWT):** For creating and verifying authentication tokens.
* **`bcrypt`:** For hashing and comparing user passwords.
* **`pg` (node-postgres):** Driver for communication between Node.js and the PostgreSQL database.
* **`cors`:** Middleware to allow cross-origin communication between the Front-End and Back-End.

### 3. Database

* **`PostgreSQL`:** A robust, enterprise-grade Relational Database Management System (RDBMS).
* **`pgAdmin 4`:** GUI tool used for database modeling and management.

## Data Model (Database Schema)

The `escola_online` database has two main related tables:

### Table: `usuarios` (Users)

Stores authentication data and the onboarding "flag".

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `bigserial` | **Primary Key** | Unique user identifier. |
| `nome` | `character varying` | Not NULL | User's name (from initial registration). |
| `email` | `character varying` | Not NULL, **Unique**| User's login email (must be unique). |
| `senha_hash`| `character varying` | Not NULL | `bcrypt`-hashed password. |
| `perfil_completo`| `boolean` | Not NULL, **Default: false**| "Flag" that controls the onboarding flow. |

### Table: `aluno_detalhes` (Student Details)

Stores the sensitive and personal data from the "onboarding form".

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `bigserial` | **Primary Key** | Unique form identifier. |
| `usuario_id`| `bigint` | Not NULL, **Foreign Key** | The "hook" that links this form to the `id` in the `usuarios` table. |
| `cpf_aluno` | `character varying` | | Student's CPF (Brazilian ID). |
| `data_nascimento` | `date` | | Student's date of birth. |
| `contato_aluno`| `character varying` | | |
| `cidade_uf_aluno` | `character varying` | | |
| `endereco_aluno`| `character varying` | | |
| `tipo_escola` | `character varying` | | (e.g., Public or Private) |
| `nome_escola` | `character varying` | | |
| `ano_escola` | `character varying` | | (e.g., "6th Grade") |
| `info_importantes` | `text` | | (Long text field for notes). |
| `nome_responsavel` | `character varying` | Not NULL | Guardian's name. |
| `cpf_responsavel` | `character varying` | | |
| `parentesco` | `character varying` | | (e.g., "Mother", "Father") |
| `contato_responsavel`| `character varying` | Not NULL | |
| `endereco_responsavel`| `character varying` | | |
| `cidade_uf_responsavel`| `character varying` | | |

## API Documentation (Endpoints)

Below are the API routes created in `server.js`:

| Method | Endpoint | Protected? | Description |
| :--- | :--- | :--- | :--- |
| **`POST`** | `/cadastro` | **No** | Receives `nome`, `email`, `senha`. Creates a new user in the `usuarios` table with `perfil_completo = false`. |
| **`POST`** | `/login` | **No** | Receives `email`, `senha`. Compares the password with the stored hash. On success, returns a JWT. |
| **`GET`** | `/api/perfil` | **Yes (JWT)** | Verification route. Validates the JWT, queries the DB for the user, and returns their data (including `perfil_completo`). |
| **`POST`** | `/api/completar-perfil` | **Yes (JWT)** | Receives the 17-field form. Uses the `id` from the JWT to: **1.** Start a Transaction; **2.** `INSERT` into `aluno_detalhes`; **3.** `UPDATE` the `usuarios` table to `perfil_completo = true`; **4.** `COMMIT` the Transaction. |

## How to Run Locally

1.  **Clone the Repository**
    ```bash
    git clone [https://github.com/VictorAliatti/Projeto-escola-online.git]
    cd [Escola-Online]
    ```

2.  **Configure the Database (PostgreSQL)**
    * Open `pgAdmin 4`.
    * Create a new Database named `escola_online`.
    * Open the "Query Tool" for this database.
    * Run the following SQL scripts to create the tables:

    ```sql
    -- Script to create 'usuarios' table
    CREATE TABLE public.usuarios (
        id bigserial NOT NULL,
        nome varchar NOT NULL,
        email varchar NOT NULL,
        senha_hash varchar NOT NULL,
        perfil_completo boolean NOT NULL DEFAULT false,
        CONSTRAINT usuarios_email_key UNIQUE (email),
        CONSTRAINT usuarios_pkey PRIMARY KEY (id)
    );

    -- Script to create 'aluno_detalhes' table
    CREATE TABLE public.aluno_detalhes (
        id bigserial NOT NULL,
        usuario_id bigint NOT NULL,
        cpf_aluno varchar NULL,
        data_nascimento date NULL,
        contato_aluno varchar NULL,
        cidade_uf_aluno varchar NULL,
        endereco_aluno varchar NULL,
        tipo_escola varchar NULL,
        nome_escola varchar NULL,
        ano_escola varchar NULL,
        info_importantes text NULL,
        nome_responsavel varchar NOT NULL,
        cpf_responsavel varchar NULL,
        parentesco varchar NULL,
        contato_responsavel varchar NOT NULL,
        endereco_responsavel varchar NULL,
        cidade_uf_responsavel varchar NULL,
        CONSTRAINT aluno_detalhes_pkey PRIMARY KEY (id),
        CONSTRAINT fk_aluno_usuario FOREIGN KEY (usuario_id) REFERENCES public.usuarios(id)
    );
    ```

3.  **Configure the Back-End**
    * Navigate to the back-end folder: `cd Escola-Online-Backend`
    * Install dependencies: `npm install`
    * **Important:** Open the `server.js` file in your editor.
    * Find the `new Pool({...})` object.
    * Update the `password: 'YOUR_POSTGRES_PASSWORD'` field with the password you created when you installed PostgreSQL.

4.  **Run the Back-End**
    * In your terminal, inside the `Escola-Online-Backend` folder, run:
    ```bash
    npm run dev
    ```
    * The server will be running on `http://localhost:3000`.

5.  **Run the Front-End**
    * Navigate to the `Escola-online-FrontEnd` folder.
    * Double-click the `index.html` (or `cadastro.html`) file to open the application in your browser.

## Future Features (Roadmap)

* **Phase 8 (Content):** Create `cursos` (courses) and `aulas` (lessons) tables. Build API routes to fetch and display courses on the dashboard for completed profiles.
* **Phase 9 (Gamification):** Implement the "Duolingo" vision (avatars, point system, badges) with new database tables.
* **Phase 10 (Payments):** Integrate a Payment Gateway (like Stripe or Mercado Pago) to manage access to courses.