import { checkPassword, makeToken, COOKIE } from '../../lib/auth.js';
export const dynamic = 'force-dynamic';
const page = (err) => `<!doctype html><html lang="de-CH"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Anmelden – Offerten-Automat</title>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Figtree:wght@300;400;500;600&display=swap">
<style>body{margin:0;min-height:100vh;display:grid;place-items:center;background:#eef7f8;font-family:"Figtree",system-ui,sans-serif;color:#3c3c3b;color-scheme:light}.card{background:#fff;border:1px solid #dcebee;border-radius:16px;padding:32px 30px;width:min(380px,92vw)}img{width:170px;display:block;margin:0 auto 18px}h1{font-weight:300;text-transform:uppercase;letter-spacing:.08em;font-size:22px;color:#1b8384;margin:0 0 4px;text-align:center}p{margin:0 0 18px;color:#767676;text-align:center;font-size:14px}label{font-size:13.5px;font-weight:600;display:block;margin-bottom:6px}input{width:100%;box-sizing:border-box;min-height:46px;border:1px solid #c5dde1;border-radius:8px;padding:10px 12px;font:inherit;font-size:16px;margin-bottom:14px}button{width:100%;min-height:46px;border:0;border-radius:8px;background:#1b8384;color:#fff;font:inherit;font-weight:600;font-size:15px;cursor:pointer}.err{color:#b8453c;font-size:13.5px;margin-bottom:12px;text-align:center}</style></head>
<body><form class="card" method="post"><img src="/brand/logo.png" alt="Clean Service"><h1>Offerten-Automat</h1><p>Umzugsreinigung · Spezialreinigung</p>${err?'<div class="err">Passwort stimmt nicht.</div>':''}<label>Name</label><input name="user" placeholder="z. B. Lionel" required><label>Team-Passwort</label><input name="pw" type="password" required><button>Anmelden</button></form></body></html>`;
export async function GET() { return new Response(page(false), { headers: { 'content-type': 'text/html; charset=utf-8' } }); }
export async function POST(req) {
  const fd = await req.formData(); const pw = String(fd.get('pw') || ''); const user = String(fd.get('user') || 'Team').slice(0, 40);
  if (!checkPassword(pw)) return new Response(page(true), { status: 401, headers: { 'content-type': 'text/html; charset=utf-8' } });
  const token = makeToken(user);
  return new Response(null, { status: 302, headers: { Location: '/', 'Set-Cookie': `${COOKIE}=${encodeURIComponent(token)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=2592000${process.env.NODE_ENV==='production'?'; Secure':''}` } });
}
