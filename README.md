<p align="center">
  <img src="public/assets/logo.png" alt="Repart Logo" width="96" />
</p>

<h1 align="center">Repart</h1>

<p align="center">
  A modern, high-performance developer intelligence & codebase visualization platform — supporting automated repository analysis, multi-tier layer detection (Frontend, Backend, Database, Auth, Testing), interactive architecture diagrams, API & schema exploration, contribution heatmap analytics, security hygiene audits, and side-by-side developer comparison.
</p>

<p align="center">
  <a href="https://repartgit.netlify.app">Website</a>
  |
  <a href="https://repartgit.netlify.app/dashboard">Dashboard</a>
  |
  <a href="https://repartgit.netlify.app/developers">Developers Page</a>
</p>

<p align="center">
  <a href="https://repartgit.netlify.app">
    <img src="https://img.shields.io/badge/Live_Website-repartgit.netlify.app-00C853?style=for-the-badge&logo=netlify&logoColor=white" alt="Live Website" />
  </a>
  <a href="https://repartgit.netlify.app/dashboard">
    <img src="https://img.shields.io/badge/Dashboard-Open_Platform-111827?style=for-the-badge&logo=react&logoColor=61DAFB" alt="Dashboard" />
  </a>
  <a href="https://github.com/sanketpadhyal/Repart">
    <img src="https://img.shields.io/badge/Repository-Repart_Open_Source-8C6B22?style=for-the-badge&logo=github&logoColor=white" alt="GitHub Repository" />
  </a>
</p>

## Overview

Repart is a full-stack developer intelligence platform engineered to eliminate onboarding friction and help software engineers, recruiters, and engineering leads instantly visualize any software codebase. 

Instead of manually navigating through hundreds of nested directories and thousands of files, developers can analyze any public GitHub repository or connect their GitHub account. Repart automatically inspects directory trees, AST syntax structures, package manifests, and configuration files to build multi-tier architecture diagrams, detect API endpoints, map database schemas, evaluate security hygiene, and calculate real-time developer activity metrics.

This repository contains the open-source codebase for the full-stack web application, interactive dashboard, analysis engine, and API backend.

> [!IMPORTANT]
> **Open Source Notice**
> The **frontend web application, cloud dashboard, codebase scanner, and analysis backend** are 100% open source.
> You can explore the full Repart platform, run the code locally, or contribute directly to the repository at [sanketpadhyal/Repart](https://github.com/sanketpadhyal/Repart).

> [!NOTE]
> **Full Stack Architecture**
> Repart operates as a unified platform: a fast React 19 web dashboard connected to a Node.js Express analysis engine with real-time GitHub REST/GraphQL API data streaming.

## Product Links

| Product Surface | Link |
| --- | --- |
| Live Website | [repartgit.netlify.app](https://repartgit.netlify.app) |
| Cloud Dashboard | [repartgit.netlify.app/dashboard](https://repartgit.netlify.app/dashboard) |
| Developers Page | [repartgit.netlify.app/developers](https://repartgit.netlify.app/developers) |
| GitHub Repository | [sanketpadhyal/Repart](https://github.com/sanketpadhyal/Repart) |

## What Happens During Codebase Analysis

1. Developer logs in via GitHub OAuth or inputs a repository URL into the analysis scanner.
2. Backend receives the repository target and fetches the file tree, package manifests (`package.json`, `Cargo.toml`, `requirements.txt`), and commit history via GitHub API.
3. Codebase scanner evaluates directory conventions and AST file structures.
4. Multi-tier detector classifies source files into Frontend, Backend, Database, Auth, and Testing layers.
5. Endpoint detector extracts REST & GraphQL API methods, paths, and controller functions.
6. Schema scanner identifies database models, entities, fields, and data types (PostgreSQL, Supabase, MongoDB, Prisma).
7. Security engine evaluates secret exposure risks, license configurations, and security hygiene scores (0-100).
8. Velocity engine calculates developer lines of code (LOC), contribution heatmaps, current/longest streaks, and developer archetypes.
9. Interactive architecture topology diagrams and system dependency graphs are generated.
10. Results are rendered instantly on the developer dashboard with live filtering.

## Key Features

### Frontend & Web Dashboard

- **Responsive Single-Page Dashboard**: Dark/Gold curated aesthetics designed for desktop and mobile screens.
- **Interactive Architecture Canvas**: Node-based topology diagrams connecting client UI, Express server, and database layers.
- **API & Schema Explorer**: Endpoint list viewer with HTTP method badges and table schema field breakdowns.
- **GitHub Contribution Heatmap**: Native contribution calendar, Current Streak 🔥, Longest Streak ⚡, and Weekly Velocity metrics.
- **Codebase Security Rating**: Visual score gauge (0-100), automated test density, and vulnerability hygiene checks.
- **Developer Duel (Side-by-Side Comparison)**: Compare two developer accounts or repositories on LOC, stars, commits, and tech stack choices.
- **Developers Page**: Dedicated `/developers` platform page displaying platform specs, architecture details, and open-source repo links.

### Analysis Engine & Backend

- **Automated AST & Manifest Scanner**: Fast tree scanner recognizing React, Node.js, Next.js, Express, Python, Go, Rust, and SQL projects.
- **Security Audit Engine**: Static file scanner inspecting hardcoded token risk and license integrity.
- **Lines of Code (LOC) Calculator**: Aggregates lines of code across entire user portfolios and individual repositories.
- **GitHub API v3/v4 Integration**: Real-time REST and GraphQL integration for accurate user metrics and repo trees.
- **CORS & Rate Limiting Guard**: Built-in rate limiting and strict origin security headers.

## Project Structure

| Directory | Description |
| --- | --- |
| `frontend/` | React 19 web application, single-page dashboard, Recharts visualizer, and public pages |
| `backend/` | Node.js Express 5 backend server, AST scanner, GitHub API proxy, and security audit engine |

## Main Files

### Frontend (`frontend/`)

| File | Purpose |
| --- | --- |
| `src/App.js` | Main application shell, route navigation, and auth redirect sync |
| `src/dashboard/dashboard.tsx` | Main developer dashboard, contribution metrics, and system overview |
| `src/dashboard/repositories.tsx` | Repository grid, search filtering, and project launcher |
| `src/dashboard/analyze/analyze-result.tsx` | Codebase intelligence report, architecture tree, API explorer, and security audit UI |
| `src/dashboard/acc-compare/comparison.tsx` | Account and repository side-by-side comparison engine (Developer Duel) |
| `src/pages/DevelopersPage.jsx` | Open-source specifications, platform details, and creator profile |
| `src/api/api.tsx` | Centralized backend API request helper |

### Backend (`backend/`)

| File | Purpose |
| --- | --- |
| `server.js` | Express 5 REST API server, CORS configuration, and route middleware |
| `routes/analyze.js` | Codebase analysis orchestrator handling repository file scanning and layer detection |
| `routes/github.js` | GitHub REST/GraphQL API proxy, user profile stats, and contribution metrics pipeline |
| `auth/auth.js` | Supabase OAuth callback handler, JWT token issuing, and redirect manager |
| `comparison/acc-compare.js` | Developer account comparison calculator and tech stack matcher |

## Tech Stack

| Component | Technology |
| --- | --- |
| Frontend | React 19, TypeScript, React Router v7, Lucide Icons, Recharts |
| Backend | Node.js, Express 5, Express Rate Limit |
| Storage & Auth | Supabase Auth, PostgreSQL, JWT |
| Data Integration | GitHub REST API v3 & GraphQL API v4 |
| Styling | Custom Vanilla CSS (Design system with Gold/Bronze `#8c6b22` tokens) |
| Hosting | Netlify (Frontend) & Vercel (Backend Serverless) |

## Environment Variables & Credentials Setup

To run Repart locally, create `.env` files in both the `frontend/` and `backend/` directories.

### 1. Frontend Configuration (`frontend/.env`)

```env
REACT_APP_BACKEND_URL=http://localhost:8080
```

### 2. Backend Configuration (`backend/.env`)

Create `backend/.env` using the template below:

```env
PORT=8080
FRONTEND_URL=http://localhost:3000
SUPABASE_URL=https://your-supabase-project.supabase.co
SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
JWT_SECRET=your-long-random-jwt-secret
```

> [!WARNING]
> Do not commit real `.env` files, Supabase service keys, or JWT secrets to GitHub. Keep production credentials configured strictly in your hosting deployment settings.

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### Step 1: Install Dependencies

Install dependencies for the backend service:

```bash
cd backend
npm install
```

Install dependencies for the frontend application:

```bash
cd ../frontend
npm install
```

### Step 2: Configure Environment Variables

1. Create `backend/.env` using `backend/.env.example` as a reference.
2. Create `frontend/.env` with your backend URL.

### Step 3: Start Development Servers

Start the backend service:

```bash
cd backend
npm start
```

In a separate terminal, start the frontend web application:

```bash
cd frontend
npm start
```

Open [http://localhost:3000](http://localhost:3000) in your browser to view the application.

### Step 4: Production Build

```bash
cd frontend
npm run build
```

## Security & Privacy

- All secret keys (`SUPABASE_SERVICE_ROLE_KEY`, `JWT_SECRET`) remain strictly server-side and are never exposed to the client.
- Dynamic CORS origin checking ensures API requests are restricted to authorized frontend domains (`repartgit.netlify.app`, `localhost`).
- User GitHub access tokens are passed in secure request headers and are never persisted in public database tables.
- Rate limiting middleware protects authentication routes and scan endpoints against brute force attempts.

## Developed By

Developed by **Sanket Padhyal**.

- **Personal Website**: [www.sanketpadhyal.in](https://www.sanketpadhyal.in)
- **GitHub**: [@sanketpadhyal](https://github.com/sanketpadhyal)
- **Live Platform**: [repartgit.netlify.app](https://repartgit.netlify.app)
