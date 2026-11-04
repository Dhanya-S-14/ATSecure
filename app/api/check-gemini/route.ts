import { NextResponse } from 'next/server';
import { testGeminiApiKey, resolveGeminiApiKey } from '@/lib/gemini';

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const key = resolveGeminiApiKey(body.apiKey, req);

    if (!key) {
      return NextResponse.json({
        valid: false,
        error: 'No Gemini API key provided. Please enter a key or set GEMINI_API_KEY in .env.'
      }, { status: 400 });
    }

    const testResult = await testGeminiApiKey(key);
    return NextResponse.json(testResult);
  } catch (err: any) {
    return NextResponse.json({
      valid: false,
      error: err?.message || 'Internal error testing Gemini API.'
    }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const key = resolveGeminiApiKey(undefined, req);
    if (!key) {
      return NextResponse.json({
        configured: false,
        valid: false,
        message: 'No GEMINI_API_KEY configured in environment.'
      });
    }

    const testResult = await testGeminiApiKey(key);
    return NextResponse.json({
      configured: true,
      ...testResult
    });
  } catch (err: any) {
    return NextResponse.json({
      configured: false,
      valid: false,
      error: err?.message || 'Error checking Gemini API status.'
    }, { status: 500 });
  }
}

