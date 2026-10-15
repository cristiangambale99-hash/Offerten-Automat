import { requireUser, json, fail } from '../../../lib/http.js';
import * as db from '../../../lib/db.js';
export const dynamic = 'force-dynamic';
export async function GET(req) {
  try { requireUser(req);
    const [offers, settings, prices] = await Promise.all([db.listOffers(), db.getSettings(), db.getPrices()]);
    const { data: ctr } = await db.sb().from('counters').select('value').eq('id', 'offer_nr').maybeSingle();
    return json({ offers, settings, prices, nextNr: (ctr?.value || 0) + 1, base: process.env.PUBLIC_BASE_URL || '' });
  } catch (e) { return fail(e); }
}
