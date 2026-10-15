import { requireUser, json, fail } from '../../../lib/http.js';
import * as db from '../../../lib/db.js';
export const dynamic = 'force-dynamic';
export async function PUT(req) { try { requireUser(req); const s = await req.json(); await db.saveSettings(s); if (s.nextNr) { await db.sb().from('counters').update({ value: Number(s.nextNr) - 1 }).eq('id', 'offer_nr'); } return json({ ok: true }); } catch (e) { return fail(e); } }
