import { requireUser, json, fail } from '../../../lib/http.js';
import * as db from '../../../lib/db.js';
export const dynamic = 'force-dynamic';
export async function PUT(req) { try { requireUser(req); const p = await req.json(); await db.savePrices(p); return json({ ok: true }); } catch (e) { return fail(e); } }
