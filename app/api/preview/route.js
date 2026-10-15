import { requireUser, html, fail } from '../../../lib/http.js';
import * as db from '../../../lib/db.js';
import * as D from '../../../lib/doc.js';
export const dynamic = 'force-dynamic';
export async function GET(req) {
  try { requireUser(req); const u = new URL(req.url); const o = u.searchParams.get('id') ? await db.getOffer(u.searchParams.get('id')) : null; if (!o && u.searchParams.get('draft') !== '1') return html('not found', 404);
    const s = await db.getSettings(); const B = process.env.PUBLIC_BASE_URL || ''; const kind = u.searchParams.get('kind');
    if (u.searchParams.get('draft') === '1') { const C = require('../../../lib/core.js'); const prices = await db.getPrices(); const q = C.parseMail(u.searchParams.get('mail') || ''); const { data: ctr } = await db.sb().from('counters').select('value').eq('id', 'offer_nr').maybeSingle(); const draft = { nr: (ctr?.value || 0) + 1, q, c: C.calc(q, prices), received: new Date(), token: 'vorschau', flags: [] }; return html(D.docHtml(draft, s, B)); }
    if (kind === 'mail') return html(D.mailHtml(o, s, B));
    if (kind === 'auftrag') return html(D.auftragHtml(o, s, B).replace('%%PREVIEW%%', '1'));
    if (kind === 'bestaetigung') return html(D.bestaetigungHtml(o, s, B));
    return html(D.docHtml(o, s, B));
  } catch (e) { return fail(e); }
}
