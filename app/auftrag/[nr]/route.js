import * as db from '../../../lib/db.js';
import * as D from '../../../lib/doc.js';
export const dynamic = 'force-dynamic';
const simple = (title, text) => `<!doctype html><html lang="de-CH"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${title}</title></head><body style="font-family:system-ui,sans-serif;color:#3c3c3b;max-width:560px;margin:60px auto;padding:0 20px;text-align:center"><img src="/brand/logo.png" width="170"><h1 style="font-weight:300;color:#1b8384">${title}</h1><p>${text}</p><p><a href="tel:0844355355" style="color:#1b8384">0844 355 355</a> · <a href="mailto:spezialreinigung@clean-service.ch" style="color:#1b8384">spezialreinigung@clean-service.ch</a></p></body></html>`;
export async function GET(req, { params }) {
  const o = await db.getOfferByNr(Number(params.nr)); const t = new URL(req.url).searchParams.get('t');
  const h = { 'content-type': 'text/html; charset=utf-8' };
  if (!o || t !== o.token) return new Response(simple('Link ungültig', 'Dieser Link ist nicht gültig. Bitte verwenden Sie den Knopf aus unserer Offert-Mail oder kontaktieren Sie uns.'), { status: 404, headers: h });
  if (o.status === 'accepted' || o.status === 'confirmed') return new Response(simple('Auftrag bereits erteilt', `Vielen Dank – Ihre Auftragserteilung für die Offerte ${o.nr} ist bereits bei uns eingegangen.`), { headers: h });
  if (o.status === 'declined') return new Response(simple('Offerte nicht mehr aktiv', 'Diese Offerte ist nicht mehr aktiv. Gerne erstellen wir Ihnen eine neue.'), { headers: h });
  const s = await db.getSettings();
  return new Response(D.auftragHtml(o, s, process.env.PUBLIC_BASE_URL || ''), { headers: h });
}
