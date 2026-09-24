/** Read-only production analytics. PHP authorizes each request. No secrets are stored. */
(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const sectionNames = {'hero':'Start','homes':'Domy i działki','why-home':'Dom na co dzień','location':'Lokalizacja','layout':'Układ domu','gallery':'Galeria','standard':'Standard','security':'Bezpieczny zakup','schedule':'Proces zakupu','journal':'Dziennik budowy','team':'Zespół','faq':'FAQ','contact':'Kontakt','tour-exterior':'Spacer zewnętrzny','tour-interior':'Spacer wnętrza'};
  const labels = {house_select:'Wybór domu',house_card_open:'Karta domu',house_contact_click:'Zapytanie o dom',house_pdf_download:'Pobranie karty PDF',gallery_open:'Otwarcie galerii',tour_start:'Wejście do spaceru',contact_start:'Rozpoczęcie formularza',contact_submit:'Wysłanie formularza',phone_click:'Kliknięcie telefonu',email_click:'Kliknięcie e-maila',directions_click:'Sprawdzenie dojazdu',page_view:'Wejście na stronę',visit_start:'Nowa wizyta'};
  const label = id => sectionNames[id] || id || 'Nieznana sekcja';
  const node = (tag, value, className) => { const el = document.createElement(tag); if (value != null) el.textContent = String(value); if (className) el.className = className; return el; };
  const seconds = ms => Math.round(Math.max(0,Number(ms)||0)/1000);
  const clock = ms => { const total=seconds(ms); return total>=3600 ? `${Math.floor(total/3600)} godz. ${Math.floor(total%3600/60)} min` : total>=60 ? `${Math.floor(total/60)} min ${total%60} s` : `${total} s`; };
  const date = value => { const time = new Date(value); return Number.isNaN(+time) ? '—' : new Intl.DateTimeFormat('pl-PL',{dateStyle:'medium',timeStyle:'short'}).format(time); };
  const time = value => { const t=new Date(value);return Number.isNaN(+t)?'—':new Intl.DateTimeFormat('pl-PL',{hour:'2-digit',minute:'2-digit',second:'2-digit'}).format(t); };
  const note = (id, text, error=false) => { $(id).textContent=text;$(id).className=error?'msg error':'msg'; };
  let epoch=0, pending=false, controller, selectedVisitor=null, journeyRequest=0, demoMode=false;
  try { sessionStorage.removeItem('dnp-admin-control-key-v1'); } catch {}
  function empty(target, message) { target.replaceChildren(node('p', message, 'empty-state')); }
  function reset() {
    epoch++; journeyRequest++; controller?.abort();selectedVisitor=null;demoMode=false;
    $('dashboard').hidden=true;$('loginForm').classList.remove('authenticated');$('analyticsRaw').hidden=true;
    $('journeyDialog').close();$('journeyBody').replaceChildren();$('summary').replaceChildren();
    note('analyticsMsg',''); note('loginMsg','');
  }
  function clear() { reset();$('login').value='';$('key').value=''; }
  $('clearKey').addEventListener('click',clear);
  window.addEventListener('pagehide',clear);
  for(const id of ['login','key']) $(id).addEventListener('input',reset);
  $('closeJourney').addEventListener('click',()=> $('journeyDialog').close());
  $('journeyDialog').addEventListener('click',event=>{if(event.target===$('journeyDialog'))$('journeyDialog').close();});

  async function post(path,payload,signal) {
    const response=await fetch(path,{method:'POST',cache:'no-store',signal,headers:{'Content-Type':'application/json','X-DNP-Admin-Login':$('login').value.trim(),'X-DNP-Admin-Password':$('key').value},body:JSON.stringify(payload)});
    const data=await response.json().catch(()=>{throw new Error('Serwer nie zwrócił JSON. Sprawdź obsługę PHP.');});
    if(!response.ok||data.ok===false)throw new Error(response.status===401||response.status===403?'Nieprawidłowy login lub hasło albo brak konfiguracji dostępu.':data.message||`Błąd HTTP ${response.status}`);
    return data;
  }
  function stats(target, entries, missing) {
    target.replaceChildren(); const pairs=Object.entries(entries||{});
    if(!pairs.length){empty(target,missing);return;}
    for(const [name,value] of pairs){const row=node('div');row.append(node('span',name),node('strong',value));target.append(row);}
  }
  function render(data) {
    $('dashboard').hidden=false;$('loginForm').classList.add('authenticated');
    $('summary').replaceChildren();
    for(const [name,value] of [['Odwiedzający',data.uniqueVisitors??0],['Wizyty',data.uniqueVisits??0],['Powracający',data.returningVisitors??0],['Aktywny czas',clock(data.engagedDurationMs)]]){
      const card=node('div',null,'metric');card.append(node('small',name),node('strong',value));$('summary').append(card);
    }
    $('sections').replaceChildren();const sections=Array.isArray(data.sections)?data.sections.slice(0,9):[];
    if(!sections.length)empty($('sections'),'Brak zarejestrowanego czasu sekcji.');
    const max=Math.max(1,...sections.map(row=>Number(row.durationMs)||0));
    for(const section of sections){const row=node('div',null,'bar-row'),track=node('span'),bar=node('i');bar.style.width=`${Math.max(2,(Number(section.durationMs)||0)/max*100)}%`;
      track.append(bar);row.append(node('strong',label(section.id)),node('small',`${Number(section.views)||0} wejść · ${clock(section.durationMs)}`),track);$('sections').append(row);
    }
    stats($('sources'),data.sources,'Brak źródeł.');stats($('devices'),data.devices,'Brak danych o urządzeniach.');
    const houseRows=[];for(const [house,values] of Object.entries(data.houses||{}))if(/^[A-E]$/.test(house))houseRows.push([`Dom ${house}`,`${Number(values.select)||0} wyborów · ${Number(values.pdf)||0} PDF · ${Number(values.contact)||0} kontaktów`]);
    stats($('houses'),Object.fromEntries(houseRows),'Nie odnotowano wyborów domów.');
    const tourRows=Array.isArray(data.tours)?data.tours.map(v=>[v.mode==='interior'?'Wnętrze':'Zewnątrz',`${Number(v.views)||0} scen · ${clock(v.durationMs)}`]):[];
    stats($('tours'),Object.fromEntries(tourRows),'Nie odnotowano spacerów.');
    const visitors=Array.isArray(data.visitors)?data.visitors:[];
    $('visitorsCount').textContent=`${visitors.length} z ${Number(data.uniqueVisitors)||0}`;$('visitors').replaceChildren();
    if(!visitors.length)empty($('visitors'),'Brak wizyt w wybranym zakresie. Sprawdź zgodę na analitykę i poprawność wysyłki zdarzeń.');
    for(const visitor of visitors){const button=node('button',null,'visitor');button.type='button';button.append(node('strong',`Odwiedzający ${visitor.id||'—'}`),node('small',`Ostatnio ${date(visitor.lastSeen)} · ${visitor.device||'—'} · ${clock(visitor.durationMs).replaceAll(' ','\u00a0')}`),node('span',`${Number(visitor.visits)||0} wizyt`,'visit-num'));
      button.addEventListener('click',()=>{void openJourney(visitor);});$('visitors').append(button);
    }
    $('analyticsRaw').hidden=false;$('analyticsRaw').querySelector('pre').textContent=JSON.stringify(data,null,2);
    note('loginMsg','Zalogowano.');note('analyticsMsg',`Dane z serwera · ostatnie ${data.rangeDays||$('days').value} dni.`);
  }
  async function load() {
    if(pending||!$('loginForm').reportValidity())return;
    const current=epoch;controller=new AbortController();const timeout=setTimeout(()=>controller.abort(),25000);
    pending=true;$('signIn').disabled=true;$('analytics').disabled=true;
    note('loginMsg','Pobieranie danych…');
    try{const data=await post('/api/analytics-summary.php',{rangeDays:Number($('days').value)},controller.signal);if(current!==epoch)return;render(data);}
    catch(error){if(current!==epoch)return;note('loginMsg',error.name==='AbortError'?'Serwer nie odpowiedział na czas.':error.message,true);if($('dashboard').hidden)return;note('analyticsMsg','Nie udało się odświeżyć. Wcześniejsze wyniki są nadal wyświetlone.',true);}
    finally{clearTimeout(timeout);pending=false;$('signIn').disabled=false;$('analytics').disabled=false;}
  }
  $('loginForm').addEventListener('submit',event=>{event.preventDefault();void load();});
  $('analytics').addEventListener('click',()=>void load());
  $('days').addEventListener('change',()=>void load());

  function stepsFromEvents(events) {
    const steps=[];const interests=[];
    for(const event of events){const tour=event.type==='tour_scene_time';const section=event.type==='section_time';
      if(tour||section){const duration=Math.max(0,Number(event.durationMs)||0);if(duration<500)continue;
        const end=Date.parse(event.at);if(!Number.isFinite(end))continue;
        const id=tour?`tour-${event.tour==='interior'?'interior':'exterior'}`:(event.section||'unknown');
        steps.push({id,label:label(id),at:new Date(end-duration).toISOString(),durationMs:duration,kind:tour?'tour':'section',detail:tour?`Scena: ${event.scene||'bez oznaczenia'}`:(event.house&&event.house!=='unknown'?`Dom ${event.house}`:'')});
      }else if(labels[event.type]&&event.type!=='visit_start'&&event.type!=='page_view')interests.push({at:event.at,label:labels[event.type],detail:event.house&&event.house!=='unknown'?`Dom ${event.house}`:''});
    }
    steps.sort((a,b)=>a.at.localeCompare(b.at));interests.sort((a,b)=>a.at.localeCompare(b.at));
    return {steps,interests};
  }
  function renderJourney(data, isDemo=false) {
    demoMode=isDemo;const visit=data.visits.find(v=>v.id===data.selectedVisit)||data.visits[0];
    const {steps,interests}=isDemo?{steps:data.steps,interests:[]}:stepsFromEvents(data.events||[]);
    $('journeyKind').textContent=isDemo?'SYMULACJA · NIE JEST RUCHEM PRODUKCYJNYM':'POMIAR PRODUKCYJNY · IDENTYFIKATOR PSEUDONIMOWY';
    $('journeyTitle').textContent=isDemo?'Przykładowa ścieżka wizyty':`Odwiedzający ${selectedVisitor?.id||'—'}`;
    $('journeyIntro').textContent=isDemo?'Ta wizyta jest przykładem przygotowanym do sprawdzenia widoku. Nie trafia do wyników.':'Dane z wizyt tej przeglądarki po wyrażeniu zgody na analitykę.';
    const body=$('journeyBody');body.replaceChildren();
    if(!isDemo&&data.visits.length>1){const tabs=node('div',null,'visit-switch');for(const [index,item] of data.visits.entries()){
      const button=node('button',`Wizyta ${data.visits.length-index} · ${date(item.firstSeen)}`,'btn'+(item.id===data.selectedVisit?' is-selected':''));button.type='button';button.setAttribute('aria-pressed',String(item.id===data.selectedVisit));
      button.addEventListener('click',()=>void openJourney(selectedVisitor,item.id));tabs.append(button);
    }body.append(tabs);}
    const boxes=node('div',null,'journey-stats');for(const [caption,value] of [['Data',date(visit.firstSeen)],['Aktywny czas',clock(visit.durationMs)],['Źródło',visit.source||'direct'],['Urządzenie',visit.device||'—']]){const box=node('div');box.append(node('small',caption),node('strong',value));boxes.append(box);}body.append(boxes);
    const chart=node('section',null,'journey-card');chart.append(node('h3','Przebieg wizyty'),node('p','Oś pozioma: czas od wejścia. Każdy pasek to zarejestrowany aktywny czas w sekcji lub scenie spaceru. Kolejne paski w tym samym wierszu oznaczają powrót.'));
    if(!steps.length){chart.append(node('p','Brak zarejestrowanego czasu w sekcjach podczas tej wizyty.','empty-state'));body.append(chart);return;}
    const start=Math.min(Date.parse(visit.firstSeen),...steps.map(step=>Date.parse(step.at)));
    const end=Math.max(start+1000,...steps.map(step=>Date.parse(step.at)+step.durationMs));const span=end-start;
    const plot=node('div',null,'journey-plot');const axis=node('div',null,'plot-axis'),ticks=node('div');
    for(const ratio of [0,.25,.5,.75,1])ticks.append(node('span',clock(span*ratio)));axis.append(node('span','SEKCJA / SPACER'),ticks);plot.append(axis);
    const order=['hero','homes','why-home','location','layout','gallery','tour-exterior','tour-interior','standard','security','schedule','journal','team','faq','contact'];
    const ids=[...new Set(steps.map(step=>step.id))].sort((a,b)=>{const x=order.indexOf(a),y=order.indexOf(b);return (x<0?99:x)-(y<0?99:y)||a.localeCompare(b);});
    for(const id of ids){const row=node('div',null,'plot-row'),track=node('div',null,'track');for(const step of steps.filter(step=>step.id===id)){
      const bar=node('span',null,step.kind==='tour'?'tour':'');bar.style.left=`${Math.max(0,(Date.parse(step.at)-start)/span*100)}%`;
      bar.style.width=`${Math.max(.45,step.durationMs/span*100)}%`;bar.title=`${time(step.at)} · ${step.label} · ${clock(step.durationMs)}`;track.append(bar);
    }row.append(node('small',label(id)),track);plot.append(row);}
    const scroll=node('div',null,'journey-scroll');scroll.append(plot);chart.append(scroll);
    const legend=node('div',null,'journey-key');for(const [textValue,type] of [['Sekcja','section'],['Spacer 360°','tour']]){const item=node('span'),bullet=node('i',null,type==='tour'?'tour':'');item.append(bullet,document.createTextNode(textValue));legend.append(item);}chart.append(legend);body.append(chart);
    const detail=node('section',null,'journey-card');detail.append(node('h3','Przebieg krok po kroku'));
    const list=node('ol',null,'step-list');for(const step of steps){const entry=node('li',null,step.kind==='tour'?'tour':'');const description=node('div');description.append(node('strong',step.label));if(step.detail)description.append(node('small',step.detail));entry.append(node('time',time(step.at)),description,node('em',clock(step.durationMs)));list.append(entry);}detail.append(list);body.append(detail);
    if(interests.length){const actions=node('section',null,'journey-card');actions.append(node('h3','Działania odwiedzającego'));const events=node('ol',null,'step-list');for(const action of interests){const entry=node('li'),description=node('div');description.append(node('strong',action.label));if(action.detail)description.append(node('small',action.detail));entry.append(node('time',time(action.at)),description);events.append(entry);}actions.append(events);body.append(actions);}
    if(data.truncated)body.append(node('p','Pokazano pierwsze 400 zdarzeń wybranej wizyty.','muted'));
  }
  async function openJourney(visitor,visit) {
    const current=++journeyRequest;selectedVisitor=visitor;
    if(!$('journeyDialog').open)$('journeyDialog').showModal();
    $('journeyKind').textContent='POMIAR PRODUKCYJNY';$('journeyTitle').textContent=`Odwiedzający ${visitor.id||'—'}`;
    $('journeyIntro').textContent='Pobieranie historii…';$('journeyBody').replaceChildren();
    try{
      if(!visitor.lookup)throw new Error('Serwer zwrócił starą wersję danych. Wgraj również pliki api/analytics-summary.php i api/analytics-journey.php.');
      const data=await post('/api/analytics-journey.php',{visitor:visitor.lookup,visit,rangeDays:Number($('days').value)});
      if(current!==journeyRequest||!$('journeyDialog').open)return;
      renderJourney(data);
    }catch(error){if(current===journeyRequest)empty($('journeyBody'),error.message);}
  }
  $('demo').addEventListener('click',async()=>{
    ++journeyRequest;selectedVisitor=null;
    try{const response=await fetch('./demo-visit.json',{cache:'no-store'});if(!response.ok)throw new Error('Nie można odczytać przykładowej wizyty.');const fixture=await response.json();
      const start=Date.parse(fixture.startedAt);let cursor=start;
      const steps=fixture.steps.map(item=>{const at=new Date(cursor).toISOString();cursor+=item.durationMs;return {...item,id:item.section,at,detail:item.note};});
      const data={visits:[{id:'demo',firstSeen:fixture.startedAt,durationMs:cursor-start,source:fixture.source,device:fixture.device}],selectedVisit:'demo',steps};
      if(!$('journeyDialog').open)$('journeyDialog').showModal();renderJourney(data,true);
    }catch(error){note('analyticsMsg',error.message,true);}
  });
})();
