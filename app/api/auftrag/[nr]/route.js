import { json } from '../../../../lib/http.js';
import * as db from '../../../../lib/db.js';
import { recordOrder, notifyTeam } from '../../../../lib/pipeline.js';
export const dynamic = 'force-dynamic'; export const maxDuration = 60;
export async function POST(req, { params }) {
  const o = await db.getOfferByNr(Number(params.nr)); const b = await req.json().catch(() => ({}));
  if (!o || b.t !== o.token) return json({ error: 'forbidden' }, 403);
  if (o.status !== 'sent' && o.status !== 'review') return json({ error: 'already' }, 409);
  if (!b.agb) return json({ error: 'agb' }, 400);
  b.ip = req.headers.get('x-forwarded-for') || '';
  const u = await recordOrder(o, b);
  const B = process.env.PUBLIC_BASE_URL || '';
  await notifyTeam(`Auftrag ${o.nr} online erteilt – ${o.q.vorname} ${o.q.name}, ${o.q.plz} ${o.q.ort}`, `<p>Der Kunde hat die Auftragserteilung online ausgefüllt und unterschrieben.</p><p>Reinigungstermin: ${b.termin || '–'}<br>Übergabe: ${b.uebergabe || '–'}<br>Verwaltung: ${b.verwaltung || '–'}</p><p><a href="${B}/">Im Offerten-Automat öffnen und Auftrag bestätigen</a></p>`);
  return json({ ok: true, nr: u.nr });
}
