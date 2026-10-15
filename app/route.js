import { userFromCookies } from '../lib/auth.js';
import fs from 'fs'; import path from 'path';
export const dynamic = 'force-dynamic';
export async function GET(req) {
  const u = userFromCookies(req.headers.get('cookie'));
  if (!u) return Response.redirect(new URL('/login', req.url), 302);
  const file = fs.readFileSync(path.join(process.cwd(), 'app', 'admin.html'), 'utf8').replace(/%%USER%%/g, u.user).replace(/%%INIT%%/g, u.user.split(/\s+/).map(s=>s[0]).join('').slice(0,2).toUpperCase());
  return new Response(file, { headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store' } });
}
