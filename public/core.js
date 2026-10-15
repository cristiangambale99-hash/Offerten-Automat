/* core.js – Offerten-Automat: Parser, Preislogik, Sonderfälle. Läuft im Browser und auf dem Server. */
(function(root,factory){ if(typeof module==='object'&&module.exports){module.exports=factory();} else {root.CORE=factory();} })(typeof window!=='undefined'?window:globalThis,function(){
const chf=n=>'CHF '+(Math.round(n*100)/100).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g,"'");
const num=n=>(Math.round(n*100)/100).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g,"'");
const r5=n=>Math.round(n*20)/20;
/* ---------- Preise (aus Kalkulation_Umzugsreinigung.xlsx) ---------- */
const PRICES={
  base:290, m2:6,
  wm:30, balkonBesen:10, keller:10, estrich:10, garage:10, balkonHD:59, terrasseHD:120, sitzplatzHD:90,
  terrasseBesen:10, sitzplatzBesen:10, garageHD:90,
  teppichZimmer:0,
  verglasung:{Balkon:60,Terrasse:60,Eingang:60,Wintergarten:0},
  typ:{Wohnung:0,Studio:0,Attikawohnung:0,Dachwohnung:0,Maisonettewohnung:0,Einfamilienhaus:0.30,Reiheneinfamilienhaus:0.30},
  duebel1:20, duebel11:30, duebel:{'> 10':30,'> 20':30,'> 30':30,'> 40':30}, fugen:120,
  soil:{wenig:-0.10, mittel:0, stark:0.50},
  canton:{'ZH / SH':0,'TG / SG / AG / ZG':90,'LU / BE / BL / BS':120},
  mwst:0.081
};
const CANTON_GROUP={ZH:'ZH / SH',SH:'ZH / SH',TG:'TG / SG / AG / ZG',SG:'TG / SG / AG / ZG',AG:'TG / SG / AG / ZG',ZG:'TG / SG / AG / ZG',LU:'LU / BE / BL / BS',BE:'LU / BE / BL / BS',BL:'LU / BE / BL / BS',BS:'LU / BE / BL / BS'};
const DEFAULT_SETTINGS={mode:'auto',rules:{canton:true,photos:true,carpet:true,m2:true,house:false,big:true},name:'Lionel Melone',fn:'Spezialreinigung',mail:'spezialreinigung@clean-service.ch',cc:'info@clean-service.ch',valid:30};

/* ---------- PLZ → Kanton (Bereiche) ---------- */
function plzKanton(plz){
  const p=parseInt(plz,10); if(!p) return null;
  const R=[[1000,1399,'VD'],[1400,1699,'VD'],[1700,1799,'FR'],[1800,1899,'VD'],[1900,1999,'VS'],[2000,2399,'NE'],[2400,2499,'NE'],[2500,2599,'BE'],[2600,2699,'BE'],[2700,2799,'BE'],[2800,2899,'JU'],[2900,2999,'JU'],
    [3000,3999,'BE'],[4000,4099,'BS'],[4100,4499,'BL'],[4500,4699,'SO'],[4700,4799,'BE'],[4800,4999,'AG'],[5000,5999,'AG'],[6000,6099,'LU'],[6100,6199,'LU'],[6200,6299,'LU'],[6300,6399,'ZG'],[6400,6499,'SZ'],[6500,6999,'TI'],
    [7000,7999,'GR'],[8000,8199,'ZH'],[8200,8299,'SH'],[8300,8399,'ZH'],[8400,8499,'ZH'],[8500,8599,'TG'],[8600,8699,'ZH'],[8700,8799,'ZH'],[8800,8899,'ZH'],[8900,8999,'ZH'],[9000,9499,'SG'],[9500,9599,'TG'],[9600,9699,'SG']];
  const h=R.find(x=>p>=x[0]&&p<=x[1]); return h?h[2]:null;
}

/* ---------- Parser für die Formular-Mail ---------- */
const deDate=v=>{const m=/^(\d{4})-(\d{2})-(\d{2})/.exec(String(v||'').trim());return m?`${m[3]}.${m[2]}.${m[1]}`:v;};
function parseMail(txt){
  const t=txt.replace(/\r/g,'');
  const get=k=>{const m=t.match(new RegExp('^[ \\t]*'+k+'[ \\t]*:[ \\t]*(.*)$','mi'));return m?m[1].trim():''};
  const yes=v=>!!v&&!/^(nein|no|-)?$/i.test(v);
  const zusatz=((t.split(/Zusatz:[ \t]*/i)[1]||'').split(/\n[ \t]*Balkon[ \t]*:/i)[0]||'');
  const spezial=(t.split(/Spezielle Dienstleistungen:\s*/i)[1]||'').split(/\n\s*\n/)[0];
  const nachricht=(t.split(/Nachricht:\s*/i)[1]||'').split(/\n\s*Wie sind Sie/i)[0].trim();
  const q={
    anrede:get('Anrede'),vorname:get('Vorname'),name:get('Name'),adresse:get('Adresse'),plz:get('PLZ'),ort:get('Ort'),tel:get('Telefon'),mail:get('E-Mail'),
    zimmer:get('Anzahl Zimmer'),m2:parseFloat((get('Quadratmeter')||'').replace(',','.'))||0,
    typ:(()=>{const v=get('Typ');const k=Object.keys(PRICES.typ).find(t=>v.toLowerCase().replace(/\s/g,'')===t.toLowerCase());if(k)return k;return /reihen/i.test(v)?'Reiheneinfamilienhaus':/haus|efh/i.test(v)?'Einfamilienhaus':/studio/i.test(v)?'Studio':/attika/i.test(v)?'Attikawohnung':/dach/i.test(v)?'Dachwohnung':/maison/i.test(v)?'Maisonettewohnung':'Wohnung'})(),
    soil:(get('Verschmutzungsgrad')||'mittel').toLowerCase().replace(/[^a-z]/g,'')||'mittel',
    keller:/keller/i.test(zusatz),wm:/waschmaschine|tumbler/i.test(zusatz),estrich:/estrich/i.test(zusatz),garage:/garage/i.test(zusatz)||/besenrein/i.test(get('Garage')),
    balkon:(get('Balkon')||'').toLowerCase(),terrasse:(get('Terrasse')||'').toLowerCase(),sitzplatz:(get('Sitzplatz')||'').toLowerCase(),garageMode:(get('Garage')||'').toLowerCase(),
    teppichRaw:((spezial.match(/Teppich[^:\n]*:[ \t]*(.*)/i)||['',''])[1]).trim(),
    verglasung:((spezial.match(/Verglasung[ \t]*:[ \t]*(.*)/i)||['',''])[1]).trim(),
    duebelRaw:((spezial.match(/Dübellöcher[ \t]*:[ \t]*(.*)/i)||['',''])[1]).trim(),
    besichtigung:/Besichtigung vor Ort/i.test(t)&&!/Offerte anfragen/i.test(t.split(/Anrede/i)[0]||'')&&/Besichtigung/i.test((t.match(/Offertanfrage für:\s*\n?\s*(.*)/i)||['',''])[1]),
    von:deDate(get('Von')),bis:deDate(get('Bis')),
    bilder:/Bilder:\s*\n?\s*https?:\/\//i.test(t),
    nachricht, quelle:get('Wie sind Sie auf uns aufmerksam geworden\\?')||(t.match(/aufmerksam geworden\?\s*\n\s*(.*)/i)||['',''])[1].trim()
  };
  if(!['wenig','mittel','stark'].includes(q.soil)) q.soil='mittel';
  q.teppich=parseInt((q.teppichRaw.match(/\d+/)||['0'])[0],10)||(q.teppichRaw&&!/^(nein|no|-)$/i.test(q.teppichRaw)?1:0);
  const dn=parseInt((q.duebelRaw.match(/\d+/)||['0'])[0],10)||0;
  q.duebelCat=dn?(/>/.test(q.duebelRaw)?'> '+dn:null):null; q.duebel=dn?(q.duebelCat?dn+1:dn):0;
  if(q.garageMode==='besenrein'||q.garageMode==='hochdruck') q.garage=true;
  q.kanton=plzKanton(q.plz);
  return q;
}

/* ---------- Preisberechnung (1:1 Kalkulator) ---------- */
function calc(q,P=PRICES){
  const L=[]; const add=(label,amount,grp)=>L.push({label,amount,grp});
  const grund=P.base+q.m2*P.m2;
  add('Grundpauschale',P.base,'grund'); add(`Wohnfläche ${q.m2} m² × ${num(P.m2)}`,q.m2*P.m2,'grund');
  const tz=P.typ[q.typ]||0; const efh=grund*tz; if(efh) add(`Zuschlag ${q.typ} ${Math.round(tz*100)} %`,efh,'zusatz');
  if(q.wm) add('Waschmaschine + Tumbler reinigen',P.wm,'zusatz');
  if(q.balkon==='besenrein') add("Balkon 'besenrein' reinigen",P.balkonBesen,'zusatz');
  if(q.balkon==='hochdruck') add('Balkon hochdruckreinigen',P.balkonHD,'zusatz');
  if(q.terrasse==='besenrein') add("Terrasse 'besenrein' reinigen",P.terrasseBesen,'zusatz');
  if(q.terrasse==='hochdruck') add('Terrasse hochdruckreinigen',P.terrasseHD,'zusatz');
  if(q.sitzplatz==='besenrein') add("Sitzplatz 'besenrein' reinigen",P.sitzplatzBesen,'zusatz');
  if(q.sitzplatz==='hochdruck') add('Sitzplatz hochdruckreinigen',P.sitzplatzHD,'zusatz');
  if(q.keller) add("Keller 'besenrein' reinigen",P.keller,'zusatz');
  if(q.estrich) add("Estrich 'besenrein' reinigen",P.estrich,'zusatz');
  if(q.garage&&q.garageMode!=='hochdruck') add("Garagenparkplatz 'besenrein' reinigen",P.garage,'zusatz');
  if(q.garageMode==='hochdruck') add('Garagenparkplatz hochdruckreinigen',P.garageHD,'zusatz');
  if(q.verglasung){const k=Object.keys(P.verglasung).find(v=>q.verglasung.toLowerCase().includes(v.toLowerCase()))||'Balkon';add(`Verglasung ${k} 2-seitig reinigen`,P.verglasung[k]||0,'zusatz');}
  if(q.teppich>0) add(`Teppich sprühextrahieren (${q.teppich} Zimmer)`,q.teppich*(P.teppichZimmer||0),'zusatz');
  if(q.duebelCat) add(`Dübellöcher schliessen (${q.duebelCat})`,P.duebel[q.duebelCat]??P.duebel11,'zusatz');
  else if(q.duebel>0) add(`Dübellöcher schliessen (${q.duebel} Stk.)`,q.duebel<=10?P.duebel1:P.duebel11,'zusatz');
  if(q.fugen>0) add(`Fugen grundreinigen (${q.fugen} Räume)`,q.fugen*P.fugen,'zusatz');
  const grp=q.kanton?CANTON_GROUP[q.kanton]:null;
  const kz=grp?P.canton[grp]:0; if(kz) add(`Kantonszuschlag ${grp}`,kz,'zuschlag');
  const zwischen=L.reduce((s,x)=>s+x.amount,0);
  const pct=P.soil[q.soil]??0; const soilAmt=zwischen*pct;
  if(pct) add(`Verschmutzung ${q.soil} (${pct>0?'+':''}${Math.round(pct*100)} %)`,soilAmt,'zuschlag');
  const netto=zwischen+soilAmt, mwst=netto*P.mwst, brutto=r5(netto+mwst);
  const grundTotal=grund+efh+kz+soilAmt;
  return {lines:L,grund,efh,kz,zwischen,pct,soilAmt,netto,mwst,brutto,grundTotal,grp};
}

/* ---------- Sonderfall-Regeln ---------- */
function flags(q,c,SETTINGS=DEFAULT_SETTINGS){
  const F=[]; const R=SETTINGS.rules;
  if(R.canton&&!c.grp) F.push({t:'Kanton ausserhalb der Preistabelle',d:q.kanton?`PLZ ${q.plz} liegt im Kanton ${q.kanton} – kein Kantonszuschlag hinterlegt. Preis und Anfahrt prüfen.`:`PLZ ${q.plz||'fehlt'} konnte keinem Kanton zugeordnet werden.`});
  if(R.photos&&q.bilder) F.push({t:'Bilder oder Grundriss angehängt',d:'Kunde hat Dateien mitgeschickt – kurz anschauen, ob der Preis passt.'});
  if(q.besichtigung) F.push({t:'Besichtigung vor Ort gebucht',d:'Kunde will eine Besichtigung (CHF 50.–, bei Auftrag abgezogen) – Termin vereinbaren, keine Auto-Offerte.'});
  if(R.carpet&&q.teppich&&!(PRICES.teppichZimmer>0)) F.push({t:'Teppich sprühextrahieren gewünscht',d:`${q.teppich} Zimmer – unter Preise ist noch kein Preis pro Zimmer hinterlegt.`});
  const vk=q.verglasung?Object.keys(PRICES.verglasung).find(v=>q.verglasung.toLowerCase().includes(v.toLowerCase())):null;
  if(vk&&!(PRICES.verglasung[vk]>0)) F.push({t:`Verglasung ${vk} ohne Preis`,d:'Unter Preise ist für diese Verglasung noch kein Preis hinterlegt.'});
  if(R.m2&&(!q.m2||q.m2>250)) F.push({t:q.m2?'Sehr grosses Objekt':'Quadratmeter fehlen',d:q.m2?`${q.m2} m² – Preis plausibilisieren.`:'Ohne m² kann der Grundpreis nicht berechnet werden.'});
  if(R.house&&/haus/i.test(q.typ)) F.push({t:'Haus / EFH',d:'Gemäss Einstellung werden Häuser immer freigegeben.'});
  if(R.big&&c.netto>2500) F.push({t:'Total über CHF 2\'500',d:`Offerte über ${chf(c.netto)} exkl. MwSt – Vier-Augen-Prinzip.`});
  return F;
}


const esc=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
return {PRICES,CANTON_GROUP,DEFAULT_SETTINGS,plzKanton,parseMail,calc,flags,chf,num,r5,esc};
});
