import { requireUser, json, fail } from '../../../lib/http.js';
import { processInquiry } from '../../../lib/pipeline.js';
export const dynamic = 'force-dynamic'; export const maxDuration = 60;
export async function POST(req) {
  try { const u = requireUser(req); const b = await req.json();
    const o = await processInquiry({ mailText: b.mailText, channel: b.channel === 'manual' ? 'Telefon' : 'Webformular', by: u.user });
    return json({ ok: true, offer: o });
  } catch (e) { return fail(e); }
}
