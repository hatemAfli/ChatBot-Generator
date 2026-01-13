# Copilot Instructions for Chatbot Codebase

## Big Picture Architecture
- The project is split into three main components:
  - `backend/`: Node.js Express REST API, handles authentication, bot configuration, chat logic, and serves static files.
  - `frontend/`: React + Vite SPA, communicates with backend via HTTP, uses modern React conventions.
  - `servicePython/`: FastAPI microservice for advanced bot logic or ML, receives config JSON from backend and returns bot data.
- Data flows from frontend (user input) → backend (API, DB) → servicePython (for bot logic) → backend → frontend.

## Developer Workflows
- **Backend:**
  - Start with `nodemon` or `node backend/index.js`.
  - Static files served from `backend/public/` via `/static` route.
  - Database connection in `backend/config/dbConn.js` (PostgreSQL, parameterized queries).
  - JWT-based authentication, refresh/access token logic in `controllers/`.
- **Frontend:**
  - Start with `npm run dev` in `frontend/`.
  - Uses Vite for fast HMR and React for UI.
- **Python Service:**
  - Start with `uvicorn service:app --reload` in `servicePython/`.
  - Accepts POST `/predict` with config JSON, returns bot info.

## Project-Specific Patterns
- **Express Controllers:**
  - Each controller in `backend/controllers/` handles a single responsibility (auth, chat, bot config, etc.).
  - Error handling: always return JSON with status codes, never leak internal errors.
- **Token Management:**
  - Refresh tokens stored in DB, invalidated on logout or reuse detection.
  - Access tokens sent in response, refresh tokens in HTTP-only cookies.
- **Frontend/Backend Integration:**
  - Frontend fetches from backend endpoints, expects JSON responses.
  - For bot chat, frontend sends user message to backend, which may call Python service.
- **Python Service Integration:**
  - Backend sends config as JSON to FastAPI, expects bot_id and domaines_expertise in response.
  - No strict Pydantic models required; service accepts arbitrary JSON.

## Conventions & Examples
- **Static Files:** Place in `backend/public/`, access via `/static/<filename>`.
- **Chat Logic:** See `backend/controllers/chatController.js` for request flow and Python service integration.
- **Bot Publishing:** See `backend/controllers/publishBotController.js` for dynamic JS generation per bot.
- **Frontend:** Uses Vite + React, see `frontend/README.md` for setup.

## External Dependencies
- Node.js, Express, PostgreSQL, bcrypt, jsonwebtoken, axios
- React, Vite
- Python, FastAPI, Uvicorn

---

**If any section is unclear or missing important project-specific details, please provide feedback so this guide can be improved.**
