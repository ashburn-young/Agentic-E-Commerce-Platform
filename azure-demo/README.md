# Azure Agentic Commerce Demo (Next.js)

This is the runnable demo app for the Agentic E-Commerce Platform architecture.

## Quick start

1) Sync env from the top-level folder (recommended):

- Run `powershell -NoProfile -ExecutionPolicy Bypass -File ..\scripts\sync-azure-demo-env.ps1`

2) Install and run:

- `npm install`
- `npm run dev`

Then open `http://localhost:3000`.

## Environment variables

The demo reads env vars defined in `.env.local`.

Required for Azure OpenAI mode:
- `DEMO_USE_AZURE_OPENAI=true`
- `AZURE_OPENAI_ENDPOINT`
- `AZURE_OPENAI_API_KEY`
- `AZURE_OPENAI_MODEL_DEPLOYMENT` (or `AZURE_OPENAI_DEPLOYMENT`)

Notes:
- `AZURE_OPENAI_ENDPOINT` can be the base resource URL OR a full `/openai/responses?...` URL.
- If calls fail, the API returns `502` (no silent mock fallback when Azure mode is enabled).
