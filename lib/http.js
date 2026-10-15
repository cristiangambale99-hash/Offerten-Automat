const { userFromCookies } = require('./auth.js');
function requireUser(req) { const u = userFromCookies(req.headers.get('cookie')); if (!u) throw Object.assign(new Error('unauthorized'), { status: 401 }); return u; }
function json(data, status = 200) { return new Response(JSON.stringify(data), { status, headers: { 'content-type': 'application/json; charset=utf-8' } }); }
function html(s, status = 200, extra = {}) { return new Response(s, { status, headers: { 'content-type': 'text/html; charset=utf-8', ...extra } }); }
function fail(e) { const status = e.status || 500; console.error(e); return json({ error: e.message || String(e) }, status); }
module.exports = { requireUser, json, html, fail };
