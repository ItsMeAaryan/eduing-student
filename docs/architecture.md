# EDUING Architecture Overview

## Core Stack
- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS + Framer Motion
- **Authentication & Database:** Firebase Authentication + Cloud Firestore
- **AI Engine:** Google Gemini Foundation Model

## AI Architecture
EDUING utilizes a dual-engine architecture:
1. **Deterministic Logic Engines:** Rule-based mathematics evaluating probabilities, profile completion, and scholarship eligibility (`lib/utils/`).
2. **Generative Intelligence (Gemini):** Takes the structured output of the deterministic engines as context to generate personalized narrative insights (Career paths, SOPs, Emails, Resumes).

### Security Boundaries
- Raw user input is aggressively sanitized by `PromptBuilder.sanitize()`.
- Inputs are isolated via XML tags (e.g., `<user_query>`) to prevent Prompt Injection.
- System prompts are hard-coded on the server and impenetrable from the client.

## Folder Structure
- `/app`: Next.js App Router endpoints, pages, and layouts.
- `/components`: Reusable UI elements, dashboard widgets, and AI empty/loading states.
- `/lib`: Core business logic, Firebase adapters, Prompt Builders, and Utility Engines.
- `/docs`: Operational manuals, architecture specs, and DR checklists.
- `/e2e`: Playwright End-to-End automation tests.
- `/scripts`: Pre-deployment maintenance scripts.
