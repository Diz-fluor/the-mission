import { Suspense, lazy, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, type ComponentType } from 'react';
import { screens as capturedScreens } from '../design/registry';
import behaviorData from '../design/behavior.json';
import controlData from '../design/controls.json';
import manifest from '../../docs/figma-screens.json';
import { STORAGE_KEY, initialState, restoreState, transition, profileRoute, consentReady } from './state.mjs';
import { getTelegram, initializeTelegram, isTelegram } from './telegram';
import { appendMessage, isPersonNode, personFromCard, refreshPeople, showRequestRecords, syncConsentButton, syncAmount, syncComposer, syncHomeFilters, localPhoto, photoUrl, type Person } from './dom';

type DemoState = { relationship: Record<string, string>; recommendations: Record<string, string>; fields: Record<string, string>; consents: Record<string, boolean>; choices: Record<string, string>; person: Person | null; saved: string[]; savedPeople:Record<string,Person>; requests: { id: string; title: string; description: string; closed?:boolean }[]; selectedRequest:string|null; messages: { id: string; text: string }[]; query: string; filter: string; criteria:Record<string,string>; contribution: number; amount: number; payment:{id:string;amount:number;status:string}|null; deal:Record<string,string>|null };
type Action = { id: string; to: string; event?: string; delay?: number };
const registry = capturedScreens as Record<string, () => Promise<{ default: ComponentType }>>;
const HOME = '464:2016';
const ownProfiles = new Set(['563:4968', '457:5605', '457:5722']);
const foreignProfiles = new Set(['457:5863', '457:5992', '726:5802', '726:5915', '729:5891', '729:6028']);
const captions: Record<string, string> = { 'Главная': HOME, 'Запросы': '503:2497', 'Сделки': '504:2892', 'Сообщество': '678:14745', 'Профиль': '563:4968', 'Найти людей': HOME, 'Создать запрос': '503:2596', 'Новый запрос': '503:2596', 'Редактировать профиль': '500:2604', 'Как видят другие': '457:5863', 'Рекомендовать': '487:1972', 'Фильтры': '505:3550', 'Уведомления': '505:3645', 'Пригласить участника': '505:4047', 'Мои приглашения': '505:4121', 'Оставить рекомендацию': '487:1972', 'Почему подходит Мария': '489:2295', 'Повторить': '489:2186' };
const behaviors = new Map(behaviorData.map(s => [s.id, s.actions as Action[]]));
const controls = new Map(controlData.map(s => [s.id, s.controls]));
const find = (root: Element, id: string) => root.querySelector<HTMLElement>(`[data-node-id="${CSS.escape(id)}"]`);
const normalized = (s: string) => s.replace(/\s+/g, ' ').trim();
function currentRoute() { try { return decodeURIComponent(location.hash.replace(/^#\/?/, '')) || new URLSearchParams(location.search).get('screen') || HOME; } catch { return HOME; } }
function storedState(): DemoState { try { return restoreState(localStorage.getItem(STORAGE_KEY)) as DemoState; } catch { return initialState() as DemoState; } }

function fitToViewport(stage: HTMLElement, frame: boolean) {
  const root = stage.firstElementChild as HTMLElement | null;
  if (!root || frame) return;
  stage.style.width = '393px'; stage.style.height = '852px';
  const nodes = [root, ...root.querySelectorAll<HTMLElement>('*')];
  const measurements = nodes.map(n => ({ n, w: n.offsetWidth, pw: n.parentElement?.clientWidth || 393, pp: n.parentElement ? parseFloat(getComputedStyle(n.parentElement).paddingLeft) + parseFloat(getComputedStyle(n.parentElement).paddingRight) : 0, style: getComputedStyle(n), top: n.offsetTop, h: n.offsetHeight }));
  const chrome = [...root.children].filter(c => /Статус-бар|Telegram Mini App|Статус-бар и шапка/.test(c.getAttribute('data-name') || ''));
  const offset = Math.max(108, ...chrome.map(c => (c as HTMLElement).offsetTop + (c as HTMLElement).offsetHeight));
  const nav = [...root.children].some(c => /Таббар/.test(c.getAttribute('data-name') || ''));
  for (const { n, w, pw, pp } of measurements) {
    if (n === root || w < 100 || !pw) continue;
    if (Math.abs(w - (pw - pp)) < 2 || Math.abs(w - pw) < 2) { n.style.width = '100%'; n.style.minWidth = '0'; }
    else if (n.parentElement === root && w > 280) { const inset = Math.round((393 - w) / 2); n.style.width = `calc(100% - ${inset * 2}px)`; }
  }
  root.style.borderRadius = '0'; root.style.width = '100%'; root.style.height = '100%';
  for (const child of [...root.children] as HTMLElement[]) {
    const name = child.dataset.name || '';
    if (/Статус-бар|Telegram Mini App|Статус-бар и шапка/.test(name)) { child.style.display = 'none'; continue; }
    if (name === 'Rectangle' && child.offsetHeight <= 5) { child.style.display = 'none'; continue; }
    if (/Свет/.test(name)) { child.style.width = '100%'; child.style.top = '0'; continue; }
    const m = measurements.find(m => m.n === child)!;
    if (/Таббар/.test(name)) { child.style.top = 'auto'; child.style.bottom = 'calc(12px + env(safe-area-inset-bottom, 0px))'; child.style.width = 'calc(100% - 32px)'; for (const item of [...child.children] as HTMLElement[]) if (getComputedStyle(item).position !== 'absolute') { item.style.flex = '1 1 0'; item.style.width = '0'; item.style.minWidth = '0'; } continue; }
    if (m.style.position === 'absolute' && m.top >= offset - 4) {
      const top = Math.max(0, m.top - offset); child.style.top = `calc(${top}px + var(--safe-top))`;
      if (m.top > 650 && m.h <= 76) { child.style.top = 'auto'; child.style.bottom = 'calc(16px + env(safe-area-inset-bottom, 0px))'; }
      else if (/Лента|Scroll content/.test(name)) { child.style.height = `calc(100% - ${top + (nav ? 100 : 24)}px - var(--safe-top) - env(safe-area-inset-bottom, 0px))`; }
      else if (/Содержание/.test(name)) { child.style.maxHeight = `calc(100% - ${top + 112}px - var(--safe-top))`; child.style.overflowY = 'auto'; }
    }
  }
  for (const row of root.querySelectorAll<HTMLElement>('[data-name="Действия профиля"]')) for (const b of [...row.children].slice(0, 2) as HTMLElement[]) { b.style.flex = '1 1 0'; b.style.width = '0'; b.style.minWidth = '0'; }
  stage.style.width = '100%'; stage.style.height = '100%';
  for(const n of root.querySelectorAll<HTMLElement>('[data-name="Контент"]'))if(getComputedStyle(n).flexDirection==='column'){n.style.height='auto';n.style.overflow='visible';n.style.flexShrink='0';}
  for(const row of root.querySelectorAll<HTMLElement>('*')){
    const css=getComputedStyle(row);if(css.display!=='flex'||css.flexDirection!=='row')continue;
    const children=[...row.children].filter(n=>getComputedStyle(n).position!=='absolute'&&getComputedStyle(n).display!=='none') as HTMLElement[];
    const available=row.clientWidth-parseFloat(css.paddingLeft)-parseFloat(css.paddingRight);
    const required=children.reduce((n,c)=>n+c.offsetWidth,0)+Math.max(0,children.length-1)*(parseFloat(css.columnGap)||0);
    if(required<=available+1)continue;
    const texts=children.filter(n=>['P','INPUT','TEXTAREA'].includes(n.tagName)&&n.offsetWidth>70);
    for(const child of texts.length?texts:children.filter(n=>n.offsetWidth>80)){child.style.flex='1 1 0';child.style.width='0';child.style.minWidth='0';}
  }
}

function StateView({ id, go }: { id: string; go: (id: string) => void }) {
  const name = manifest.screens.find(s => s.id === id)?.name.replace(/^\S+\s*·\s*/, '') || 'Сообщество';
  if (id === '506:4521') return <main className="state-screen"><div className="ai-loading" aria-hidden="true"/><h1>Подбираю участников</h1><p>Ищу тех, кто может помочь с вашей задачей</p></main>;
  if (id === '506:4051' || id === '506:4090') return <main className="state-screen"><button className="back" onClick={e => {e.stopPropagation();go('BACK');}}>Назад</button><h1>{id === '506:4051' ? 'Тип запроса' : 'Причина обращения'}</h1>{(id === '506:4051' ? ['Помощь с задачей', 'Обмен опытом', 'Партнёрство'] : ['Недостоверные сведения', 'Нежелательное общение', 'Другое']).map(t => <label className="choice" key={t}><input name="reason" type="radio"/>{t}</label>)}<button className="native-primary" onClick={() => go(id === '506:4051' ? '503:2596' : '505:3942')}>Применить <span>→</span></button></main>;
  if (id === '509:4282') return <main className="state-screen"><h1>Действия с участником</h1>{[['Рекомендовать', '487:1972'], ['Пожаловаться', '505:3942'], ['Заблокировать', '505:3982']].map(([t, to]) => <button className="choice" key={to} onClick={() => go(to)}>{t}<span>›</span></button>)}<button className="quiet" onClick={e => {e.stopPropagation();go('BACK');}}>Назад</button></main>;
  const content: Record<string, [string, string, string, string]> = {
    '506:4012': ['Проверьте запрос', 'Добавьте название и описание задачи', 'К редактированию', '503:2596'],
    '506:4193': ['Приглашение отозвано', 'По этой ссылке больше нельзя вступить в сообщество', 'К приглашениям', '505:4121'],
    '506:4293': ['Поддержка проекта', 'В прототипе можно посмотреть выбор суммы и состояния оплаты', 'Выбрать сумму', '488:2076'],
    '506:4397': ['Уточните предложение', 'Куратор попросил дополнить условия для участников', 'Исправить', '491:2508'],
    '506:4430': ['Запрос отклонён', 'Контакты участника остались закрыты', 'К участникам', HOME],
    '506:4462': ['Есть активные сделки', 'Завершите или урегулируйте сделки перед удалением профиля', 'К сделкам', '504:2892'],
    '506:4582': ['Участник недоступен', 'Можно найти другого человека в сообществе', 'Найти людей', HOME],
    '506:4262': ['Как прошла встреча участников', 'Знакомства, идеи и новые проекты', 'Все новости', '488:2206'],
  };
  const [title, text, label, to] = content[id] || [name, 'Можно вернуться к основному разделу', 'На главную', HOME];
  return <main className="state-screen"><button className="back" onClick={e => {e.stopPropagation();go('BACK');}}>Назад</button><h1>{title}</h1><p>{text}</p><button className="native-primary" onClick={() => go(to)}>{label}<span>→</span></button></main>;
}

export function Prototype() {
  const [route, setRoute] = useState(currentRoute);
  const [state, setState] = useState<DemoState>(storedState);
  const stateRef = useRef(state);
  const stage = useRef<HTMLDivElement>(null);
  const motion = useRef<'none'|'section'|'forward'|'back'>('none');
  const navigation = useRef({route:currentRoute(),index:0});
  const navigationRequest = useRef(0);
  const [notice, setNotice] = useState('');
  const [loaded, setLoaded] = useState(false);
  const [catalogQuery, setCatalogQuery] = useState('');
  const frame = new URLSearchParams(location.search).get('frame') === '1' && !isTelegram();
  const catalog = new URLSearchParams(location.search).has('catalog');
  const Component = useMemo(() => registry[route] ? lazy(registry[route]) : null, [route]);
  const dispatch = useCallback((action: object) => { const next = transition(stateRef.current, action) as DemoState; stateRef.current = next; setState(next); try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch { /* The prototype also works without persistence. */ } return next; }, []);
  const storeInput = useCallback((action:object)=>{const next=transition(stateRef.current,action) as DemoState;stateRef.current=next;try{localStorage.setItem(STORAGE_KEY,JSON.stringify(next));}catch{/* Editing remains available without storage. */}return next;},[]);
  const personId = () => stateRef.current.person?.id || 'alexander';
  const go = useCallback((to: string) => {
    const request=++navigationRequest.current;
    if (to === 'BACK') { if (navigation.current.index > 0) history.back(); else location.hash = '/'+HOME; return; }
    if (to === '457:5863') to = profileRoute('Компании', stateRef.current.relationship[stateRef.current.person?.id || 'alexander']);
    const commit=()=>{if(request===navigationRequest.current)location.hash='/'+to;};
    // Keep the current screen visible until the next screen's code is ready.
    if(registry[to])void registry[to]().then(commit).catch(()=>setNotice('Не удалось загрузить экран. Попробуйте ещё раз'));
    else commit();
  }, []);
  const say = useCallback((text: string) => { setNotice(text); }, []);
  useEffect(() => { if (isTelegram()) initializeTelegram(); history.replaceState({...history.state,missionIndex:0},''); const sections=new Set([HOME,'503:2497','504:2892','678:14745','563:4968']); const update = () => {const next=currentRoute();if(next===navigation.current.route)return;const previous=navigation.current;const index=typeof history.state?.missionIndex==='number'?history.state.missionIndex:previous.index+1;history.replaceState({...history.state,missionIndex:index},'');motion.current=index<previous.index?'back':sections.has(next)&&sections.has(previous.route)?'section':'forward';navigation.current={route:next,index};setLoaded(false);setRoute(next);}; window.addEventListener('hashchange', update); return () => window.removeEventListener('hashchange', update); }, []);
  useEffect(() => { if (!notice) return; const t = setTimeout(() => setNotice(''), 4000); return () => clearTimeout(t); }, [notice]);
  useEffect(() => { const back = getTelegram()?.BackButton; if (!isTelegram() || !back) return; const handle = () => go('BACK'); route === HOME ? back.hide() : back.show(); back.onClick(handle); return () => back.offClick(handle); }, [route, go]);
  useEffect(() => { if (route !== '506:4521') return; const t = setTimeout(() => go('489:2257'), 1200); return () => clearTimeout(t); }, [route, go]);
  useEffect(()=>{if(!frame&&route==='505:3352'&&!state.saved.length)go('505:3432');},[frame,route,state.saved.length,go]);

  const initializeView = useCallback(() => {
    const el = stage.current; if (!el || !el.firstElementChild || el.querySelector('.loading-placeholder')) return;
    fitToViewport(el, frame);
    for (const a of behaviors.get(route) || []) { const n = find(el, a.id); if (n && a.event !== 'AFTER_TIMEOUT') { n.setAttribute('role', 'button'); n.tabIndex = 0; } }
    for(const icon of el.querySelectorAll<HTMLElement>('[data-name*="arrow-left"],[data-name*="chevron-left"],[data-name="Назад"]')) {
      const button=icon.closest<HTMLElement>('[data-name="Назад"]')||icon;
      button.dataset.back='true';button.setAttribute('role','button');button.setAttribute('aria-label','Назад');button.tabIndex=0;button.classList.add('prototype-back');
      if(getComputedStyle(button).position==='static')button.style.position='relative';
    }
    const makeInput = (node: HTMLElement | null, id: string, label: string, multiline = false, query = false) => {
      if (!node || node.tagName === 'INPUT' || node.tagName === 'TEXTAREA') return;
      const input = document.createElement(multiline ? 'textarea' : 'input');
      // Multi-paragraph Figma wrappers use line-height:0; the editor must inherit
      // the paragraph's typography, otherwise its caret and inserted text collapse.
      const textStyle=getComputedStyle(node.querySelector('p')||node);
      for(const prop of ['font-family','font-size','font-weight','line-height','letter-spacing','color'])input.style.setProperty(prop,textStyle.getPropertyValue(prop));
      if(parseFloat(textStyle.lineHeight)===0)input.style.lineHeight='1.4';
      const record=stateRef.current.requests.find(r=>r.id===stateRef.current.selectedRequest);
      const fieldId=route==='503:2896'&&record?id+':'+record.id:id;
      input.className = node.className + ' prototype-input'; input.dataset.field = fieldId; input.setAttribute('aria-label', label);
      const example=route==='503:2896'&&record?(/Заголовок/.test(label)?record.title:/Задача/.test(label)?record.description:node.textContent?.trim()):node.textContent?.trim();
      input.value = query ? stateRef.current.query : stateRef.current.fields[fieldId] ?? example ?? '';
      if(route==='504:2951'&&label==='Участник'&&stateRef.current.choices['504:3625'])input.value=stateRef.current.choices['504:3625'];
      if (/^(Введите|Опишите|Напишите|Сообщение|Уточните)/i.test(input.value)) { input.placeholder = input.value; input.value = stateRef.current.fields[id] || ''; }
      input.style.minWidth = '0'; if (query) { input.style.width = '0'; input.style.flex = '1 1 auto'; }
      if (query) { input.placeholder = 'Поиск по ключевому слову'; input.dataset.query = 'true'; }
      if (input instanceof HTMLTextAreaElement) input.rows = 2;
      node.replaceWith(input);
      if(multiline){input.style.height='52px';input.style.minHeight='52px';input.style.width='100%';input.style.flex='0 0 auto';input.parentElement!.style.height='auto';input.parentElement!.style.minHeight='76px';const field=input.closest<HTMLElement>('[data-name*="Field/Multiline"]');if(field){field.style.height='auto';field.style.overflow='visible';}}
    };
    if (!frame) {
      for (const c of controls.get(route) || []) {
        if (/Field\//.test(c.name)) { const value = c.texts[c.texts.length - 1]; const label=c.texts[0]?.text||'Значение';if (value) makeInput(find(el, value.id), c.id, label, /Multiline/.test(c.name),route==='505:3464'&&/Поиск/.test(label)); }
        else { const n = find(el, c.id); if (n) { if(c.name.includes('Radio Row')){n.dataset.choice=c.texts.map(t=>t.text).join(' ');n.setAttribute('role','radio');n.setAttribute('aria-checked',String((stateRef.current.choices[route]||(route==='487:1972'?'Работали вместе':''))===n.dataset.choice));}else{n.dataset.consent=c.id;n.setAttribute('role','checkbox');n.setAttribute('aria-checked',String(Boolean(stateRef.current.consents[c.id])));}n.tabIndex=0; } }
      }
      for (const n of el.querySelectorAll<HTMLElement>('[data-name="Поле"]')) { const p = n.querySelector<HTMLElement>('p'); if (p) makeInput(p, n.dataset.nodeId || '', n.parentElement?.querySelector('p')?.textContent || 'Значение'); }
      for (const n of el.querySelectorAll<HTMLElement>('[data-name*="Composer"]')) { const p = n.querySelector<HTMLElement>('p'); if (p) makeInput(p, 'composer', 'Сообщение', true); n.classList.add('prototype-composer'); }
      syncComposer(el);
      if (route === HOME) makeInput(find(el, '464:2035'), 'search', 'Поиск участников', false, true);
      if(route==='487:1972'){const box=el.querySelector<HTMLElement>('[data-name="Что делали вместе"]');const ps=box?.querySelectorAll<HTMLElement>('p');if(ps?.length)makeInput(ps[ps.length-1],box!.dataset.nodeId||'recommendation','Что делали вместе',true);}
      for (const p of el.querySelectorAll('p')) if (/Принимаю правила|Согласен на обработку|Согласен на обработку|Согласен на публикацию/.test(p.textContent || '')) { const n = p.parentElement!; n.dataset.consent = /Принимаю/.test(p.textContent||'')?'rules':/публикацию/.test(p.textContent||'')?'publication':'privacy'; n.tabIndex = 0; n.setAttribute('role', 'checkbox'); n.setAttribute('aria-checked', String(Boolean(stateRef.current.consents[n.dataset.consent]))); }
      if(route===HOME)syncHomeFilters(el,stateRef.current.filter);
      refreshPeople(el,route,stateRef.current);
      showRequestRecords(el,route,stateRef.current.requests,stateRef.current.selectedRequest);
      syncConsentButton(el,route,stateRef.current.consents);
      if(route==='488:2076'){const value=find(el,'488:2113');makeInput(value,'custom-amount','Другая сумма');const input=el.querySelector<HTMLInputElement>('[data-field="custom-amount"]');if(input){input.dataset.amount='true';input.inputMode='numeric';input.value='';}syncAmount(el,stateRef.current.amount);}
    }
    if (!frame && foreignProfiles.has(route)) {
      if (!stateRef.current.relationship[personId()] && ['726:5802','726:5915'].includes(route)) dispatch({type: route === '726:5915' ? 'accept' : 'request', person: personId()});
      const rel = stateRef.current.relationship[personId()];
      for (const p of el.querySelectorAll('p')) if (['Познакомиться', 'Написать', 'Запрос отправлен'].includes(p.textContent?.trim() || '')) { p.textContent = rel === 'accepted' ? 'Написать' : rel === 'pending' ? 'Запрос отправлен' : 'Познакомиться';if(rel==='pending')p.style.fontSize='12px'; }
      const actions=el.querySelector('[data-name="Действия профиля"]');if(actions&&rel==='accepted'&&![...el.querySelectorAll('p')].some(p=>p.textContent?.startsWith('Вы знакомы'))){const status=document.createElement('p');status.className='local-status';status.textContent='Вы знакомы · открыт Telegram';actions.before(status);}
      if (stateRef.current.person && stateRef.current.person.id !== 'alexander') {
        const person = stateRef.current.person;
        for (const p of el.querySelectorAll('p')) { if (p.textContent?.trim() === 'Александр Репин') p.textContent = person.name; if (p.textContent?.includes('Основатель · ТВОЙ СТИЛЬ')) p.textContent = person.role; }
        const avatar = [...el.querySelectorAll<HTMLImageElement>('img')].find(img => { const r = img.getBoundingClientRect(); return r.width >= 75 && r.width <= 85; });
        if (avatar) avatar.src = photoUrl(person.photo);
        for(const p of el.querySelectorAll('p'))if(p.textContent?.trim()==='Опора сообщества')p.parentElement!.style.display='none';
        el.querySelectorAll<HTMLElement>('[data-name="Масштаб бизнеса · видимость"],[data-name="Видео"]').forEach(n=>n.style.display='none');
        const tabs=el.querySelector<HTMLElement>('[data-name="Вкладки профиля"]');const content=tabs?.nextElementSibling;
        if(content){const card=document.createElement('div');card.className='choice';const text=document.createElement('p');text.textContent=route==='729:5891'?'Участник пока не добавил запросы':route==='729:6028'?'Участник пока не добавил экспертизы':person.role;card.append(text);content.replaceChildren(card);}
      }
    }
    if(!frame&&stateRef.current.person&&route.startsWith('487:')){const p=stateRef.current.person;const name=p.name;const accusative=name==='Мария Волкова'?'Марию Волкову':name==='Андрей Белов'?'Андрея Белова':name;const instrumental=name==='Мария Волкова'?'Марией Волковой':name==='Андрей Белов'?'Андреем Беловым':name;for(const text of el.querySelectorAll('p'))if(text.textContent?.includes('Александр'))text.textContent=text.textContent.replaceAll('С Александром Репиным','С '+instrumental).replaceAll('Александра Репина',accusative).replaceAll('Александр Репин',name).replaceAll('Александр принял',name.split(' ')[0]+' принял');}
    if(!frame&&route.startsWith('504:')&&stateRef.current.deal){const deal=stateRef.current.deal;for(const p of el.querySelectorAll('p')){const t=normalized(p.textContent||'');if(t==='Запуск отдела продаж')p.textContent=deal.title;if(t.includes('Воронка, регламенты')&&t.includes('обучение'))p.textContent=deal.result;if(t.includes('60 000 ₽'))p.textContent=t.replace('60 000 ₽',deal.cost||'60 000 ₽');}if(route==='504:2892'){const container=el.querySelector('[data-name^="Содержание"] [data-name="Контент"]')||el.querySelector('[data-name^="Содержание"]');if(container){const b=document.createElement('button');b.className='local-request';b.dataset.deal='current';b.textContent=deal.title+' · '+(deal.status||'Согласование');container.append(b);}}}
    if (route === '504:3133' && stateRef.current.messages.length) { const list = document.createElement('div'); list.className = 'prototype-messages'; for (const msg of stateRef.current.messages as { id: string; text: string }[]) { const p = document.createElement('p'); p.textContent = msg.text; list.append(p); } (el.querySelector('[data-name*="Содержание"]') || el.firstElementChild)?.appendChild(list); }
    if(!frame&&motion.current!=='none'&&!matchMedia('(prefers-reduced-motion: reduce)').matches){
      const direction=motion.current;
      el.animate([{opacity:direction==='section'?0.35:0.6,transform:direction==='section'?'translateY(6px)':`translateX(${direction==='back'?-20:20}px)`},{opacity:1,transform:direction==='section'?'translateY(0)':'translateX(0)'}],{duration:direction==='section'?200:260,easing:'cubic-bezier(0.22, 1, 0.36, 1)'});
    }
    motion.current='none';
    setLoaded(true);
  }, [route, frame, dispatch]);
  useLayoutEffect(() => {
    const el = stage.current; if (!el) return;
    const observer = new MutationObserver(() => { if (el.querySelector('[data-node-id],.state-screen') && !el.dataset.prepared) { el.dataset.prepared = 'true'; initializeView(); } });
    observer.observe(el, { childList: true, subtree: true });
    if (el.querySelector('[data-node-id],.state-screen')) { el.dataset.prepared = 'true'; initializeView(); }
    return () => { observer.disconnect(); delete el.dataset.prepared; };
  }, [route, initializeView]);

  const activate = useCallback((target: HTMLElement) => {
    const root = stage.current; if (!root || target.closest('input,textarea,select')) return;
    if(target.closest('[data-back]')||normalized(target.textContent||'')==='Назад'){go('BACK');return;}
    const consent = target.closest<HTMLElement>('[data-consent]'); if (consent) { const next = dispatch({ type: 'consent', id: consent.dataset.consent }); consent.setAttribute('aria-checked', String(next.consents[consent.dataset.consent!])); consent.classList.toggle('prototype-checked', next.consents[consent.dataset.consent!]);syncConsentButton(root,route,next.consents); return; }
    const choice = target.closest<HTMLElement>('[data-choice]'); if (choice) { dispatch({ type: 'choice', screen: route, value: choice.dataset.choice }); root.querySelectorAll('[data-choice]').forEach(n => n.setAttribute('aria-checked', String(n === choice))); return; }
    const ancestors: HTMLElement[] = []; for (let n: HTMLElement | null = target; n && n !== root; n = n.parentElement) ancestors.push(n);
    const clickable=ancestors.find(n=>n.matches('a,button,[role="button"]'));
    const label = normalized(ancestors.find(n => n.tagName === 'P')?.textContent || clickable?.querySelector('p')?.textContent || clickable?.textContent || target.textContent || '');
    const name = ancestors.map(n => n.dataset.name || '').join(' / ');
    if (/bookmark|Сохранить/.test(name) && label !== 'Сохранить') { const card = ancestors.find(isPersonNode); const profile=card?personFromCard(card):stateRef.current.person||{id:'alexander',name:'Александр Репин',role:'Основатель · ТВОЙ СТИЛЬ',photo:localPhoto([...root.querySelectorAll<HTMLImageElement>('img')].find(i=>i.getBoundingClientRect().width>=75&&i.getBoundingClientRect().width<=85)?.src||'')}; const id=profile.id;const next = dispatch({ type: 'save', person:id,profile });const icon=ancestors.find(n=>/bookmark|Сохранить/.test(n.dataset.name||''));if(icon)icon.dataset.saved=String(next.saved.includes(id)); say(next.saved.includes(id) ? 'Участник сохранён' : 'Участник убран из сохранённых'); return; }
    const amountChoice=target.closest<HTMLElement>('[data-amount-choice]');if(amountChoice){const next=dispatch({type:'amount',value:Number(amountChoice.dataset.amountChoice)});syncAmount(root,next.amount);return;}
    if (route === '464:1714' && label === 'Продолжить') { if (!consentReady(stateRef.current)) { say('Примите правила и согласие на обработку данных'); return; } go('464:1784'); return; }
    if(route==='464:1844'&&label==='Отправить анкету'&&!stateRef.current.consents.publication){say('Подтвердите согласие на публикацию профиля');return;}
    if (foreignProfiles.has(route) && ['Компании', 'Запросы', 'Экспертизы'].includes(label)) { go(profileRoute(label, stateRef.current.relationship[personId()])); return; }
    if (foreignProfiles.has(route) && label === 'Запрос отправлен') { say('Запрос уже отправлен. Ожидайте ответа участника'); return; }
    if (label === 'Написать' || /НАПИСАТЬ В TELEGRAM|ОТПРАВИТЬ В TELEGRAM|Написать андрею|В Telegram/.test(label)) { say('В прототипе сообщение не отправляется'); return; }
    if (route === HOME && ['Все', 'Мои', 'Новые'].includes(label)) { const next=dispatch({ type: 'filter', value: label }); syncHomeFilters(root,next.filter);refreshPeople(root,route,next); return; }
    if (/Фильтры/.test(name) && route === HOME) { go('505:3550'); return; }
    if (/Уведомления · открыть/.test(name)) { go('505:3645'); return; }
    if(label==='Мои запросы'||route==='503:2497'&&label==='Мои'){go('503:2842');return;}
    if(route.startsWith('503:')&&label==='Входящие'){go('503:2728');return;}
    if(label==='Сбросить фильтры'){dispatch({type:'criteria',value:{}});dispatch({type:'query',value:''});}
    if(/^\d+ рекомендаци/.test(label)){const member=ancestors.find(isPersonNode);if(member)dispatch({type:'person',person:personFromCard(member)});go('487:1938');return;}
    if(label==='Доверие'){go('487:1938');return;}
    if(label==='Опора сообщества'){go('457:5992');return;}
    if(/^Видео ·/.test(name)||name.includes('/ Видео ·')){say('В прототипе видео доступно как превью');return;}
    const company=ancestors.find(n=>['ТВОЙ СТИЛЬ','TREND PRO','GOOD JOB'].includes(n.dataset.name||''));if(company){const collapsed=company.dataset.collapsed!=='true';company.dataset.collapsed=String(collapsed);company.setAttribute('aria-expanded',String(!collapsed));[...company.children].slice(1).forEach(n=>(n as HTMLElement).style.display=collapsed?'none':'');return;}
    if(label==='Подробнее о человеке'){const box=ancestors.find(n=>n.dataset.name==='О себе');if(box){const old=box.querySelector('.profile-details');if(old){old.remove();box.style.height='44px';}else{const details=document.createElement('p');details.className='profile-details';details.textContent=stateRef.current.person?.role||'Предприниматель. Развитие бизнеса, команды и совместные проекты';box.style.height='auto';box.style.flexWrap='wrap';details.style.flexBasis='100%';box.append(details);}}return;}
    if(/Скопировать/.test(label)){void navigator.clipboard.writeText(location.origin+location.pathname+'?screen=464%3A1674&invite=demo').then(()=>say('Ссылка на прототип скопирована')).catch(()=>say('Не удалось скопировать ссылку'));return;}
    const localRequest=target.closest<HTMLElement>('[data-request]');if(localRequest){dispatch({type:'selectRequest',id:localRequest.dataset.request});go('503:2556');return;}
    if(route==='503:2556'&&label==='Изменить запрос'&&stateRef.current.selectedRequest){go('503:2896');return;}
    if(route==='503:2896'&&label==='Закрыть запрос'){go('503:2945');return;}
    if(target.closest('[data-deal]')){go(({Согласование:'504:3003',Работа:'504:3088',Проверка:'504:3212',Завершена:'504:3284',Отменена:'504:3527'} as Record<string,string>)[stateRef.current.deal?.status||'Согласование']||'504:3003');return;}
    const card = ancestors.find(isPersonNode);
    if (card && !ownProfiles.has(route)) { if(route==='504:3625'){dispatch({type:'choice',screen:route,value:personFromCard(card).name});card.classList.add('prototype-checked');return;}dispatch({ type: 'person', person:personFromCard(card) }); go('457:5863'); return; }
    if (route.startsWith('489:') && /Отправить/.test(name)) { const input=root.querySelector<HTMLTextAreaElement>('[data-field="composer"]');if(!input?.value.trim())return;go('506:4521');return; }
    if (route === '504:3133' && /Отправить/.test(name)) { const input = root.querySelector<HTMLTextAreaElement>('[data-field="composer"]'); if (input?.value.trim()) { dispatch({ type: 'message', id: crypto.randomUUID(), text: input.value });appendMessage(root,input.value); input.value = '';syncComposer(root); } return; }
    const actions = behaviors.get(route) || [];
    const action = ancestors.map(n => actions.find(a => a.id === n.dataset.nodeId && a.event !== 'AFTER_TIMEOUT')).find(Boolean);
    let to = action?.to || captions[label];
    if(ownProfiles.has(route)&&label==='Как видят другие')dispatch({type:'person',person:null});
    if(route==='505:3550'&&label==='Показать людей'){const criteria:Record<string,string>={};for(const input of root.querySelectorAll<HTMLInputElement>('.prototype-input'))criteria[input.getAttribute('aria-label')||'']=input.value;dispatch({type:'criteria',value:criteria});}
    if (route === '487:2037' && label === 'Отправить запрос') dispatch({ type: 'request', person: personId() });
    if (route === '487:2068' && label === 'Принять запрос') dispatch({ type: 'accept', person: personId() });
    if (route === '487:2068' && label === 'Отказать') { dispatch({ type: 'decline', person: personId() }); to = '506:4430'; }
    if (route === '487:1972' && label === 'На проверку') dispatch({ type: 'recommend', person: personId() });
    if(route==='488:2076'&&label==='Перейти к оплате'){if(!(stateRef.current.amount>0)){say('Введите сумму больше нуля');return;}dispatch({type:'startPayment',id:crypto.randomUUID()});}
    if (route === '488:2308' && label === 'Проверить статус') {if(!stateRef.current.payment)dispatch({type:'startPayment',id:crypto.randomUUID()});dispatch({ type: 'donate' });}
    if(route==='504:2951'&&label==='На согласование'){const inputs=[...root.querySelectorAll<HTMLInputElement|HTMLTextAreaElement>('.prototype-input')];if(inputs.some(i=>!i.value.trim())){say('Заполните условия сделки');return;}dispatch({type:'deal',value:{member:inputs[0]?.value,title:inputs[1]?.value,result:inputs[2]?.value,cost:inputs[3]?.value,deadline:inputs[4]?.value,status:'Согласование'}});}
    if(route.startsWith('504:')&&stateRef.current.deal){const stageByDestination:Record<string,string>={'504:3088':'Работа','504:3212':'Проверка','504:3559':'Проверка','504:3284':'Завершена','504:3527':'Отменена'};if(to&&stageByDestination[to])dispatch({type:'deal',value:{status:stageByDestination[to]}});}
    if (route === '503:2596' && label === 'Опубликовать') {
      const fields = [...root.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>('.prototype-input')];
      if (fields.some(f => !f.getAttribute('aria-label')?.includes('необязательно')&&!f.value.trim())) { say('Заполните обязательные поля'); return; }
      dispatch({ type: 'publish', id: crypto.randomUUID(), title: fields[0]?.value || 'Новый запрос', description: fields[1]?.value || '' });
    }
    if(route==='503:2896'&&label==='Сохранить'){const fields=[...root.querySelectorAll<HTMLInputElement|HTMLTextAreaElement>('.prototype-input')];if(!fields[0]?.value.trim()||!fields[1]?.value.trim()){say('Добавьте заголовок и описание');return;}dispatch({type:'editRequest',title:fields[0].value,description:fields[1].value});}
    if(route==='503:2945'&&label==='Закрыть запрос')dispatch({type:'closeRequest'});
    if (/Отправить|Опубликовать|На проверку/.test(label) && !to) { to = '738:6613'; }
    if (label === 'Закрыть' && route === '505:4267') { getTelegram()?.close?.(); go(HOME); return; }
    if (to && !['URL', 'CLOSE', 'CHANGE_TO'].includes(to)) go(to);
  }, [route, dispatch, go, say]);

  if (catalog) return <main className="screen-catalog"><h1>Экраны прототипа</h1><p>{Object.keys(registry).length} экранов перенесены из Figma. Для 12 дополнительных состояний используются общие шаблоны до визуальной сверки.</p><input aria-label="Найти экран" placeholder="Найти экран" value={catalogQuery} onChange={e => setCatalogQuery(e.target.value)}/><div>{manifest.screens.filter(s => s.name.toLowerCase().includes(catalogQuery.toLowerCase())).map(s => <a key={s.id} href={`?screen=${encodeURIComponent(s.id)}`}><span>{s.name}</span>{!registry[s.id] && <small>Нужно сравнить</small>}</a>)}</div></main>;
  return <div className={frame ? 'prototype-shell framed' : 'prototype-shell'}><div key={route} ref={stage} className="design-stage" data-screen={route} data-loaded={loaded} onClick={e => { if ((e.target as HTMLElement).closest('input,textarea,select')) return; e.preventDefault(); activate(e.target as HTMLElement); }} onKeyDown={e => { const target = e.target as HTMLElement; if (e.key === 'Enter' && target.matches('[data-query]')) { go('505:3464'); return; } if ((e.key === 'Enter' || e.key === ' ') && !target.matches('input,textarea,select')) { e.preventDefault(); activate(target); } }} onInput={e => { const t = e.target as HTMLInputElement; if(t.dataset.amount){const n=Number(t.value.replace(/\s/g,''));const next=storeInput({type:'amount',value:Number.isFinite(n)&&n>0?n:0});if(stage.current)syncAmount(stage.current,next.amount);return;}if (t.dataset.field) {storeInput(t.dataset.query ? { type: 'query', value: t.value } : { type: 'field', id: t.dataset.field, value: t.value });if(t.dataset.field==='composer'&&stage.current)syncComposer(stage.current);} }}><Suspense fallback={<div className="loading-placeholder" aria-label="Загрузка экрана"/>}>{Component ? <Component/> : <StateView id={route} go={go}/>}</Suspense></div>{notice && <div className="prototype-toast" role="status">{notice}<button aria-label="Закрыть уведомление" onClick={() => setNotice('')}>×</button></div>}</div>;
}
