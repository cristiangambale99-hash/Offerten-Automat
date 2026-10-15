/* auth.js – einfacher Team-Login (gemeinsames Passwort), Cookie mit HMAC */
const crypto = require('crypto');
const COOKIE = 'oa_session';
function sign(v) { return crypto.createHmac('sha256', process.env.APP_SECRET || 'dev').update(v).digest('hex'); }
function makeToken(user) { const exp = Date.now() + 1000 * 60 * 60 * 24 * 30; const p = `${user}|${exp}`; return `${p}|${sign(p)}`; }
function verify(token) { if (!token) return null; const [user, exp, sig] = token.split('|'); if (!user || !exp || !sig) return null; if (sign(`${user}|${exp}`) !== sig) return null; if (Date.now() > +exp) return null; return { user }; }
function userFromCookies(cookieHeader) { const m = /(?:^|;\s*)oa_session=([^;]+)/.exec(cookieHeader || ''); return m ? verify(decodeURIComponent(m[1])) : null; }
function checkPassword(pw) { const list = (process.env.APP_PASSWORDS || process.env.APP_PASSWORD || '').split(',').map(s => s.trim()).filter(Boolean); return list.includes(pw); }
function webhookOk(key) { return !!process.env.WEBHOOK_SECRET && key === process.env.WEBHOOK_SECRET; }
function offerToken(nr) { return crypto.createHmac('sha256', process.env.APP_SECRET || 'dev').update('offer-' + nr).digest('hex').slice(0, 16); }
module.exports = { COOKIE, makeToken, verify, userFromCookies, checkPassword, webhookOk, offerToken };
