# MediScan AI

AI-powered **preliminary** medical assessment and medical-report interpretation. Users sign in with Google, enter patient details, describe symptoms by typing or by voice, upload PDF reports, and receive a structured AI assessment (urgency, possible conditions, report findings, recommendations, medication information, specialist suggestion). Assessments are saved to a per-user history.

> MediScan AI never provides a confirmed diagnosis and does not replace a healthcare professional.

JavaScript only (no TypeScript). React + Vite + Tailwind on the front end; Node.js + Express + MongoDB on the back end.

## Architecture

```
Browser (React SPA) ── cookie session + X-CSRF-Token ──> Express API ──> MongoDB (users, assessments, sessions)
        │  Google Identity Services credential                │──> Google (verify ID token)
        └─ audio (MediaRecorder), PDFs (multipart)            └──> OpenAI (transcription, structured assessment)
```

- **Auth:** Google ID token is verified on the server (signature, expiry, issuer, audience, `email_verified`). A server-side session (MongoDB store, HttpOnly cookie) is created; nothing auth-related is kept in localStorage.
- **Assessment flow:** validate → extract PDF text (in memory) → build JSON payload (untrusted data kept separate from the system prompt) → OpenAI structured output → Zod validation → safety checks → save → return.
- **Storage:** uploads use in-memory buffers (zeroed after the request). Only metadata and extracted text are stored; there are no public file URLs. A private cloud store can be added behind the same upload middleware if original files must be retained.

## Folder structure

```
backend/   src/{config,models,routes,controllers,services,middleware,prompts,utils,constants}, test/
frontend/  src/{context,pages,components,services,hooks,utils,styles}
```

## Prerequisites

- Node.js 20.19+ recommended (20.x works; Vite 6 is pinned for older 20.x)
- MongoDB 6+ (local or Atlas)
- A Google Cloud OAuth Web client ID
- An OpenAI API key with access to a chat model supporting structured outputs and a transcription model

## Setup

### 1. MongoDB
Local: install MongoDB Community and use `mongodb://127.0.0.1:27017/mediscan`. Atlas: create a free cluster, add your IP to the access list, and copy the connection string.

### 2. Google OAuth
1. Open <https://console.cloud.google.com> and create/select a project.
2. **APIs & Services → OAuth consent screen**: choose External, set app name, support email, and authorized domains (production domain; not needed for localhost). Add test users while in "Testing" mode.
3. **Credentials → Create credentials → OAuth client ID → Web application**.
4. **Authorized JavaScript origins**: `http://localhost:5173` (dev) and your production origin, e.g. `https://app.example.com`. No redirect URI is needed (Google Identity Services popup/credential flow).
5. Copy the **Client ID** into `GOOGLE_CLIENT_ID` (backend) and `VITE_GOOGLE_CLIENT_ID` (frontend). No client secret is used.
6. Test: start both apps, open the login page, click *Sign in with Google*.

Production: use HTTPS, add the production origin above, set `NODE_ENV=production`, `FRONTEND_URL` to the production origin. If the API is on a different *site* than the frontend, set `COOKIE_SAMESITE=none` (requires HTTPS); otherwise keep `lax` and serve both under the same site (e.g. `app.example.com` and `api.example.com`).

### 3. Backend
```bash
cd backend
npm install
cp .env.example .env     # fill in values
npm run dev              # http://localhost:5000
npm test                 # unit tests
```

### 4. Frontend
```bash
cd frontend
npm install
cp .env.example .env     # set VITE_GOOGLE_CLIENT_ID
npm run dev              # http://localhost:5173
npm run build            # production build in dist/
```

## Environment variables

Backend (`backend/.env`): `PORT`, `NODE_ENV`, `MONGODB_URI`, `OPENAI_API_KEY`, `OPENAI_MODEL`, `OPENAI_TRANSCRIPTION_MODEL`, `GOOGLE_CLIENT_ID`, `SESSION_SECRET`, `FRONTEND_URL`, `MAX_FILE_SIZE` (bytes per PDF), `MAX_FILES`, `SESSION_MAX_AGE` (ms). Optional: `MAX_AUDIO_SIZE`, `MAX_PDF_PAGES`, `OPENAI_TIMEOUT_MS`, `COOKIE_SAMESITE`. The server refuses to start if required values are missing.

Frontend (`frontend/.env`): `VITE_API_URL`, `VITE_GOOGLE_CLIENT_ID`.

Model names are never hard-coded; they come only from env.

## API

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/health` | – | Status + upload limits |
| POST | `/api/auth/google` | – | `{credential}` → verify, upsert user, create session |
| GET | `/api/auth/me` | ✔ | Current user (+ CSRF token) |
| POST | `/api/auth/logout` | ✔ | Destroy session, clear cookie |
| POST | `/api/transcription` | ✔ | multipart `audio` → `{transcription}` |
| POST | `/api/assessment` | ✔ | multipart: patient fields + `reports` (PDFs) → structured assessment |
| GET | `/api/assessments?page&limit&q&sort` | ✔ | Paginated, searchable (patient name), sortable history |
| GET | `/api/assessments/:id` | ✔ | One assessment (ownership enforced) |
| DELETE | `/api/assessments/:id` | ✔ | Delete (ownership enforced) |

Errors: `{ success:false, code, message, details? }` – never stack traces.

## Feature notes

- **Voice:** MediaRecorder (webm/opus, mp4 or ogg depending on browser), pause/resume where supported, playback, delete, re-record. Audio stays on the device until the user presses *Transcribe recording*. The transcription is appended to an editable text area; typed symptoms and the (edited) transcription are combined server-side without duplication.
- **PDFs:** client checks extension, MIME, size, count, and `%PDF-` header; server re-checks and parses text with `pdf-parse`. Unreadable or scanned PDFs are rejected **by filename** with an explanation – never silently skipped. `registerOcrProvider()` in `pdf.service.js` is the OCR extension point.
- **AI:** system prompt in `prompts/medical-assessment.prompt.js`; strict JSON-schema structured output; Zod validation (`utils/response-parser.js`); fixed disclaimer; medication items default to "requires professional confirmation".
- **Emergency safety:** keyword pre-screen raises any matching case to at least URGENT even if the model under-calls it; EMERGENCY results render a full-width alert as the first element of the page (112 for India).

## Security & privacy

Helmet, locked-down CORS, global + per-route rate limits, Zod validation, magic-byte file validation, HttpOnly/SameSite/Secure cookies with absolute expiry, session regeneration on login, CSRF (Origin check + per-session token header), ownership-scoped queries (owner always from the session), regex-escaped search, API timeouts. Patient data is not logged, not placed in URLs, and the patient's name is not sent to OpenAI. PDF text and symptom text are passed only as JSON data with instructions in the system prompt to ignore embedded instructions. No analytics.

Consent: users must tick a consent box before submission; it is stored with each assessment (`consent.given/at/version`).

Review before real-world use: data-protection law (HIPAA/GDPR/DPDP), data-processing agreements with OpenAI/Google/hosting, retention policy, and clinical review of prompts. This software is not a certified medical device.

## Troubleshooting

- **Server exits at start:** read the listed missing env vars; check `MONGODB_URI` reachability.
- **Google button missing / "origin not allowed":** add the exact frontend origin to *Authorized JavaScript origins*; confirm `VITE_GOOGLE_CLIENT_ID`; disable ad-blockers for `accounts.google.com`.
- **Logged out immediately / 403 BAD_CSRF:** `FRONTEND_URL` must exactly equal the browser origin; cross-site deployments need `COOKIE_SAMESITE=none` + HTTPS.
- **Microphone blocked:** microphone needs HTTPS or `localhost`, and browser permission.
- **"PDF may be scanned":** only text-based PDFs are supported until an OCR provider is registered.
- **OpenAI 400 about `json_schema`:** pick a model that supports structured outputs.
- **`vite` native-binding error:** use Node ≥ 20.19 or keep the pinned Vite 6.
