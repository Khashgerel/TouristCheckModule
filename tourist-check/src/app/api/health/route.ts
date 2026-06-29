import { NextResponse } from 'next/server';

export async function GET() {
  const dbConfigured = Boolean(process.env.DATABASE_STRING);

  return NextResponse.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    db: dbConfigured ? 'configured' : 'missing',
  });
}
