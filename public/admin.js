/* admin.js – Offerten-Automat Umzugsreinigung (Live) */
(function(){
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const {parseMail,calc,flags,chf,num,esc}=CORE;
let PRICES=JSON.parse(JSON.stringify(CORE.PRICES)), SETTINGS=JSON.parse(JSON.stringify(CORE.DEFAULT_SETTINGS)), DB=[], BASE='', nextNr=0;
const MON=['Januar','Februar','März','April','Mai','Juni','Juli','August','September','Oktober','November','Dezember'];
const TAGE=['Sonntag','Montag','Dienstag','Mittwoch','Donnerstag','Freitag','Samstag'];
const TODAY=new Date();
const dShort=d=>`${String(d.getDate()).padStart(2,'0')}.${String(d.getMonth()+1).padStart(2,'0')}.${d.getFullYear()}`;
const dLong=d=>`${TAGE[d.getDay()]}, ${d.getDate()}. ${MON[d.getMonth()]}`;
const addDays=(d,n)=>{const x=new Date(d);x.setDate(x.getDate()+n);return x};
async function api(url,body,method){const r=await fetch(url,{method:method||(body?'POST':'GET'),headers:{'content-type':'application/json'},body:body?JSON.stringify(body):undefined});if(r.status===401){location.href='/login';throw new Error('Nicht angemeldet');}const j=await r.json().catch(()=>({}));if(!r.ok)throw new Error(j.error||r.statusText);return j;}
const hydrate=o=>({...o,received:new Date(o.received),sentAt:o.sentAt?new Date(o.sentAt):null});
const SAMPLE_MAILS=['Sie haben folgende Offertanfrage erhalten:\n\nOffertanfrage für:\nUmzugsreinigung\n\nAnrede: Frau\nVorname: Natalija\nName: Papovic\n\nAdresse:\nPLZ: 5432\nOrt: Neuenhof\nTelefon: 0763238956\nE-Mail: natalija.papovic@hotmail.ch\n\nObjekt:\nAnzahl Zimmer: 4.5\nQuadratmeter: 100 m2\nTyp: Wohnung\nVerschmutzungsgrad: mittel\n\nZusatz:\nWaschmaschine / Tumbler\nBalkon: Hochdruck\nTerrasse:\nSitzplatz:\nGarage:\n\nSpezielle Dienstleistungen:\nTeppich sprühextrahieren:\nVerglasung: Balkon\nDübellöcher:\n\nGewünschter Reinigungstermin:\nVon: 09.10.26\nBis: 16.10.26\n\nBilder:\n\nNachricht:\nEs muss eine komplette reinigung gemacht werden. So schnell es möglich ist, wäre super!\n\nWie sind Sie auf uns aufmerksam geworden?\nSuchmaschine\n\nDatenschutz:\nDatenschutz akzeptiert'];
/* ---------- Lottie ---------- */
const anims=new Map();
function lot(el,key){if(!el||!window.CS_LOTTIE||!window.lottie)return;if(anims.has(el)){anims.get(el).destroy();}anims.set(el,CS_LOTTIE.play(el,key));}
function mountLotties(root=document){root.querySelectorAll('[data-lottie]').forEach(el=>{if(!el.dataset.mounted){el.dataset.mounted='1';lot(el,el.dataset.lottie);}});}
let toastT;function toast(tx,key='check'){const t=$('#toast');$('#toastTx').textContent=tx;lot($('#toastIc'),key);t.classList.add('show');clearTimeout(toastT);toastT=setTimeout(()=>t.classList.remove('show'),2600);}

/* ---------- Navigation ---------- */
function go(v){$$('[data-view]').forEach(s=>s.classList.toggle('on',s.dataset.view===v));$$('.nav-i[data-go],.dnav[data-go]').forEach(b=>{if(b.dataset.go===v)b.setAttribute('aria-current','page');else b.removeAttribute('aria-current')});closeDrawer();window.scrollTo({top:0});if(v==='dash')renderDash();if(v==='anfragen')renderA();if(v==='offerten')renderO();if(v==='preise')renderPrices();if(v==='auswertung')renderAuswertung();if(v==='test')renderTest();if(v==='settings')fillSettings();}
document.addEventListener('click',e=>{const b=e.target.closest('[data-go]');if(b){go(b.dataset.go);}});
const drawer=$('#drawer'),dscrim=$('#dscrim');
function openDrawer(){drawer.classList.add('open');dscrim.classList.add('open');drawer.setAttribute('aria-hidden','false');$('#menuBtn').setAttribute('aria-expanded','true');$('#dClose').focus();}
function closeDrawer(){drawer.classList.remove('open');dscrim.classList.remove('open');drawer.setAttribute('aria-hidden','true');$('#menuBtn').setAttribute('aria-expanded','false');}
$('#menuBtn').onclick=openDrawer;$('#dClose').onclick=closeDrawer;dscrim.onclick=closeDrawer;
const panel=$('#panel'),scrim=$('#scrim');
function openPanel(){panel.classList.add('open');scrim.classList.add('open');panel.setAttribute('aria-hidden','false');$('#pClose').focus();}
function closePanel(){panel.classList.remove('open');scrim.classList.remove('open');panel.setAttribute('aria-hidden','true');$$('tr[aria-selected]').forEach(t=>t.removeAttribute('aria-selected'));}
$('#pClose').onclick=closePanel;scrim.onclick=closePanel;
document.addEventListener('keydown',e=>{if(e.key==='Escape'){closePanel();closeDrawer();closeDoc();}});

/* ---------- Status ---------- */
const ST={review:['Freigabe nötig','b-warn'],sent:['Offerte gesendet','b-info'],accepted:['Auftrag erteilt','b-ok'],confirmed:['Bestätigt','b-ok'],declined:['Abgelehnt','b-neutral']};
const badge=s=>`<span class="badge ${ST[s][1]}">${ST[s][0]}</span>`;
const fullName=q=>`${q.vorname} ${q.name}`.trim();
const objLbl=q=>`${q.zimmer?q.zimmer+' Zi · ':''}${q.m2} m² · ${q.typ}`;


/* ---------- Dashboard ---------- */
function renderDash(){
  $('#todayLbl').textContent=dLong(TODAY);
  const m=TODAY.getMonth(),y=TODAY.getFullYear();
  const month=DB.filter(o=>o.received.getMonth()===m&&o.received.getFullYear()===y);
  const prev=DB.filter(o=>{const d=new Date(y,m-1,1);return o.received.getMonth()===d.getMonth()&&o.received.getFullYear()===d.getFullYear()});
  const auto=DB.filter(o=>o.sentAt&&!(o.flags||[]).length&&o.channel==='Webformular').length;
  const acc=DB.filter(o=>['accepted','confirmed'].includes(o.status)).length,dec=DB.filter(o=>['accepted','confirmed','declined'].includes(o.status)).length;
  const rev=DB.filter(o=>o.status==='review').length;
  $('#kpis').innerHTML=[
    ['Anfragen '+MON[m],month.length,`${prev.length} im Vormonat`,'up'],
    ['Automatisch gesendet',DB.length?Math.round(auto/DB.length*100)+' %':'–',`${auto} von ${DB.length} ohne Klick`,'up'],
    ['Auftragsquote',dec?Math.round(acc/dec*100)+' %':'–',`${acc} Aufträge erteilt`,'up'],
    ['Wartet auf Freigabe',rev,rev?'unter Anfragen → Freigabe nötig':'alles erledigt',rev?'down':'up']
  ].map(k=>`<div class="card kpi"><div class="l">${k[0]}</div><div class="v num">${k[1]}</div><div class="d ${k[3]}">${k[2]}</div></div>`).join('');
  const A=[],Bv=[];for(let i=7;i>=0;i--){const from=addDays(TODAY,-7*i-6),to=addDays(TODAY,-7*i);const w=DB.filter(o=>o.received>=from&&o.received<=addDays(to,1));A.push(w.length);Bv.push(w.filter(o=>(o.flags||[]).length).length);}
  const W=400,H=110,p=10,max=Math.max(5,...A);const x=i=>p+i*(W-2*p)/7,yy=v=>H-p-v*(H-2*p)/max;
  const path=arr=>arr.map((v,i)=>(i?'L':'M')+x(i)+' '+yy(v)).join(' ');
  $('#spark').innerHTML=`<path d="${path(A)} L${x(7)} ${H-p} L${x(0)} ${H-p}Z" fill="#2bb6b7" opacity=".12"/><path d="${path(A)}" fill="none" stroke="#2bb6b7" stroke-width="2.2" stroke-linejoin="round"/><path d="${path(Bv)}" fill="none" stroke="#98c2d1" stroke-width="2" stroke-dasharray="4 4"/>${A.map((v,i)=>`<circle cx="${x(i)}" cy="${yy(v)}" r="3" fill="#1b8384"/>`).join('')}`;
}
/* ---------- Listen ---------- */
let fA='all',fO='all';
function renderA(){
  const q=($('#qA').value||'').toLowerCase();
  const rows=DB.filter(o=>(fA==='all'||o.status===fA)&&(!q||[fullName(o.q),o.q.ort,o.q.plz,String(o.nr)].join(' ').toLowerCase().includes(q))).sort((a,b)=>b.received-a.received);
  $('#tblA tbody').innerHTML=rows.map(o=>`<tr data-id="${o.id}"><td class="num">${dShort(o.received)} ${String(o.received.getHours()).padStart(2,'0')}:${String(o.received.getMinutes()).padStart(2,'0')}</td><td><span class="name">${esc(fullName(o.q))}</span><br><small class="muted">${esc(o.q.mail)}</small></td><td>${esc(objLbl(o.q))}</td><td>${esc(o.q.plz+' '+o.q.ort)}</td><td>${esc(o.q.von?o.q.von+' – '+o.q.bis:'nach Vereinbarung')}</td><td>${badge(o.status)}</td><td class="num" style="text-align:right">${chf(o.c.netto)}</td></tr>`).join('');
  $('#mlA').innerHTML=rows.map(o=>`<div class="mrow" data-id="${o.id}"><div class="tx"><b>${esc(fullName(o.q))}</b><small>${esc(o.q.plz+' '+o.q.ort)} · ${esc(objLbl(o.q))} · ${chf(o.c.netto)}</small></div>${badge(o.status)}<svg style="width:18px;height:18px;color:var(--cs-fg-2)"><use href="#i-chev"/></svg></div>`).join('');
  $('#emptyA').hidden=rows.length>0;mountLotties($('#emptyA'));
  $$('#tblA tbody tr,#mlA .mrow').forEach(r=>r.onclick=()=>{$$('tr[aria-selected]').forEach(t=>t.removeAttribute('aria-selected'));r.setAttribute('aria-selected','true');openOffer(+r.dataset.id);});
}
function renderO(){
  const q=($('#qO').value||'').toLowerCase();
  const rows=DB.filter(o=>(fO==='all'||o.status===fO)&&(!q||[fullName(o.q),String(o.nr)].join(' ').toLowerCase().includes(q))).sort((a,b)=>b.nr-a.nr);
  const versand=o=>o.sentAt?(o.flags.length?'Nach Freigabe':'Automatisch'):'–';
  $('#tblO tbody').innerHTML=rows.map(o=>`<tr data-id="${o.id}"><td class="num name">${o.nr}</td><td>${esc(fullName(o.q))}<br><small class="muted">${esc(o.q.plz+' '+o.q.ort)}</small></td><td class="num">${dShort(o.received)}</td><td>${versand(o)}</td><td>${badge(o.status)}</td><td class="num" style="text-align:right">${chf(o.c.brutto)}</td></tr>`).join('');
  $('#mlO').innerHTML=rows.map(o=>`<div class="mrow" data-id="${o.id}"><div class="tx"><b>${o.nr} · ${esc(fullName(o.q))}</b><small>${dShort(o.received)} · ${versand(o)} · ${chf(o.c.brutto)}</small></div>${badge(o.status)}<svg style="width:18px;height:18px;color:var(--cs-fg-2)"><use href="#i-chev"/></svg></div>`).join('');
  $('#emptyO').hidden=rows.length>0;mountLotties($('#emptyO'));
  $$('#tblO tbody tr,#mlO .mrow').forEach(r=>r.onclick=()=>{$$('tr[aria-selected]').forEach(t=>t.removeAttribute('aria-selected'));r.setAttribute('aria-selected','true');openOffer(+r.dataset.id);});
}
$('#qA').oninput=renderA;$('#qO').oninput=renderO;
$$('[data-f]').forEach(c=>c.onclick=()=>{fA=c.dataset.f;$$('[data-f]').forEach(x=>x.setAttribute('aria-pressed',x===c));renderA();});
$$('[data-fo]').forEach(c=>c.onclick=()=>{fO=c.dataset.fo;$$('[data-fo]').forEach(x=>x.setAttribute('aria-pressed',x===c));renderO();});

/* ---------- Kalkulationstabelle ---------- */
function calcTable(c){
  return `<table class="calc"><tbody>${c.lines.map(l=>`<tr><td>${esc(l.label)}</td><td class="num">${l.grp==='zusatz'&&!l.amount?'<span class="badge b-warn">offen</span>':num(l.amount)}</td></tr>`).join('')}
  <tr class="tot"><td>Total exkl. MwSt</td><td class="num">${chf(c.netto)}</td></tr>
  <tr class="sub"><td>MwSt 8.1 %</td><td class="num">${num(c.mwst)}</td></tr>
  <tr class="tot"><td>Gesamttotal inkl. MwSt</td><td class="num">${chf(c.brutto)}</td></tr></tbody></table>`;
}
function flagHtml(F,autoOk){
  if(!F.length) return `<div class="flags"><div class="flag ok"><div class="ic" data-lottie="check"></div><div><b>Standardfall</b> – ${autoOk?'wird ohne Klick an den Kunden gesendet.':'alles im Rahmen der Preistabelle.'}</div></div></div>`;
  return `<div class="flags">${F.map(f=>`<div class="flag"><div class="ic" data-lottie="warning"></div><div><b>${esc(f.t)}</b><br><span class="muted">${esc(f.d)}</span></div></div>`).join('')}</div>`;
}


/* ---------- Detail-Panel ---------- */
function openOffer(id){
  const o=DB.find(x=>x.id===id);if(!o)return;const q=o.q;
  $('#pEyebrow').textContent=`Offerte ${o.nr} · ${o.channel}`;$('#pTitle').textContent=fullName(q);$('#pBadge').innerHTML=badge(o.status);
  $('#pBody').innerHTML=`
    <dl class="dl"><dt>Objekt</dt><dd>${esc(objLbl(q))}</dd><dt>Adresse</dt><dd>${esc(q.adresse||'–')}<br>${esc(q.plz+' '+q.ort)}${q.kanton?' ('+q.kanton+')':''}</dd><dt>Kontakt</dt><dd>${esc(q.tel)}<br>${esc(q.mail)}</dd><dt>Termin</dt><dd>${esc(q.von?q.von+' – '+q.bis:'nach Vereinbarung')}</dd><dt>Verschmutzung</dt><dd>${esc(q.soil)}</dd><dt>Quelle</dt><dd>${esc(q.quelle||'–')}</dd>${q.bilder?`<dt>Bilder</dt><dd>${(o.raw&&o.raw.bilder)?esc(String(o.raw.bilder)):'angehängt (siehe Mail)'}</dd>`:''}</dl>
    ${flagHtml(o.flags||[],SETTINGS.mode==='auto')}
    ${o.auftrag?`<div class="sec-t">Auftragserteilung des Kunden</div><dl class="dl"><dt>Verwaltung</dt><dd>${esc(o.auftrag.verwaltung)}</dd><dt>Übergabe</dt><dd>${esc(o.auftrag.uebergabe)}</dd><dt>Reinigung</dt><dd>${esc(o.auftrag.termin)}</dd><dt>Ansprechperson</dt><dd>${esc(o.auftrag.ansprechperson||'')} ${esc(o.auftrag.telefon||'')}</dd><dt>Zahlung</dt><dd>${esc(o.auftrag.zahlung)}</dd><dt>Schlüssel</dt><dd>${esc(o.auftrag.schluessel)}</dd>${o.auftrag.parkplatz?`<dt>Parkplatz</dt><dd>${esc(o.auftrag.parkplatz)}</dd>`:''}${o.auftrag.neueAdresse?`<dt>Neue Adresse</dt><dd>${esc(o.auftrag.neueAdresse)}</dd>`:''}${o.auftrag.signatur?`<dt>Unterschrift</dt><dd><img src="${o.auftrag.signatur}" style="width:160px;border-bottom:1px solid #c5dde1"></dd>`:''}</dl>`:''}
    <div class="sec-t">Kalkulation</div>${calcTable(o.c)}
    ${q.nachricht?`<div class="sec-t">Nachricht des Kunden</div><p style="font-size:14px;white-space:pre-line">${esc(q.nachricht)}</p>`:''}
    <div class="sec-t">Verlauf</div><ul class="timeline">${(o.timeline||[]).map(t=>`<li><span class="muted" style="min-width:86px">${esc(t[0])}</span><span>${esc(t[1])}</span></li>`).join('')}</ul>`;
  const F=$('#pFoot');F.innerHTML='';
  const mkBtn=(cls,lbl,icon,fn)=>{const b=document.createElement('button');b.className='btn '+cls;b.innerHTML=`<svg><use href="#${icon}"/></svg>${lbl}`;b.onclick=fn;F.appendChild(b);return b;};
  const act=async(action,okMsg,okIc)=>{try{const r=await api(`/api/offers/${o.id}`,{action});const n=hydrate(r.offer);Object.assign(o,n);closePanel();toast(okMsg,okIc);renderAll();}catch(e){toast('Fehler: '+e.message,'error');}};
  mkBtn('btn-s','Offerte (PDF)','i-doc',()=>window.open(`/api/pdf/${o.nr}`,'_blank'));
  mkBtn('btn-s','Kundenmail','i-mail',()=>showFrameHtml(`/api/preview?id=${o.id}&kind=mail`,`Mail an ${q.mail}`));
  if(o.status==='sent') mkBtn('btn-s','Kundenansicht Auftrag','i-chev',()=>showFrameHtml(`/api/preview?id=${o.id}&kind=auftrag`,`Online-Auftragserteilung ${o.nr} (so sieht es der Kunde – Vorschau, sendet nicht)`));
  if(o.status==='review'){mkBtn('btn-p','Freigeben und senden','i-send',()=>act('send',`Offerte ${o.nr} an ${q.mail} gesendet`,'sent'));mkBtn('btn-g','Ablehnen','i-x',()=>act('decline','Anfrage abgelehnt','cancelled'));}
  if(o.status==='sent'){mkBtn('btn-p','Auftrag erteilt (Papier/Telefon)','i-ok',()=>act('accept','Auftrag erfasst','calendar'));mkBtn('btn-g','Erneut senden','i-send',()=>act('resend','Offerte erneut gesendet','sent'));}
  if(o.status==='accepted'){mkBtn('btn-p','Auftrag bestätigen','i-send',()=>act('confirm',`Auftragsbestätigung ${o.nr} gesendet`,'calendar'));mkBtn('btn-g','Bestätigung ansehen','i-mail',()=>showFrameHtml(`/api/preview?id=${o.id}&kind=bestaetigung`,`Auftragsbestätigung ${o.nr}`));}
  if(o.status==='confirmed'){mkBtn('btn-s','Bestätigung ansehen','i-mail',()=>showFrameHtml(`/api/preview?id=${o.id}&kind=bestaetigung`,`Auftragsbestätigung ${o.nr}`));}
  if(o.status==='declined'){mkBtn('btn-g','Wieder aktivieren','i-ok',()=>act('reopen','Offerte wieder aktiv','check'));}
  mountLotties($('#pBody'));openPanel();
}
function renderAll(){renderDash();renderA();renderO();}
$('#btnSendAll').onclick=async()=>{const n=DB.filter(o=>o.status==='review'&&!(o.flags||[]).length);if(!n.length){toast('Keine Standardfälle offen – alle warten auf Freigabe','info');return;}for(const o of n){try{const r=await api(`/api/offers/${o.id}`,{action:'send'});Object.assign(o,hydrate(r.offer));}catch(e){toast('Fehler bei '+o.nr+': '+e.message,'error');}}toast(`${n.length} Offerten gesendet`,'sent');renderAll();};
/* ---------- Erfassen (manuell oder Mail) ---------- */
let testQ=null,testC=null,testSrc='',mode='manual';
const fd=(d)=>d?d.split('-').reverse().join('.'):'';
function manualToMail(){
  const f=$('#testForm');const v=n=>{const el=f.elements[n];if(!el)return '';if(el.type==='checkbox')return el.checked;return (el.value||'').trim()};
  const zusatz=[v('m_keller')&&'Keller',v('m_estrich')&&'Estrich',v('m_wm')&&'Waschmaschine / Tumbler'].filter(Boolean).join(', ');
  return `Offertanfrage für:\nUmzugsreinigung\n\nAnrede: ${v('m_anrede')}\nVorname: ${v('m_vorname')}\nName: ${v('m_name')}\n\nAdresse: ${v('m_adresse')}\nPLZ: ${v('m_plz')}\nOrt: ${v('m_ort')}\nTelefon: ${v('m_tel')}\nE-Mail: ${v('m_mail')}\n\nObjekt:\nAnzahl Zimmer: ${v('m_zimmer')}\nQuadratmeter: ${v('m_m2')} m2\nTyp: ${v('m_typ')}\nVerschmutzungsgrad: ${v('m_soil')}\n\nZusatz:\n${zusatz}\nBalkon: ${v('m_balkon')}\nTerrasse: ${v('m_terrasse')}\nSitzplatz: ${v('m_sitzplatz')}\nGarage: ${v('m_garage')}\n\nSpezielle Dienstleistungen:\nTeppich sprühextrahieren: ${v('m_teppich')}\nVerglasung: ${v('m_verglasung')}\nDübellöcher: ${v('m_duebel')}\n\nGewünschter Reinigungstermin:\nVon: ${fd(v('m_von'))}\nBis: ${fd(v('m_bis'))}\n\nBilder:\n\nNachricht:\n${v('m_nachricht')}\n\nWie sind Sie auf uns aufmerksam geworden?\n${v('m_quelle')}\n\nDatenschutz:\nTelefonisch erfasst`;
}
function renderTest(){if(!$('#mailTxt').value){$('#mailTxt').value=SAMPLE_MAILS[0];}liveParse();}
function liveParse(){
  const src=mode==='mail'?$('#mailTxt').value:manualToMail();
  const q=parseMail(src);testQ=q;testSrc=src;const c=calc(q,PRICES);testC=c;const F=flags(q,c,SETTINGS,PRICES);
  const yn=b=>b?'Ja':'–';
  $('#parsed').innerHTML=`<dl class="dl" style="grid-template-columns:150px 1fr"><dt>Kunde</dt><dd>${esc(q.anrede+' '+fullName(q))}</dd><dt>Adresse</dt><dd>${esc((q.adresse?q.adresse+', ':'')+q.plz+' '+q.ort)} ${q.kanton?`<span class="badge ${c.grp?'b-ok':'b-warn'}">${q.kanton}${c.grp?'':' · nicht in Preistabelle'}</span>`:'<span class="badge b-err">Kanton unbekannt</span>'}</dd><dt>Objekt</dt><dd>${esc(objLbl(q))} · Verschmutzung ${esc(q.soil)}</dd><dt>Zusätze</dt><dd><div class="chips-inline">${[q.wm&&'Waschmaschine / Tumbler',q.keller&&'Keller',q.estrich&&'Estrich',q.balkon&&'Balkon '+q.balkon,q.terrasse&&'Terrasse '+q.terrasse,q.sitzplatz&&'Sitzplatz '+q.sitzplatz,q.garageMode&&'Garage '+q.garageMode,q.verglasung&&'Verglasung '+q.verglasung,(q.duebelCat||q.duebel)&&'Dübellöcher '+(q.duebelCat||q.duebel),q.teppich&&'Teppich '+q.teppich+' Zi',q.besichtigung&&'Besichtigung vor Ort'].filter(Boolean).map(x=>`<span>${esc(x)}</span>`).join('')||'<span>keine</span>'}</div></dd><dt>Termin</dt><dd>${esc(q.von?q.von+' – '+q.bis:'nach Vereinbarung')}</dd><dt>Bilder</dt><dd>${yn(q.bilder)}</dd><dt>Kontakt</dt><dd>${esc(q.mail)} · ${esc(q.tel)}</dd></dl>`;
  const kantonTxt=q.plz?(q.kanton?`<span class="badge ${c.grp?'b-ok':'b-warn'}">${q.kanton}</span>`:'<span class="badge b-err">Kanton unbekannt</span>'):'';
  $('#sumCard').innerHTML=`<div class="card-h"><h2>Offerte live</h2><span class="badge ${F.length?'b-warn':'b-ok'}">${F.length?'Freigabe nötig':'Sendet automatisch'}</span></div><div style="padding:0 18px 18px">${mode==='manual'?`<div class="muted" style="font-size:13.5px;margin-bottom:8px">${esc(fullName(q)||'Kunde')}${q.plz?' · '+esc(q.plz+' '+q.ort)+' ':''}${kantonTxt}</div>`:''}${calcTable(c)}${flagHtml(F,SETTINGS.mode==='auto')}</div>`;
  mountLotties($('#sumCard'));
}
$('#mailTxt').oninput=liveParse;
$('#testForm').addEventListener('input',e=>{if(e.target.name&&e.target.name.startsWith('m_'))liveParse();});
$('#testForm').addEventListener('change',e=>{if(e.target.name&&e.target.name.startsWith('m_'))liveParse();});
$$('[data-mode]').forEach(b=>b.onclick=()=>{mode=b.dataset.mode;$$('[data-mode]').forEach(x=>x.setAttribute('aria-pressed',x===b));$('#modeMail').hidden=mode!=='mail';$('#modeManual').hidden=mode!=='manual';liveParse();});
$$('[data-sample]').forEach(b=>b.onclick=()=>{$('#mailTxt').value=SAMPLE_MAILS[+b.dataset.sample];liveParse();});
$('#btnPreviewDoc').onclick=()=>{if(!testQ)return;showFrameHtml('/api/preview?kind=doc&draft=1&mail='+encodeURIComponent(testSrc),'Vorschau Offerte (noch nicht erstellt)');};
function validateManual(){const f=$('#testForm');let ok=true,first=null;['m_vorname','m_name','m_plz','m_ort','m_tel','m_mail','m_m2'].forEach(n=>{const el=f.elements[n];const bad=!el.value.trim();el.closest('.field').classList.toggle('err',bad);if(bad){ok=false;first=first||el;}});if(first)first.focus();return ok;}
$('#testForm').onsubmit=async e=>{e.preventDefault();if(mode==='manual'&&!validateManual()){toast('Bitte Pflichtfelder ausfüllen','warning');return;}const btn=e.target.querySelector('.btn-p');btn.classList.add('busy');mountLotties(btn);
  try{const r=await api('/api/anfragen',{mailText:testSrc,channel:mode});const o=hydrate(r.offer);DB.unshift(o);$('#nextNr').textContent=o.nr+1;toast(o.status==='sent'?`Offerte ${o.nr} an ${o.q.mail} gesendet`:`Offerte ${o.nr} wartet auf Freigabe`,o.status==='sent'?'sent':'warning');if(mode==='manual')$('#testForm').reset();go('offerten');setTimeout(()=>openOffer(o.id),350);}
  catch(err){toast('Fehler: '+err.message,'error');}finally{btn.classList.remove('busy');}};
/* ---------- Preise ---------- */
function renderPrices(){
  const row=(k,l,unit,obj,fmt,note)=>`<tr><td>${l}${note?`<br><small class="muted">${note}</small>`:''}</td><td style="text-align:right"><input type="number" step="0.5" data-k="${k}" data-obj="${obj}" value="${fmt(PRICES_PATH(obj)[k])}"> <span class="muted" style="font-size:12.5px">${unit}</span></td></tr>`;
  const chf=(k,l,note,obj='p')=>row(k,l,'CHF',obj,v=>v,note), pct=(k,l,obj,note)=>row(k,l,'%',obj,v=>Math.round(v*100),note);
  $('#pgBase tbody').innerHTML=chf('base','Grundpauschale')+chf('m2','Preis pro m²')+Object.keys(PRICES.typ).map(k=>pct(k,'Zuschlag '+k,'t',/haus/i.test(k)?'Kalkulator: EFH-Zuschlag':'Formulartyp – im Kalkulator nicht separat bepreist')).join('');
  $('#pgExtra tbody').innerHTML=[['wm','Waschmaschine + Tumbler reinigen'],['balkonBesen',"Balkon 'besenrein'"],['balkonHD','Balkon hochdruckreinigen'],['terrasseBesen',"Terrasse 'besenrein'"],['terrasseHD','Terrasse hochdruckreinigen'],['sitzplatzBesen',"Sitzplatz 'besenrein'"],['sitzplatzHD','Sitzplatz hochdruckreinigen'],['keller',"Keller 'besenrein'"],['estrich',"Estrich 'besenrein'"],['garage',"Garagenparkplatz 'besenrein'"],['garageHD','Garagenparkplatz hochdruckreinigen','Im Formular wählbar, nicht im Kalkulator – bitte bestätigen'],['teppichZimmer','Teppich sprühextrahieren pro Zimmer','Formular: 1–4 Zimmer. 0 = Offerte hält zur Freigabe an']].map(x=>chf(x[0],x[1],x[2])).join('')
    +Object.keys(PRICES.verglasung).map(k=>chf(k,'Verglasung '+k+' 2-seitig',k==='Balkon'?'60.– aus alter Vorlage':'Im Formular wählbar, nicht im Kalkulator. 0 = Freigabe','v')).join('')
    +Object.keys(PRICES.duebel).map(k=>chf(k,'Dübellöcher '+k,'Kalkulator: ab 11 Stück CHF 30.–','d')).join('')+chf('fugen','Fugen grundreinigen pro Raum','Nur im Kalkulator, im Formular nicht wählbar');
  $('#pgSur tbody').innerHTML=pct('wenig','Verschmutzung wenig','s')+pct('mittel','Verschmutzung mittel','s')+pct('stark','Verschmutzung stark','s');
  $('#pgCanton tbody').innerHTML=Object.keys(PRICES.canton).map(k=>chf(k,k,null,'c')).join('')+`<tr><td class="muted">Alle anderen Kantone</td><td style="text-align:right"><span class="badge b-warn">Sonderfall · Freigabe</span></td></tr>`;
}
function PRICES_PATH(o){return {p:PRICES,s:PRICES.soil,c:PRICES.canton,t:PRICES.typ,v:PRICES.verglasung,d:PRICES.duebel}[o];}
async function savePrices(){$$('.price-grid input').forEach(i=>{const v=parseFloat(i.value)||0;const o=i.dataset.obj;const tgt=PRICES_PATH(o);tgt[i.dataset.k]=(o==='s'||o==='t')?v/100:v;});try{await api('/api/prices',PRICES,'PUT');toast('Preise gespeichert – gilt für alle neuen Offerten');}catch(e){toast('Speichern fehlgeschlagen: '+e.message,'error');}}
$('#btnSavePrices').onclick=savePrices;


/* ---------- Einstellungen ---------- */
function fillSettings(){const f=$('#setForm');f.mode.value=SETTINGS.mode;['canton','photos','carpet','m2','house','big'].forEach(k=>f['r_'+k].checked=!!SETTINGS.rules[k]);$('#sName').value=SETTINGS.name;$('#sFn').value=SETTINGS.fn;$('#sMail').value=SETTINGS.mail;$('#sCc').value=SETTINGS.cc;$('#sValid').value=SETTINGS.valid;$('#nextNr').value=nextNr;$('#whUrl').textContent=BASE?`${BASE}/api/webhook?key=…`:'(wird nach dem Deploy angezeigt)';}
async function saveSettings(e){if(e)e.preventDefault();const f=$('#setForm');SETTINGS.mode=f.mode.value;['canton','photos','carpet','m2','house','big'].forEach(k=>SETTINGS.rules[k]=f['r_'+k].checked);SETTINGS.name=$('#sName').value;SETTINGS.fn=$('#sFn').value;SETTINGS.mail=$('#sMail').value;SETTINGS.cc=$('#sCc').value;SETTINGS.valid=+$('#sValid').value||30;const nn=parseInt($('#nextNr').value,10);
  try{await api('/api/settings',{...SETTINGS,nextNr:nn>0?nn:undefined},'PUT');if(nn>0)nextNr=nn;toast('Einstellungen gespeichert');}catch(err){toast('Speichern fehlgeschlagen: '+err.message,'error');}}
$('#setForm').onsubmit=saveSettings;$('#btnSaveSettings').onclick=saveSettings;

/* ---------- Vorschau-Rahmen ---------- */
function showFrameHtml(src,title){$('#docTitle').textContent=title;$('#frame').src=src;$('#docModal').classList.add('open');$('#docClose').focus();}
function closeDoc(){$('#docModal').classList.remove('open');$('#frame').src='about:blank';}
$('#docClose').onclick=closeDoc;
window.addEventListener('message',e=>{if(e.data&&e.data.type==='auftrag-erteilt'){toast('Vorschau: so läuft es beim Kunden – es wurde nichts gesendet','info');}});

/* ---------- Auswertung ---------- */
function renderAuswertung(){
  const won=o=>['accepted','confirmed'].includes(o.status);
  const months=[];for(let i=5;i>=0;i--){const d=new Date(TODAY.getFullYear(),TODAY.getMonth()-i,1);months.push(d);}
  const rows=months.map(d=>{const L=DB.filter(o=>o.received.getMonth()===d.getMonth()&&o.received.getFullYear()===d.getFullYear());const auto=L.filter(o=>o.channel==='Webformular').length;return [MON[d.getMonth()].slice(0,4).replace(/\.?$/,'')+'. '+String(d.getFullYear()).slice(2),L.length,L.reduce((s,o)=>s+o.c.netto,0),L.filter(won).length,L.filter(won).reduce((s,o)=>s+o.c.netto,0),auto]});
  const N=DB.length,A=DB.filter(won).length,offSum=DB.reduce((s,o)=>s+o.c.netto,0),wonSum=DB.filter(won).reduce((s,o)=>s+o.c.netto,0);
  $('#awKpis').innerHTML=[['Umsatz erteilt',chf(wonSum),`${A} Aufträge`,'up'],['Offeriert gesamt',chf(offSum),`${N} Offerten`,'up'],['Auftragsquote',N?Math.round(A/N*100)+' %':'–','erteilt / offeriert','up'],['Ø Auftragswert',A?chf(wonSum/A):'–','exkl. MwSt','up']].map(k=>`<div class="card kpi"><div class="l">${k[0]}</div><div class="v num" style="font-size:24px">${k[1]}</div><div class="d ${k[3]}">${k[2]}</div></div>`).join('');
  const W=520,H=190,p={l:46,r:10,t:12,b:28};const max=Math.max(1000,...rows.map(r=>r[2]))*1.1;const bw=(W-p.l-p.r)/rows.length;const y=v=>H-p.b-(v/max)*(H-p.t-p.b);
  $('#awChart').innerHTML=[0,.25,.5,.75,1].map(f=>`<line x1="${p.l}" x2="${W-p.r}" y1="${y(max*f)}" y2="${y(max*f)}" stroke="#dcebee"/><text x="${p.l-6}" y="${y(max*f)+4}" font-size="9" fill="#767676" text-anchor="end">${Math.round(max*f/1000)}k</text>`).join('')+rows.map((r,i)=>{const x=p.l+i*bw;return `<rect x="${x+bw*.15}" y="${y(r[2])}" width="${bw*.32}" height="${H-p.b-y(r[2])}" rx="3" fill="#9ad3d3"/><rect x="${x+bw*.52}" y="${y(r[4])}" width="${bw*.32}" height="${H-p.b-y(r[4])}" rx="3" fill="#1b8384"/><text x="${x+bw/2}" y="${H-10}" font-size="10" fill="#767676" text-anchor="middle">${r[0]}</text>`}).join('');
  $('#awLegend').innerHTML='<span style="border-color:#9ad3d3;background:#9ad3d3">offeriert</span><span style="border-color:#1b8384;background:#1b8384;color:#fff">erteilt</span>';
  const bySrc={};DB.forEach(o=>{const k=(o.q.quelle||'Unbekannt').replace(/\s*\(.*\)/,'');bySrc[k]=bySrc[k]||{n:0,a:0,u:0};bySrc[k].n++;if(won(o)){bySrc[k].a++;bySrc[k].u+=o.c.netto;}});
  $('#awSrc tbody').innerHTML=Object.entries(bySrc).sort((a,b)=>b[1].n-a[1].n).map(([k,v])=>`<tr style="cursor:default"><td>${esc(k)}</td><td class="num" style="text-align:right">${v.n}</td><td class="num" style="text-align:right">${v.a}</td><td class="num" style="text-align:right">${chf(v.u)}</td></tr>`).join('')||'<tr><td colspan="4" class="muted">Noch keine Daten</td></tr>';
  const byKt={};DB.forEach(o=>{const k=o.q.kanton||'?';byKt[k]=byKt[k]||{n:0,s:0};byKt[k].n++;byKt[k].s+=o.c.netto;});
  $('#awKt tbody').innerHTML=Object.entries(byKt).sort((a,b)=>b[1].n-a[1].n).map(([k,v])=>`<tr style="cursor:default"><td>${k}</td><td class="num" style="text-align:right">${v.n}</td><td class="num" style="text-align:right">${chf(v.s/v.n)}</td></tr>`).join('')||'<tr><td colspan="3" class="muted">Noch keine Daten</td></tr>';
  const minPer=Math.max(1,parseFloat($('#tsMin').value)||8);const fmtH=m=>m>=60?`${(m/60).toFixed(1).replace('.0','').replace('.',',')} Std.`:`${Math.round(m)} Min.`;
  const autoAll=DB.filter(o=>o.channel==='Webformular').length,autoMon=rows[rows.length-1][5];
  $('#tsAll').textContent=fmtH(autoAll*minPer);$('#tsMon').textContent=fmtH(autoMon*minPer);$('#tsDays').textContent=(autoAll*minPer/60/8.4).toFixed(1).replace('.',',')+' Arbeitstage';
  $('#awMon tbody').innerHTML=rows.slice().reverse().map(r=>`<tr style="cursor:default"><td class="name">${r[0]}</td><td class="num" style="text-align:right">${r[1]}</td><td class="num" style="text-align:right">${chf(r[2])}</td><td class="num" style="text-align:right">${r[3]}</td><td class="num" style="text-align:right">${chf(r[4])}</td><td class="num" style="text-align:right">${r[1]?Math.round(r[3]/r[1]*100):0} %</td><td class="num" style="text-align:right">${r[5]?'< 1 Min':'–'}</td><td class="num" style="text-align:right">${fmtH(r[5]*minPer)}</td></tr>`).join('');
}
$('#btnExport').onclick=()=>{location.href='/api/export';};
$('#tsMin').oninput=renderAuswertung;

/* ---------- Start ---------- */
async function load(){try{const d=await api('/api/data');DB=d.offers.map(hydrate);Object.assign(SETTINGS,d.settings);Object.assign(PRICES,d.prices);nextNr=d.nextNr;BASE=d.base;fillSettings();renderAll();mountLotties();}catch(e){toast('Daten konnten nicht geladen werden: '+e.message,'error');}}
load();setInterval(async()=>{try{const d=await api('/api/data');const before=DB.length;DB=d.offers.map(hydrate);if(DB.length!==before){toast('Neue Anfrage eingegangen','mail');}renderAll();}catch(_){}} ,60000);
})();
