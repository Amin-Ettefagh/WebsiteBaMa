import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const toTrimmedString = (value: unknown) =>
  typeof value === 'string' ? value.trim() : '';

const toOptionalTrimmedString = (value: unknown) => {
  const next = toTrimmedString(value);
  return next.length > 0 ? next : null;
};

export async function POST(request: Request) {
  const payload = await request.json().catch(() => null);

  if (!payload) {
    return NextResponse.json(
      { ok: false, message: 'Please provide your name, phone, and message.' },
      { status: 400 }
    );
  }

  const name = toTrimmedString(payload.name);
  const phone = toTrimmedString(payload.phone);
  const message = toTrimmedString(payload.message);
  const email = toOptionalTrimmedString(payload.email);
  const topic = toOptionalTrimmedString(payload.topic);

  if (!name || !phone || !message) {
    return NextResponse.json(
      { ok: false, message: 'Please provide your name, phone, and message.' },
      { status: 400 }
    );
  }

  if (name.length > 120 || phone.length > 60 || message.length > 5000) {
    return NextResponse.json(
      { ok: false, message: 'One or more fields are too long.' },
      { status: 400 }
    );
  }

  const entry = {
    name,
    phone,
    email,
    topic,
    message,
    createdAt: new Date().toISOString()
  };

  // Store submissions locally to a JSONL file for simple back-office review.
  const dataDir = path.join(process.cwd(), 'data');
  const filePath = path.join(dataDir, 'contact-requests.jsonl');

  await fs.promises.mkdir(dataDir, { recursive: true });
  await fs.promises.appendFile(filePath, `${JSON.stringify(entry)}\n`, 'utf8');

  return NextResponse.json({
    ok: true,
    message: 'Thanks! Your request has been received.'
  });
}
