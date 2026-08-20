// app/api/ai/route.ts
// Server-side AI proxy — keeps GROQ_API_KEY off the client bundle.
// All AI generation calls from the browser POST to this endpoint.

import { NextRequest, NextResponse } from 'next/server';

const GROQ_API_KEY = process.env.GROQ_API_KEY || '';
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  if (!GROQ_API_KEY) {
    return NextResponse.json(
      { error: 'AI service is not configured. Please set the GROQ_API_KEY environment variable.' },
      { status: 503 }
    );
  }

  let body: {
    model?: string;
    messages: { role: string; content: string }[];
    temperature?: number;
    max_tokens?: number;
  };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  if (!body.messages || !Array.isArray(body.messages)) {
    return NextResponse.json({ error: 'messages array is required' }, { status: 400 });
  }

  try {
    const groqResponse = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'openai/gpt-oss-20b', // ✅ fixed — ignores whatever the client sends
        messages: body.messages,
        temperature: body.temperature ?? 0.7,
        max_tokens: body.max_tokens ?? 2048,
      }),
    });

    if (!groqResponse.ok) {
      const errorText = await groqResponse.text();
      console.error('[AI Route] Groq API error:', groqResponse.status, errorText);
      return NextResponse.json(
        { error: 'AI service error. Please try again later.' },
        { status: groqResponse.status }
      );
    }

    const data = await groqResponse.json();
    const text = data.choices?.[0]?.message?.content ?? '';
    return NextResponse.json({ text });
  } catch (err) {
    console.error('[AI Route] Unexpected error:', err);
    return NextResponse.json(
      { error: 'Unexpected error. Please try again later.' },
      { status: 500 }
    );
  }
}