# 🤖 Agentflow_AI — Autonomous AI Operations Automation Platform

> **Agentflow_AI** is a full-stack AI Operations Automation Platform that turns natural language automation requirements into executable visual workflows. It orchestrates execution through a cooperative chain of 5 specialized AI agents, integrates with third-party tools (Gmail, Slack, Discord, Google Sheets) over encrypted OAuth, queues background jobs with BullMQ and in-memory fallbacks, and streams live telemetry to an interactive React Flow canvas over WebSockets.

---

## 🌟 Key Capabilities

1. **AI-Powered Natural Language Builder**:
   - Describe automations in plain English (e.g., *"When a customer emails an urgent support inquiry, classify sentiment with AI and alert Slack"*).
   - Generates fully wired DAG workflows with positioned nodes, typed handles, and animated edges.
   - Multi-tier provider support: **OpenRouter** &rarr; **Google Gemini** &rarr; **Deterministic Rule-Based Builder**.

2. **5-Agent Multi-Agent Orchestration Chain**:
   - 🧭 **Planner Agent**: Performs topological sort on the workflow DAG, resolves dependencies, and scores plan confidence.
   - ⚡ **Execution Agent**: Executes node-by-node, resolves dynamic template interpolations (`{{node_1.output.body}}`), and dispatches integration calls.
   - 🛡️ **Validation Agent**: Enforces output schema compliance, validates payload integrity, and guarantees contract correctness.
   - 🔄 **Recovery Agent**: Classifies failure modes (`MISSING_FIELDS`, `API_FAILURE`, `AUTH_EXPIRED`, `RATE_LIMIT`, `TRANSIENT`) and applies exponential backoff or escalation.
   - 📊 **Monitoring Agent**: Emits structured timeline logs into MongoDB, updates shared `AgentMemory`, and streams real-time telemetry over WebSockets.

3. **Interactive React Flow Studio**:
   - Drag-and-drop node palette (Triggers, AI Agents, Integrations, Logic & Flow Control).
   - Real-time parameter inspector drawer.
   - Live execution indicators, pulsing node highlights, and progress tracking.

4. **Third-Party Integrations & Security**:
   - Connectors for **Gmail**, **Slack**, **Discord**, and **Google Sheets**.
   - AES-256-GCM application-level credential encryption at rest (`CREDENTIAL_ENCRYPTION_KEY`).
   - High-fidelity simulated sandbox fallbacks for instant local testing without live API keys.

5. **Zero-Setup Local Runtime**:
   - Automatic **In-Memory MongoDB** fallback (`mongodb-memory-server`) — no external MongoDB installation required!
   - Automatic **In-Memory Async Queue** fallback — no Redis installation required!

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | Next.js (Pages Router), React 19, Tailwind CSS, Zustand, React Flow (`@xyflow/react`), Socket.IO Client, Axios, Lucide Icons |
| **Backend** | Node.js, Express.js, MongoDB (Mongoose), Socket.IO, BullMQ, Redis (ioredis), Helmet, Morgan, Compression, Express-Validator, Bcrypt.js |
| **AI Layer** | OpenRouter API (`anthropic/claude-3.5-sonnet`), Google Generative AI SDK (`@google/generative-ai`), Local Deterministic Rule-Based Builder |
| **Security** | JWT authentication, Bcrypt (cost 12), AES-256-GCM encrypted tokens, Rate Limiting, CORS |

---

## 🚀 Quick Start Guide (Local Development)

### 1. Prerequisites
- **Node.js**: `v18.0.0` or later (`node -v`)
- **npm**: `v9.0.0` or later (`npm -v`)

---

### 2. Clone / Open Project Directory
```bash
cd "project folder"
```

---

### 3. Start Backend Server

Open a terminal and run:

```bash
cd server
npm install
npm run dev
```

*The backend server will start on **`http://localhost:5000`**.*
- Automatically connects to an in-memory MongoDB instance and seeds demo users & workflows.
- Socket.IO WebSocket server ready for live event streaming.

---

### 4. Start Frontend Client

Open a second terminal and run:

```bash
cd client
npm install
npm run dev
```

*The frontend Next.js application will start on **`http://localhost:3000`**.*

---

### 5. Access the Platform

Open your browser and navigate to: **[http://localhost:3000](http://localhost:3000)**

---

## 🔑 Pre-Seeded Demonstration Accounts

The platform automatically seeds demo accounts on first launch:

| Role | Email | Password | Access Level |
|---|---|---|---|
| **Lead Operator** | `operator@agentflow.ai` | `OperatorPass123!` | Full workflow building, DAG editing, executions & integrations |
| **Administrator** | `admin@agentflow.ai` | `AdminPass123!` | System configuration, diagnostics & operator management |

> 💡 *On the `/login` page, you can click the **Operator Demo** or **Admin Demo** buttons to autofill credentials instantly!*

---

## 📂 Project Structure

```
project folder/
├── client/                     # Next.js Pages Router Frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── AppShell/       # Header, Sidebar, Live socket badge, User profile
│   │   │   ├── MetricGrid/     # Dashboard analytics & success rate cards
│   │   │   ├── NodePalette/    # Categorized drag-and-drop tool palette
│   │   │   ├── NodeConfigPanel/# Dynamic parameter inspector drawer
│   │   │   ├── WorkflowCanvas/ # React Flow graph canvas with custom nodes
│   │   │   ├── ExecutionTimeline/ # 5-Agent live color-coded event stream
│   │   │   ├── PromptInputPanel/  # Natural language prompt synthesis bar
│   │   │   ├── NotificationsDrawer/ # Real-time alerts and escalation drawer
│   │   │   └── ProtectedRoute/ # Session guard and route protector
│   │   ├── pages/
│   │   │   ├── index.jsx       # Modern landing page & architecture showcase
│   │   │   ├── login.jsx       # Login form with fast demo quick-fill
│   │   │   ├── register.jsx    # User registration form
│   │   │   ├── dashboard.jsx   # Operator console & recent activity feed
│   │   │   ├── workflows/
│   │   │   │   ├── index.jsx   # Workflow list, filters, tag search, clone & delete
│   │   │   │   ├── builder.jsx # AI Prompt-to-Workflow generator & live preview
│   │   │   │   └── [id].jsx    # Full visual DAG canvas studio
│   │   │   ├── executions/
│   │   │   │   ├── index.jsx   # Execution history, status filters & metrics
│   │   │   │   └── [id].jsx    # Live 5-agent execution console & payload inspector
│   │   │   ├── integrations/
│   │   │   │   └── index.jsx   # Third-party connector hub & health diagnostics
│   │   │   └── settings.jsx    # System diagnostics & encryption status
│   │   ├── store/              # Zustand state stores (auth, workflow, notifications)
│   │   ├── lib/                # Axios API client, Socket.IO client, utilities
│   │   └── styles/             # Tailwind & glassmorphism theme styles
│   └── package.json
│
├── server/                     # Express REST API, WebSockets & Agent Engine
│   ├── src/
│   │   ├── config/             # Environment, Mongo, Socket.IO, Redis configs
│   │   ├── models/             # Mongoose schemas (User, Workflow, Execution, Log, etc.)
│   │   ├── controllers/        # Thin controllers for request parsing & response shaping
│   │   ├── routes/             # Express routes with rate limits & express-validator
│   │   ├── services/           # Business logic & AES-256-GCM encryption service
│   │   ├── agents/             # 5-Agent Multi-Agent Orchestrator pipeline
│   │   │   ├── plannerAgent.js
│   │   │   ├── executionAgent.js
│   │   │   ├── validationAgent.js
│   │   │   ├── recoveryAgent.js
│   │   │   ├── monitoringAgent.js
│   │   │   └── orchestrator.js
│   │   ├── integrations/       # Gmail, Slack, Discord, Google Sheets, OpenRouter
│   │   ├── queues/             # BullMQ & in-memory async fallback queue
│   │   ├── middlewares/        # JWT auth, role guard, validation, error handler
│   │   └── utils/              # Structured logger and database seed script
│   ├── package.json
│   ├── .env                    # Active local environment
│   └── .env.example            # Environment template
│
├── spec.md                     # Single source of truth specifications
└── README.md                   # Setup guide and documentation
```

---

## ⚙️ Environment Configuration Reference

### Backend (`server/.env`):
```env
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:3000

# MongoDB (Set USE_MEMORY_DB=true for zero-setup in-memory database)
MONGODB_URI=mongodb://127.0.0.1:27017/agentflow_ai
USE_MEMORY_DB=true

# Security & AES-256-GCM Token Encryption Key (32 bytes hex)
JWT_SECRET=agentflow_super_secret_jwt_key_2026_production_grade_token
JWT_EXPIRES_IN=7d
CREDENTIAL_ENCRYPTION_KEY=0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef

# Queue (Set USE_MEMORY_QUEUE=true for zero-setup async queue)
REDIS_URL=redis://127.0.0.1:6379
USE_MEMORY_QUEUE=true

# Optional: Live AI Providers (fallback works automatically when empty)
OPENROUTER_API_KEY=
OPENROUTER_MODEL=anthropic/claude-3.5-sonnet
GEMINI_API_KEY=
GEMINI_MODEL=gemini-1.5-flash

# Optional: Third-Party OAuth Credentials (simulation active when empty)
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_REDIRECT_URI=http://localhost:5000/api/integrations/oauth/google/callback

SLACK_CLIENT_ID=
SLACK_CLIENT_SECRET=
SLACK_REDIRECT_URI=http://localhost:5000/api/integrations/oauth/slack/callback

DISCORD_CLIENT_ID=
DISCORD_CLIENT_SECRET=
DISCORD_BOT_TOKEN=
DISCORD_REDIRECT_URI=http://localhost:5000/api/integrations/oauth/discord/callback
```

---

## 📡 API Endpoints Catalog

### Authentication
- `POST /api/auth/register` — Register a new operator/admin account.
- `POST /api/auth/login` — Sign in and receive JWT token.
- `GET /api/auth/me` — Retrieve active authenticated profile.

### Workflows
- `GET /api/workflows/dashboard` — Aggregated metrics, recent runs, and agent activity.
- `GET /api/workflows` — Search, filter, and paginate user workflows.
- `POST /api/workflows` — Create a new workflow DAG manually.
- `POST /api/workflows/generate` — Generate workflow graph from natural language prompt.
- `GET /api/workflows/:id` — Retrieve workflow graph details.
- `PUT /api/workflows/:id` — Update workflow nodes, edges, or trigger configuration.
- `POST /api/workflows/:id/duplicate` — Clone an existing workflow.
- `DELETE /api/workflows/:id` — Delete workflow and cascade delete executions.
- `POST /api/workflows/:id/execute` — Trigger execution through the 5-agent chain.

### Executions & Telemetry
- `GET /api/executions` — List executions with status filters and duration.
- `GET /api/executions/:id` — Get execution status, snapshots, and node output states.
- `GET /api/executions/:id/timeline` — Get granular per-agent execution logs.
- `POST /api/executions/:id/pause` — Pause a running execution.
- `POST /api/executions/:id/resume` — Resume a paused execution.
- `POST /api/executions/:id/cancel` — Cancel a running execution.

### Integrations & OAuth
- `GET /api/integrations` — List all connected third-party tools.
- `GET /api/integrations/status` — Get provider connection health summary.
- `GET /api/integrations/oauth/:provider/start` — Initiate OAuth redirect.
- `GET /api/integrations/oauth/:provider/callback` — Handle OAuth token exchange & encryption.
- `POST /api/integrations/:provider/test` — Test provider connection diagnostic.
- `POST /api/integrations` — Store custom API keys / webhook URLs.

### Notifications & System
- `GET /api/notifications` — List system alerts and agent escalations.
- `PUT /api/notifications/:id/read` — Mark notification as read.
- `PUT /api/notifications/read-all` — Mark all notifications as read.
- `GET /api/health` — System heartbeat, uptime, and provider availability.

---

## 🧪 Verification & Testing

To test the entire full-stack platform, run the automated integration test suite in PowerShell:

```powershell
# 1. Start the backend in one terminal:
cd server && npm run dev

# 2. Start the frontend in another terminal:
cd client && npm run dev

# 3. Test all API and frontend routes:
Invoke-RestMethod -Uri "http://localhost:5000/api/health"
```

---

## 🛡️ License

This project is licensed under the MIT License.
