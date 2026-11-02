// app/api/ai/route.ts
// Server-side AI proxy — keeps GROQ_API_KEY off the client bundle and only
// answers signed-in EDUING users (Firebase ID token in the Authorization header).
import { NextRequest, NextResponse } from 'next/server';

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const FIREBASE_API_KEY = process.env.NEXT_PUBLIC_FIREBASE_API_KEY || 'AIzaSyAWF57TakNaSkGXCRpw_Ig5NSxAVSozCvg';

export const runtime = 'nodejs';

const fail = (status: number, error: string, message: string) => NextResponse.json({ error, message }, { status });

/** Checks a Firebase ID token with Google's Identity Toolkit (no Admin SDK needed). */
async function isSignedIn(request: NextRequest): Promise<boolean> {
  const token = (request.headers.get('authorization') || '').replace(/^Bearer\s+/i, '');
  if (!token) return false;
  try {
    const r = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${FIREBASE_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idToken: token }),
      cache: 'no-store',
    });
    if (!r.ok) return false;
    const data = await r.json();
    return Array.isArray(data.users) && data.users.length > 0;
  } catch {
    return false;
  }
}

export async function POST(request: NextRequest) {
  const key = process.env.GROQ_API_KEY || '';
  if (!key) {
    console.error('[AI Route] GROQ_API_KEY is not set');
    return fail(503, 'not_configured', 'The AI assistant isn’t switched on yet. Please try again later.');
  }
  if (!(await isSignedIn(request))) {
    return fail(401, 'unauthorized', 'Your session has expired. Sign in again to use the AI tools.');
  }

  let body: { messages?: { role: string; content: string }[]; temperature?: number; max_tokens?: number };
  try {
    body = await request.json();
  } catch {
    return fail(400, 'bad_request', 'Invalid request.');
  }
  const messages = (Array.isArray(body.messages) ? body.messages : [])
    .filter(m => m && typeof m.content === 'string' && ['system', 'user', 'assistant'].includes(m.role))
    .slice(-20)
    .map(m => ({ role: m.role, content: m.content.slice(0, 16000) }));
  if (!messages.length) return fail(400, 'bad_request', 'messages array is required');

  try {
    const groqResponse = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'openai/gpt-oss-20b', // fixed — ignores whatever the client sends
        messages,
        temperature: Math.min(1, Math.max(0, body.temperature ?? 0.7)),
        max_tokens: Math.min(4096, body.max_tokens ?? 2048),
      }),
    });

    if (!groqResponse.ok) {
      console.error('[AI Route] Groq API error:', groqResponse.status, await groqResponse.text());
      return groqResponse.status === 429
        ? fail(429, 'busy', 'The AI is busy right now. Try again in a minute.')
        : fail(502, 'upstream', 'The AI service had a problem. Please try again.');
    }

    const data = await groqResponse.json();
    return NextResponse.json({ text: data.choices?.[0]?.message?.content ?? '' });
  } catch (err) {
    console.error('[AI Route] Unexpected error:', err);
    return fail(502, 'upstream', 'Couldn’t reach the AI service. Please try again.');
  }
}
