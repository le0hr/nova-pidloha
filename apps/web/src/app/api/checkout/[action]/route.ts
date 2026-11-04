import { randomBytes } from 'node:crypto';
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
const cookieName = 'np_checkout';
const base = () => (process.env.STRAPI_URL || process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337').replace(/\/$/, '');
async function proxy(request: NextRequest, context: {params: Promise<{action: string}>}) {
  const {action} = await context.params;
  if (!['session','draft','submit','retry','status','new'].includes(action) || (request.method === 'GET') !== (action === 'status')) return NextResponse.json({error: 'Not found'}, {status: 404});
  if (request.method === 'POST') {
    const expectedOrigin = new URL(process.env.WEB_PUBLIC_URL || request.url).origin;
    if (request.headers.get('origin') !== expectedOrigin) return NextResponse.json({error: 'Доступ заборонено'}, {status: 403});
  }
  const secret = process.env.CHECKOUT_API_SECRET;
  if (!secret || secret.length < 32) return NextResponse.json({error: 'Оформлення замовлень ще не налаштовано.'}, {status: 503});
  let token = request.cookies.get(cookieName)?.value;
  if (action === 'session' || action === 'new') {
    if (!token || action === 'new') token = randomBytes(32).toString('hex');
    const response = NextResponse.json({ok: true}, {headers: {'Cache-Control': 'no-store'}});
    response.cookies.set(cookieName, token, {httpOnly: true, secure: new URL(process.env.WEB_PUBLIC_URL || request.url).protocol === 'https:', sameSite: 'lax', path: '/', maxAge: 60 * 60 * 24 * 30});
    return response;
  }
  if (!token || !/^[a-f0-9]{64}$/.test(token)) return NextResponse.json({error: 'Розпочніть оформлення замовлення.'}, {status: 401});
  try {
    const body = request.method === 'POST' ? await request.text() : undefined;
    if (body && Buffer.byteLength(body) > 100000) return NextResponse.json({error: 'Завеликий запит'}, {status: 413});
    const upstream = await fetch(`${base()}/api/checkout/${action}`, {
      method: request.method, headers: {'Content-Type': 'application/json', 'x-checkout-key': secret, 'x-checkout-session': token},
      body, cache: 'no-store', signal: AbortSignal.timeout(25000),
    });
    const result = await upstream.json();
    return NextResponse.json(result, {status: upstream.status, headers: {'Cache-Control': 'no-store'}});
  } catch {
    return NextResponse.json({error: 'Сервер не відповідає. Дані залишилися у браузері — спробуйте ще раз.'}, {status: 502});
  }
}
export const POST = proxy;
export const GET = proxy;
