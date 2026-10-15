import { json } from '../../../lib/http.js';
import { webhookOk } from '../../../lib/auth.js';
import * as db from '../../../lib/db.js';
import { processInquiry, fieldsToMail, notifyTeam } from '../../../lib/pipeline.js';
export const dynamic = 'force-dynamic'; export const maxDuration = 60;
async function readBody(req) {
  const ct = req.headers.get('content-type') || '';
  if (ct.includes('application/json')) return await req.json();
  const fd = await req.formData(); const o = {}; for (const [k, v] of fd.entries()) { if (typeof v === 'string') o[k] = o[k] !== undefined ? [].concat(o[k], v) : v; else o[k] = v.name; } return o;
}
export async function POST(req) {
  const key = new URL(req.url).searchParams.get('key');
  if (!webhookOk(key)) return json({ error: 'forbidden' }, 403);
  let fields = {};
  try { fields = await readBody(req); } catch (e) { return json({ error: 'bad body' }, 400); }
  await db.logEvent('webhook_in', { keys: Object.keys(fields) });
  try {
    const mailText = typeof fields.mailtext === 'string' && fields.mailtext.length > 50 ? fields.mailtext : fieldsToMail(fields);
    const o = await processInquiry({ mailText, channel: 'Webformular', raw: fields });
    return json({ ok: true, nr: o.nr, status: o.status });
  } catch (e) {
    await db.logEvent('webhook_error', { error: String(e.message || e) });
    await notifyTeam('Offerten-Automat: Fehler beim Verarbeiten einer Anfrage', `<p>Eine Webformular-Anfrage konnte nicht automatisch verarbeitet werden. Bitte die Mail manuell prüfen.</p><pre>${String(e.message || e)}</pre>`);
    return json({ error: 'processing failed' }, 500);
  }
}
export async function GET() { return json({ ok: true, service: 'offerten-automat webhook' }); }
