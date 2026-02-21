import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST(request: Request) {
  const payload = await request.json().catch(() => null);

  if (!payload || !payload.name || !payload.phone || !payload.message) {
    return NextResponse.json(
      { ok: false, message: '??????? ??? ???? ????.' },
      { status: 400 }
    );
  }

  const entry = {
    name: String(payload.name),
    phone: String(payload.phone),
    email: payload.email ? String(payload.email) : null,
    topic: payload.topic ? String(payload.topic) : null,
    message: String(payload.message),
    createdAt: new Date().toISOString()
  };

  const dataDir = path.join(process.cwd(), 'data');
  const filePath = path.join(dataDir, 'contact-requests.jsonl');

  await fs.promises.mkdir(dataDir, { recursive: true });
  await fs.promises.appendFile(filePath, `${JSON.stringify(entry)}\n`, 'utf8');

  return NextResponse.json({
    ok: true,
    message: '??????? ??? ?? ?????? ??? ??.'
  });
}
