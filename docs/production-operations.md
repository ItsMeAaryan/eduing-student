# EDUING Operations & Disaster Recovery Guide

## 1. Disaster Recovery (DR)
### Rollback Strategy
- **Frontend (Next.js/Vercel):** Initiate an instant rollback via the Vercel dashboard to the last known stable deployment. Vercel immutable deployments ensure zero-downtime rollbacks.
- **Backend (Firebase):** Firestore rules and schemas are source-controlled. Rollback `firestore.rules` via Firebase CLI: `firebase deploy --only firestore:rules`.

### Backup Strategy
- **Firestore Database:** Google Cloud Platform (GCP) automated point-in-time recovery (PITR) is enabled. Daily scheduled exports of the `universities`, `scholarships`, and `students` collections to a dedicated GCS coldline bucket.

### Incident Response Checklist
1. **Acknowledge:** Confirm via Sentry/PagerDuty.
2. **Triage:** Assess severity (e.g., Is Gemini down? Is Firebase offline? Is it a UI bug?).
3. **Mitigate:** If AI provider is down, activate graceful degradation (show offline state). If fatal UI bug, execute Vercel rollback.
4. **Resolve & Post-Mortem:** Identify root cause, deploy patch, write incident report.

## 2. Deployment Guide
### Prerequisites
- Node.js 20+
- Firebase CLI (`npm i -g firebase-tools`)
- Vercel CLI (optional)

### Environment Variables
Ensure all production secrets are injected into Vercel and GitHub Actions:
- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `GEMINI_API_KEY` (Server-only)

### Deployment Steps
1. `git push origin main`
2. GitHub Actions CI will automatically run Lint, Typecheck, Vitest, and Playwright.
3. Upon CI success, Vercel initiates a production build (`npm run build`).
4. Vercel promotes the build to edge CDN.

## 3. Observability Architecture
- **Errors:** Sentry captures all unhandled exceptions and React error boundary fallbacks.
- **AI Latency:** The `AnalyticsService` wrapper logs token estimations, prompt generation latency, and Gemini failure rates to Google Analytics 4 (GA4).
- **Core Web Vitals:** Next.js native web vitals reporting is forwarded to Vercel Analytics for continuous monitoring.
