/* pipeline.js – Anfrage → Preis → Offerte → PDF → Mail */
const C = require('./core.js');
const D = require('./doc.js');
const db = require('./db.js');
const { htmlToPdf } = require('./pdf.js');
const { sendMail } = require('./mail.js');
const { offerToken } = require('./auth.js');

function baseUrl() { return (process.env.PUBLIC_BASE_URL || '').replace(/\/$/, ''); }
const now = () => { const d = new Date(); return `${String(d.getDate()).padStart(2, '0')}.${String(d.getMonth() + 1).padStart(2, '0')}. ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`; };

/* JetFormBuilder-Felder (Webhook) in den Mailtext-Standard übersetzen, den der Parser kennt */
function fieldsToMail(f) {
  const g = (...keys) => { for (const k of keys) { const v = f[k]; if (v !== undefined && v !== null && String(v).trim() !== '') return Array.isArray(v) ? v.join(', ') : String(v); } return ''; };
  const zusatz = g('zusatz', 'umzug_zusatz', 'Zusatz');
  const bilder = g('bilder', 'umzug_bilder', 'Bilder', 'bilder_hinzufuegen');
  return `Offertanfrage für:\n${g('offertanfrage_fuer', 'anfrage_typ', 'typ_anfrage') || 'Umzugsreinigung'}\n\nAnrede: ${g('anrede', 'Anrede')}\nVorname: ${g('vorname', 'Vorname')}\nName: ${g('name', 'nachname', 'Name')}\n\nAdresse: ${g('adresse', 'Adresse', 'strasse')}\nPLZ: ${g('plz', 'PLZ')}\nOrt: ${g('ort', 'Ort')}\nTelefon: ${g('telefon', 'telefonnummer', 'Telefon', 'phone')}\nE-Mail: ${g('email', 'e_mail', 'E-Mail', 'mail')}\n\nObjekt:\nAnzahl Zimmer: ${g('anzahl_zimmer', 'umzug_anzahl_zimmer', 'zimmer')}\nQuadratmeter: ${g('quadratmeter', 'umzug_quadratmeter', 'umzug_quadratmeterliste', 'm2')} m2\nTyp: ${g('typ', 'umzug_typ', 'objekttyp')}\nVerschmutzungsgrad: ${g('verschmutzungsgrad', 'verschmutzung', 'umzug_verschmutzung')}\n\nZusatz:\n${zusatz}\nBalkon: ${g('balkon', 'umzug_balkon')}\nTerrasse: ${g('terrasse', 'umzug_terrasse')}\nSitzplatz: ${g('sitzplatz', 'umzug_sitzplatz')}\nGarage: ${g('garage', 'umzug_garage')}\n\nSpezielle Dienstleistungen:\nTeppich sprühextrahieren: ${g('teppich', 'teppich_spruehextrahieren', 'umzug_teppich')}\nVerglasung: ${g('verglasung', 'umzug_verglasung')}\nDübellöcher: ${g('duebelloecher', 'dubelloecher', 'umzug_duebelloecher', 'duebel')}\n\nGewünschter Reinigungstermin:\nVon: ${g('datum_von', 'termin_von', 'von')}\nBis: ${g('datum_bis', 'termin_bis', 'bis')}\n\nBilder:\n${bilder}\n\nNachricht:\n${g('nachricht', 'message', 'Nachricht')}\n\nWie sind Sie auf uns aufmerksam geworden?\n${g('quelle', 'aufmerksam', 'wie_aufmerksam', 'source')}\n\nDatenschutz:\n${g('datenschutz') ? 'Datenschutz akzeptiert' : ''}`;
}

/* Vollständiger Durchlauf. Gibt die gespeicherte Offerte zurück. */
async function processInquiry({ mailText, channel, raw, by }) {
  const [settings, prices] = await Promise.all([db.getSettings(), db.getPrices()]);
  const q = C.parseMail(mailText);
  const c = C.calc(q, prices);
  const flags = C.flags(q, c, settings, prices);
  const nr = await db.nextNr();
  const auto = settings.mode === 'auto' && flags.length === 0 && !!q.mail;
  const timeline = [[now(), channel === 'Telefon' ? `Telefonisch erfasst${by ? ' von ' + by : ''}` : `Anfrage über ${channel} eingegangen`], [now(), 'Preis berechnet, Offerte erstellt']];
  let o = await db.insertOffer({ nr, status: 'review', channel, received: new Date(), sentAt: null, q, c, flags, timeline, token: offerToken(nr), raw });
  // PDF immer erzeugen und ablegen
  try {
    const pdf = await renderOfferPdf(o, settings);
    const path = `${nr}/Auftragsofferte_${nr}.pdf`;
    await db.uploadPdf(path, pdf);
    o = await db.updateOffer(o.id, { pdfPath: path });
  } catch (e) { await db.logEvent('pdf_error', { nr, error: String(e.message || e) }); }
  if (auto) {
    o = await sendOffer(o, settings, 'Automat');
  } else {
    const t = o.timeline.concat([[now(), 'Angehalten: ' + (flags.map(f => f.t).join(', ') || (settings.mode !== 'auto' ? 'Freigabe gemäss Einstellung' : 'keine E-Mail-Adresse'))]]);
    o = await db.updateOffer(o.id, { timeline: t });
  }
  await db.logEvent('inquiry', { nr, channel, auto, flags: flags.map(f => f.t) });
  return o;
}

async function renderOfferPdf(o, settings) {
  const html = D.docHtml(o, settings, baseUrl());
  return htmlToPdf(html);
}

async function getOrRenderPdf(o, settings) {
  if (o.pdfPath) { const b = await db.downloadPdf(o.pdfPath); if (b) return b; }
  const pdf = await renderOfferPdf(o, settings);
  try { const path = `${o.nr}/Auftragsofferte_${o.nr}.pdf`; await db.uploadPdf(path, pdf); await db.updateOffer(o.id, { pdfPath: path }); } catch (_) { }
  return pdf;
}

async function sendOffer(o, settings, by) {
  settings = settings || await db.getSettings();
  const pdf = await getOrRenderPdf(o, settings);
  const q = o.q; const B = baseUrl();
  const html = D.mailHtml(o, settings, B).split('<table role="presentation" width="100%"').slice(1).join('<table role="presentation" width="100%"');
  const body = `<!doctype html><html><body style="margin:0;background:#f3f4f6;font-family:Verdana,Geneva,sans-serif;color:#3c3c3b"><table role="presentation" width="100%"${html}`;
  await sendMail({ to: q.mail, cc: settings.cc, subject: `Ihre Offerte ${o.nr} – Umzugsreinigung ${q.plz} ${q.ort}`, html: body, attachments: [{ filename: `Auftragsofferte ${o.nr}.pdf`, content: pdf }] });
  const t = o.timeline.concat([[now(), `${by === 'Automat' ? 'Automatisch' : 'Freigegeben von ' + by + ','} an ${q.mail} gesendet (Kopie ${settings.cc})`]]);
  return db.updateOffer(o.id, { status: 'sent', sentAt: new Date(), timeline: t });
}

async function recordOrder(o, form) {
  const settings = await db.getSettings(); const B = baseUrl();
  const auftrag = { verwaltung: form.verwaltung || '', uebergabe: form.uebergabe || '', termin: form.termin || '', neueAdresse: form.neue_adresse || '', ansprechperson: form.ansprechperson || '', telefon: form.telefon || '', schluessel: form.schluessel || '', parkplatz: form.parkplatz || '', zahlung: form.zahlung || 'Rechnung', ortDatum: form.ort_datum || '', signatur: form.signatur || null, agb: !!form.agb, ip: form.ip || '', at: new Date().toISOString() };
  const t = o.timeline.concat([[now(), 'Auftrag online erteilt (Kunde, unterschrieben)']]);
  const updated = await db.updateOffer(o.id, { status: 'accepted', auftrag, timeline: t });
  // Kopie an Kunde + Info an Team
  const sum = `<p>Verwaltung: ${esc(auftrag.verwaltung)}<br>Übergabetermin: ${esc(auftrag.uebergabe)}<br>Reinigungstermin: ${esc(auftrag.termin)}<br>Ansprechperson: ${esc(auftrag.ansprechperson)} · ${esc(auftrag.telefon)}<br>Schlüssel: ${esc(auftrag.schluessel)}<br>Parkplatz: ${esc(auftrag.parkplatz)}<br>Zahlungsart: ${esc(auftrag.zahlung)}<br>Neue Adresse: ${esc(auftrag.neueAdresse)}</p>`;
  try {
    await sendMail({ to: o.q.mail, cc: settings.cc, subject: `Eingang Ihrer Auftragserteilung ${o.nr} – Clean Service Scaramuzzo AG`, html: `<div style="font-family:Verdana,Geneva,sans-serif;font-size:10pt;color:#3c3c3b;line-height:1.6;max-width:640px"><img src="${B}/brand/logo.png" width="170" style="display:block;margin-bottom:18px"><p>${esc(anrede(o.q))}</p><p>Vielen Dank – Ihre Auftragserteilung für die Umzugsreinigung (Offerte ${o.nr}) ist bei uns eingegangen. Sie erhalten innert eines Arbeitstages unsere Auftragsbestätigung mit allen Details.</p>${sum}${auftrag.signatur ? `<p>Unterschrift:<br><img src="${auftrag.signatur}" width="220" style="border-bottom:1px solid #999"></p>` : ''}<p>Freundliche Grüsse<br><b>${esc(settings.name)}</b><br><span style="color:#767676">${esc(settings.fn)}</span></p><p style="color:#60beb3;font-weight:700;margin-top:18px">Clean Service Scaramuzzo AG</p><p style="color:#767676">Industriestrasse 5 · 8307 Effretikon · T 0844 355 355 · clean-service.ch</p></div>` });
  } catch (e) { await db.logEvent('mail_error', { nr: o.nr, step: 'order_copy', error: String(e.message || e) }); }
  return updated;
}

async function confirmOrder(o, by) {
  const settings = await db.getSettings(); const B = baseUrl();
  const pdf = await getOrRenderPdf(o, settings);
  const html = D.bestaetigungHtml(o, settings, B).split('<table role="presentation" width="100%"').slice(1).join('<table role="presentation" width="100%"');
  const body = `<!doctype html><html><body style="margin:0;background:#f3f4f6;font-family:Verdana,Geneva,sans-serif;color:#3c3c3b"><table role="presentation" width="100%"${html}`;
  await sendMail({ to: o.q.mail, cc: settings.cc, subject: `Auftragsbestätigung ${o.nr} – Umzugsreinigung ${o.q.plz} ${o.q.ort}`, html: body, attachments: [{ filename: `Auftragsofferte ${o.nr}.pdf`, content: pdf }] });
  const t = o.timeline.concat([[now(), `Auftragsbestätigung an ${o.q.mail} gesendet (${by})`]]);
  return db.updateOffer(o.id, { status: 'confirmed', timeline: t });
}

async function notifyTeam(subject, html) { try { const s = await db.getSettings(); await sendMail({ to: s.cc || 'info@clean-service.ch', subject, html }); } catch (_) { } }

const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const anrede = q => q.anrede === 'Frau' ? 'Sehr geehrte Frau ' + q.name : q.anrede === 'Herr' ? 'Sehr geehrter Herr ' + q.name : 'Sehr geehrte Damen und Herren';

module.exports = { processInquiry, sendOffer, recordOrder, confirmOrder, renderOfferPdf, getOrRenderPdf, fieldsToMail, notifyTeam, baseUrl, now };
