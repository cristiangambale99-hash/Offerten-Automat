import { requireUser, fail } from '../../../lib/http.js';
import * as db from '../../../lib/db.js';
export const dynamic = 'force-dynamic';
export async function GET(req) {
  try { requireUser(req); const offers = await db.listOffers();
    const ST = { review: 'Freigabe nötig', sent: 'Offerte gesendet', accepted: 'Auftrag erteilt', confirmed: 'Bestätigt', declined: 'Abgelehnt' };
    const head = ['Offerte', 'Eingang', 'Kanal', 'Status', 'Anrede', 'Vorname', 'Name', 'Adresse', 'PLZ', 'Ort', 'Kanton', 'Telefon', 'E-Mail', 'Zimmer', 'm2', 'Typ', 'Verschmutzung', 'Quelle', 'Netto', 'MwSt', 'Brutto', 'Gesendet', 'Reinigungstermin'];
    const rows = offers.map(o => [o.nr, o.received.toISOString().slice(0, 10), o.channel, ST[o.status] || o.status, o.q.anrede, o.q.vorname, o.q.name, o.q.adresse, o.q.plz, o.q.ort, o.q.kanton, o.q.tel, o.q.mail, o.q.zimmer, o.q.m2, o.q.typ, o.q.soil, o.q.quelle, o.c.netto.toFixed(2), o.c.mwst.toFixed(2), o.c.brutto.toFixed(2), o.sentAt ? o.sentAt.toISOString().slice(0, 10) : '', o.auftrag?.termin || '']);
    const csv = '﻿' + [head, ...rows].map(r => r.map(v => `"${String(v ?? '').replace(/"/g, '""')}"`).join(';')).join('\r\n');
    return new Response(csv, { headers: { 'content-type': 'text/csv; charset=utf-8', 'content-disposition': 'attachment; filename="offerten-umzugsreinigung.csv"' } });
  } catch (e) { return fail(e); }
}
