/* db.js – Supabase-Zugriff (Service Role, nur serverseitig) */
const { createClient } = require('@supabase/supabase-js');
const C = require('./core.js');

let _sb;
function sb() {
  if (!_sb) _sb = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });
  return _sb;
}

async function getSettings() {
  const { data } = await sb().from('settings').select('data').eq('id', 1).maybeSingle();
  return { ...C.DEFAULT_SETTINGS, ...(data?.data || {}), rules: { ...C.DEFAULT_SETTINGS.rules, ...((data?.data || {}).rules || {}) } };
}
async function saveSettings(s) { await sb().from('settings').upsert({ id: 1, data: s }); }

async function getPrices() {
  const { data } = await sb().from('settings').select('data').eq('id', 2).maybeSingle();
  const p = data?.data || {};
  return deepMerge(JSON.parse(JSON.stringify(C.PRICES)), p);
}
async function savePrices(p) { await sb().from('settings').upsert({ id: 2, data: p }); }
function deepMerge(a, b) { for (const k of Object.keys(b || {})) { if (b[k] && typeof b[k] === 'object' && !Array.isArray(b[k])) a[k] = deepMerge(a[k] || {}, b[k]); else a[k] = b[k]; } return a; }

async function nextNr() {
  const { data, error } = await sb().rpc('next_offer_nr');
  if (error) throw error;
  return data;
}

function rowToOffer(r) {
  return { id: r.id, nr: r.nr, status: r.status, channel: r.channel, received: new Date(r.received_at), sentAt: r.sent_at ? new Date(r.sent_at) : null, q: r.q, c: r.calc, flags: r.flags || [], timeline: r.timeline || [], auftrag: r.auftrag || null, token: r.token, pdfPath: r.pdf_path || null };
}

async function listOffers() {
  const { data, error } = await sb().from('offers').select('*').order('received_at', { ascending: false }).limit(1000);
  if (error) throw error;
  return data.map(rowToOffer);
}
async function getOffer(id) {
  const { data } = await sb().from('offers').select('*').eq('id', id).maybeSingle();
  return data ? rowToOffer(data) : null;
}
async function getOfferByNr(nr) {
  const { data } = await sb().from('offers').select('*').eq('nr', nr).maybeSingle();
  return data ? rowToOffer(data) : null;
}
async function insertOffer(o) {
  const { data, error } = await sb().from('offers').insert({ nr: o.nr, status: o.status, channel: o.channel, received_at: o.received.toISOString(), sent_at: o.sentAt ? o.sentAt.toISOString() : null, q: o.q, calc: o.c, flags: o.flags, timeline: o.timeline, auftrag: o.auftrag || null, token: o.token, raw: o.raw || null }).select('*').single();
  if (error) throw error;
  return rowToOffer(data);
}
async function updateOffer(id, patch) {
  const p = {};
  if ('status' in patch) p.status = patch.status;
  if ('sentAt' in patch) p.sent_at = patch.sentAt ? patch.sentAt.toISOString() : null;
  if ('timeline' in patch) p.timeline = patch.timeline;
  if ('auftrag' in patch) p.auftrag = patch.auftrag;
  if ('c' in patch) p.calc = patch.c;
  if ('flags' in patch) p.flags = patch.flags;
  if ('q' in patch) p.q = patch.q;
  if ('pdfPath' in patch) p.pdf_path = patch.pdfPath;
  const { data, error } = await sb().from('offers').update(p).eq('id', id).select('*').single();
  if (error) throw error;
  return rowToOffer(data);
}
async function logEvent(kind, payload) { try { await sb().from('events').insert({ kind, payload }); } catch (_) { } }

async function uploadPdf(path, buffer) {
  const { error } = await sb().storage.from('offerten').upload(path, buffer, { contentType: 'application/pdf', upsert: true });
  if (error) throw error;
  return path;
}
async function downloadPdf(path) {
  const { data, error } = await sb().storage.from('offerten').download(path);
  if (error) return null;
  return Buffer.from(await data.arrayBuffer());
}

module.exports = { sb, getSettings, saveSettings, getPrices, savePrices, nextNr, listOffers, getOffer, getOfferByNr, insertOffer, updateOffer, logEvent, uploadPdf, downloadPdf };
