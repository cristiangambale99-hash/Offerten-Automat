/* mail.js – Versand über Resend */
const { Resend } = require('resend');
let _r; const resend = () => { if (!_r) _r = new Resend(process.env.RESEND_API_KEY); return _r; };

async function sendMail({ to, cc, subject, html, attachments, replyTo }) {
  const from = process.env.MAIL_FROM || 'Spezialreinigung <spezialreinigung@clean-service.ch>';
  const payload = { from, to: Array.isArray(to) ? to : [to], subject, html, replyTo: replyTo || process.env.MAIL_REPLY_TO || 'spezialreinigung@clean-service.ch' };
  if (cc) payload.cc = Array.isArray(cc) ? cc : [cc];
  if (attachments) payload.attachments = attachments.map(a => ({ filename: a.filename, content: a.content.toString('base64') }));
  if (process.env.MAIL_TEST_TO) { payload.subject = `[TEST → ${payload.to.join(', ')}] ` + subject; payload.to = [process.env.MAIL_TEST_TO]; delete payload.cc; }
  const { data, error } = await resend().emails.send(payload);
  if (error) throw new Error(error.message || JSON.stringify(error));
  return data;
}
module.exports = { sendMail };
