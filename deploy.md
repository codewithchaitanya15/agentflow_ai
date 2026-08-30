# Deploying Agentflow_AI — Render (backend) & Vercel (frontend)

This document describes the steps to push the project to GitHub and deploy the backend to Render and the frontend to Vercel.

Prerequisites
- A GitHub account
- Render account (for backend + optional Redis)
- Vercel account (for frontend)
- MongoDB Atlas account (or a managed MongoDB service)
- Optional: Redis provider (Render Redis, Upstash, or other)

1) Prepare the repo and push to GitHub

  a) Initialize git (if not already):

  ```bash
  git init
  git add .
  git commit -m "chore: initial commit from spec.md"
  ```

  b) Create a GitHub repository (replace `USERNAME` and `REPO`):

  ```bash
  # using GitHub CLI (recommended)
  gh repo create USERNAME/REPO --public --source=. --remote=origin
  git branch -M main
  git push -u origin main

  # or create on github.com and then
  # git remote add origin git@github.com:USERNAME/REPO.git
  # git push -u origin main
  ```

2) Configure production services and secrets

  a) MongoDB Atlas
  - Create a cluster and a database user.
  - Whitelist your Render IPs or allow access from anywhere (0.0.0.0/0) depending on security.
  - Obtain the connection string and set `MONGO_URI` on Render.

  b) Redis
  - Either provision Render Redis or use a managed provider like Upstash.
  - Obtain `REDIS_URL` and set it on Render.

3) Deploy backend on Render

  a) Create a new Web Service in Render and connect your GitHub repository.

  b) For a monorepo, set the "Root Directory" to `server`.

  c) Build & Start commands (example):

  - Build Command: `npm install --production=false`
  - Start Command: `npm start`

  Ensure `server/package.json` has a `start` script (for production) such as `node src/index.js` or `node dist/index.js` if you build.

  d) Add Environment variables in the Render dashboard (Environment → Environment Variables):

  - `MONGO_URI` — MongoDB connection string
  - `REDIS_URL` — Redis connection string
  - `JWT_SECRET` — strong secret for signing tokens
  - `CREDENTIAL_ENCRYPTION_KEY` — 32-byte base64/hex key for encrypting tokens
  - `CLIENT_URL` — your Vercel frontend URL (e.g., `https://your-app.vercel.app`)
  - `OPENROUTER_API_KEY` and/or `GEMINI_API_KEY` (if used)
  - OAuth client IDs and secrets for providers (GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, SLACK_CLIENT_ID, etc.)

  e) If you use Redis for BullMQ, ensure background workers are enabled or run the queue consumers as part of the web service or separate Worker service.

  f) Deploy and monitor the live logs on Render to ensure the backend starts successfully.

4) Deploy frontend on Vercel

  a) In Vercel, import the GitHub repository.

  b) For a monorepo, set the "Root Directory" to `client`.

  c) Vercel detects Next.js automatically. Recommended build settings:

  - Framework Preset: `Next.js`
  - Build Command: `npm run build`
  - Output Directory: (leave default)

  d) Set environment variables in the Vercel project Settings → Environment Variables:

  - `NEXT_PUBLIC_API_URL` — `https://agentflow-ai-bet2.onrender.com/api`
  - `NEXT_PUBLIC_SOCKET_URL` — `https://agentflow-ai-bet2.onrender.com`
  - Any other client-facing variables (only prefixed with `NEXT_PUBLIC_` will be exposed to client-side code)

  e) Deploy and check the Vercel deployment URL.

5) Update OAuth redirect URIs for providers

  - For each OAuth provider (Google, Slack, Discord), update the app's redirect URI to point at your production backend callback endpoint:

    `https://agentflow-ai-bet2.onrender.com/api/integrations/oauth/<provider>/callback`

  - Also ensure any frontend OAuth redirects (if applicable) point to your Vercel domain.

6) Post-deploy checks

  - Visit the frontend URL and log in / register.
  - Connect an integration (use a test account) and verify the integration status page shows connected.
  - Trigger a workflow execution and watch the backend logs / execution timeline to ensure Socket.IO events stream and ExecutionLogs are written to MongoDB.

7) Useful tips and troubleshooting

  - If the backend cannot connect to MongoDB, double-check `MONGO_URI` and IP access configuration.
  - If BullMQ jobs are not running, verify `REDIS_URL` and that queue workers are running.
  - For CORS issues, set `CLIENT_URL` on the backend and configure CORS accordingly.
  - Keep `JWT_SECRET` and `CREDENTIAL_ENCRYPTION_KEY` secret; rotate if compromised.

8) CI/CD (optional)

  - Vercel automatically deploys frontend on push to configured branches.
  - Render can auto-deploy backend on push to the branch you selected.
  - For production workflows, use protected branches and GitHub Actions for tests and linting before deploy.

9) Rollback

  - Use the Render and Vercel dashboards to revert to previous deployments if needed.

---
Save this file as `deploy.md` and follow the steps when you're ready to push and deploy.
