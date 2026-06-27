# 📅 Leave Management System (LMS) Portal

An interactive, modern, and glassmorphic Leave Management System (LMS) designed for tracking, requesting, and approving employee leave requests. The application provides two distinct operational roles (Employees and Administrators) within a sleek dark-themed workspace.

---

## 📋 Overview

The LMS Portal streamlines employee leave workflows with:
- **Interactive Employee Workflows:** Employees can calculate required leave days in real-time, submit requests specifying type (Annual, Sick, Unpaid) and reasons, track request statuses, and view remaining leave balances.
- **Robust Administrative Dashboard:** Administrators can view all pending requests, approve or reject applications with mandatory/optional comments, and see automatically synced system-wide balances.
- **Automatic Leave Balances:** Enforces balance verification for non-unpaid leaves, automatically deducting approved leave days from the employee's allocation.
- **In-App Notifications:** Real-time updates notify users when new requests are submitted (for admins) or when a request gets approved/rejected (for employees).
- **Secure Authentication:** Cookie-based JWT authentication with encrypted passwords (SHA-256) and secure HttpOnly cookie attributes.

---

## ⚙️ Setup

Follow these steps to run the project locally on your machine.

### Prerequisites
- **Node.js** (v18.0.0+ recommended)
- **npm** (comes bundled with Node.js)
- **Docker & Docker Compose** (required to run PostgreSQL)

### Step 1: Clone & Install Dependencies
Navigate to the root directory and install dependencies:
```bash
npm install
```

### Step 2: Configure Environment Variables
Verify or create a file named `.env` in the root folder:
```env
DATABASE_URL="postgresql://username:password@localhost:5433/database_name?schema=public"
JWT_SECRET="your_jwt_secret_here"
```

### Step 3: Run the Database Container
Start the PostgreSQL container using Docker Compose:
```bash
docker compose up -d
```
This spins up a container running PostgreSQL on port `5433` (to avoid collision with local PostgreSQL installations running on default port `5432`).

### Step 4: Database Setup & Prisma Generation
Generate the database client and synchronize the schema:
```bash
# Generate the custom client files
npx prisma generate

# Apply the Prisma schema structure directly to your database
npx prisma db push
```

### Step 5: Start the Development Server
Run the local dev server:
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your web browser to access the LMS Portal.

---

## 🛠️ Tech Stack

The application is built on a modern, high-performance web development stack:

- **Core Framework:** [Next.js v16.2.9](https://nextjs.org) (App Router architecture)
- **Library:** [React v19.2.4](https://react.dev)
- **Database ORM:** [Prisma ORM v7.8.0](https://www.prisma.io)
- **Database Engine:** [PostgreSQL v15](https://www.postgresql.org) (run containerized via Docker Compose)
- **Styling & UI:** [Tailwind CSS v4.0](https://tailwindcss.com) (utility-first styling with modern dark-mode & glassmorphic aesthetics)
- **Icons & Visuals:** [Lucide React](https://lucide.dev)
- **Build & Development Tooling:** TypeScript, TSX, ESLint, Node.js

---

## 🏗️ Architecture

The workspace contains both frontend assets, serverless backend handlers, and database configuration:

### Directory Tree & Key Components

- **Database Configuration & Schema:**
  - [schema.prisma](file:///C:/Users/Irshad/OneDrive/Desktop/company/prisma/schema.prisma): Outlines models for `User`, `LeaveRequest`, and `Notification`. Generates the client library in the local target `./generated-client`.
  - [docker-compose.yml](file:///C:/Users/Irshad/OneDrive/Desktop/company/docker-compose.yml): Configures a local PostgreSQL Docker service (`postgres:15-alpine`) listening on host port `5433`.

- **Core Utilities:**
  - [prisma.ts](file:///C:/Users/Irshad/OneDrive/Desktop/company/lib/prisma.ts): Instantiates and exposes the `PrismaClient` singleton using the `@prisma/adapter-pg` driver.
  - [auth.ts](file:///C:/Users/Irshad/OneDrive/Desktop/company/lib/auth.ts): Provides authentication functions including SHA-256 password hashing and JWT token sign/verify operations.

- **API Route Handlers (Backend):**
  - [signup/route.ts](file:///C:/Users/Irshad/OneDrive/Desktop/company/app/api/auth/signup/route.ts): Registers new users, sets the Default Leave Balance (15 for employees, 0 for admins), and saves a signed token cookie.
  - [login/route.ts](file:///C:/Users/Irshad/OneDrive/Desktop/company/app/api/auth/login/route.ts): Authenticates user credentials and returns a secure session.
  - [logout/route.ts](file:///C:/Users/Irshad/OneDrive/Desktop/company/app/api/auth/logout/route.ts): Clears cookies to end active sessions.
  - [me/route.ts](file:///C:/Users/Irshad/OneDrive/Desktop/company/app/api/auth/me/route.ts): Resolves active token to retrieve the logged-in user profile.
  - [leaves/route.ts](file:///C:/Users/Irshad/OneDrive/Desktop/company/app/api/leaves/route.ts): Handles leave creation (with real-time balance validation) and lists requests filtered by active role context.
  - [[id]/route.ts](file:///C:/Users/Irshad/OneDrive/Desktop/company/app/api/leaves/[id]/route.ts): Handles admin-only decisions (approve/reject leaves, update admin notes, and run transactional database deductions).
  - [notifications/route.ts](file:///C:/Users/Irshad/OneDrive/Desktop/company/app/api/notifications/route.ts): Fetches notifications and marks them as read.

- **Pages & Client Views:**
  - [page.tsx](file:///C:/Users/Irshad/OneDrive/Desktop/company/app/page.tsx): Main interactive landing page showcasing system capabilities, FAQ accordion, and ambient landing designs.
  - [login/page.tsx](file:///C:/Users/Irshad/OneDrive/Desktop/company/app/login/page.tsx): Authentication page providing tab-swappable login and sign-up panels.
  - [dashboard/page.tsx](file:///C:/Users/Irshad/OneDrive/Desktop/company/app/dashboard/page.tsx): Central user workspace combining role-dependent widgets, action dialogs, and state managers.

---

## 🤖 AI Usage - 30%

This application is developed in collaboration with AI assistance, which accounts for approximately **30%** of the codebase contributions. The AI was utilized for:
- Writing custom Prisma schema configurations.
- Scaffold-building standard Next.js route API boilerplate structures (CRUD operations).
- Enhancing styling details using Tailwind CSS (glassmorphism layouts, glowing backdrops, interactive animations).
- Generating security helper methods (SHA-256 hashing and lightweight crypto-signed JWT implementations).

---

## 💡 Assumptions

The system design holds the following core assumptions:
1. **Database Host & Port:** PostgreSQL container port binding `5433` matches the configured port in `.env`.
2. **Leave Allocations:** Employee accounts start with a default balance of `15` days. Admin accounts start with `0` days.
3. **Leave Type Enforcement:** Only `Annual` and `Sick` leave requests check balance limits and deduct from the user's balance on approval. `Unpaid` leaves do not check or deduct from leave allocations.
4. **Calculations:** Requested days count weekends and weekdays equally (simple calendar diff math `(endDate - startDate) + 1`).
5. **Secure Storage:** JWT tokens are stored in the client's browser cookies using standard HTTP-only flags.
6. **Password Storage:** Standard SHA-256 digests are sufficient for local authentication mockups.