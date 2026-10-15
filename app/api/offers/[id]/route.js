import { requireUser, json, fail } from '../../../../lib/http.js';
import * as db from '../../../../lib/db.js';
import { sendOffer, confirmOrder, now } from '../../../../lib/pipeline.js';
export const dynamic = 'force-dynamic'; export const maxDuration = 60;
export async function POST(req, { params }) {
  try { const u = requireUser(req); const { action } = await req.json(); let o = await db.getOffer(params.id); if (!o) return json({ error: 'not found' }, 404);
    if (action === 'send') o = await sendOffer(o, null, u.user);
    else if (action === 'resend') o = await sendOffer(o, null, u.user);
    else if (action === 'decline') o = await db.updateOffer(o.id, { status: 'declined', timeline: o.timeline.concat([[now(), `Anfrage abgelehnt (${u.user})`]]) });
    else if (action === 'accept') o = await db.updateOffer(o.id, { status: 'accepted', auftrag: o.auftrag || { verwaltung: '–', uebergabe: '–', termin: '–', zahlung: 'Rechnung', schluessel: 'Milchkasten', manual: true }, timeline: o.timeline.concat([[now(), `Auftragserteilung erhalten, manuell erfasst (${u.user})`]]) });
    else if (action === 'confirm') o = await confirmOrder(o, u.user);
    else if (action === 'reopen') o = await db.updateOffer(o.id, { status: 'sent', timeline: o.timeline.concat([[now(), `Status zurückgesetzt (${u.user})`]]) });
    else return json({ error: 'unknown action' }, 400);
    return json({ ok: true, offer: o });
  } catch (e) { return fail(e); }
}
