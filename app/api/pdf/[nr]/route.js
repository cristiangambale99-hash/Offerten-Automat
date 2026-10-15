import { userFromCookies } from '../../../../lib/auth.js';
import * as db from '../../../../lib/db.js';
import { getOrRenderPdf } from '../../../../lib/pipeline.js';
export const dynamic = 'force-dynamic'; export const maxDuration = 60;
export async function GET(req, { params }) {
  const o = await db.getOfferByNr(Number(params.nr)); if (!o) return new Response('not found', { status: 404 });
  const t = new URL(req.url).searchParams.get('t'); const u = userFromCookies(req.headers.get('cookie'));
  if (!u && t !== o.token) return new Response('forbidden', { status: 403 });
  const pdf = await getOrRenderPdf(o, await db.getSettings());
  return new Response(pdf, { headers: { 'content-type': 'application/pdf', 'content-disposition': `inline; filename="Auftragsofferte ${o.nr}.pdf"` } });
}
