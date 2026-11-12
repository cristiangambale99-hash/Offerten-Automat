/* mail.js – Versand über Resend (REST-API) */

/* Eigene Bilder (…/brand/*.png) werden als eingebettete Bilder (CID) mitgeschickt.
   So zeigt Outlook Logo und ISO-Zeile sofort an, ohne «Bilder herunterladen». */
const _img = {};
async function loadImg(url) {
  if (_img[url]) return _img[url];
  const r = await fetch(url);
  if (!r.ok) throw new Error('Bild nicht ladbar: ' + url);
  return (_img[url] = Buffer.from(await r.arrayBuffer()).toString('base64'));
}
async function inlineImages(html) {
  const urls = [...new Set([...html.matchAll(/src="(https?:\/\/[^"]+\/brand\/([\w-]+)\.png)"/g)].map(m => m[1]))];
  const att = [];
  for (const url of urls) {
    try {
      const name = url.match(/\/brand\/([\w-]+)\.png$/)[1];
      const cid = `cs-${name}`;
      att.push({ filename: `${name}.png`, content: await loadImg(url), content_type: 'image/png', content_id: cid });
      html = html.split(`src="${url}"`).join(`src="cid:${cid}"`);
    } catch (e) { /* Bild bleibt verlinkt */ }
  }
  return { html, att };
}

async function sendMail({ to, cc, subject, html, attachments, replyTo }) {
  const from = process.env.MAIL_FROM || 'Spezialreinigung <spezialreinigung@clean-service.ch>';
  const inl = await inlineImages(html);
  const payload = { from, to: Array.isArray(to) ? to : [to], subject, html: inl.html, reply_to: replyTo || process.env.MAIL_REPLY_TO || 'spezialreinigung@clean-service.ch' };
  if (cc) payload.cc = Array.isArray(cc) ? cc : [cc];
  const files = (attachments || []).map(a => ({ filename: a.filename, content: a.content.toString('base64') }));
  if (files.length || inl.att.length) payload.attachments = files.concat(inl.att);
  if (process.env.MAIL_TEST_TO) { payload.subject = `[TEST → ${payload.to.join(', ')}] ` + subject; payload.to = [process.env.MAIL_TEST_TO]; delete payload.cc; }
  const r = await fetch('https://api.resend.com/emails', { method: 'POST', headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
  const data = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(data.message || JSON.stringify(data));
  return data;
}
module.exports = { sendMail };
