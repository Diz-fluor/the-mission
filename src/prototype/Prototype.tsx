import { Suspense, lazy, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, type ComponentType } from 'react';
import { prepareFunding } from './funding';
import { preparePickers } from './pickers';
import { prepareSettings, accessFor, blockedNames } from './settings';
import { prepareRequestCards, showSelectedRequest, demoRequests } from './requests';
import { prepareOnboarding } from './onboarding';
import { prepareProfileEditor, readProfileEditor, applyOwnProfile, handleProfileEditor, defaultProfile, type OwnProfile } from './own-profile';
import { syncDeals, prepareRequestTabs, prepareDealList, demoDeals } from './deals';
import { applyParticipant, participants, personForName } from './participants';
import { prepareProfile, prepareSupportExplanation, toggleProfileDetails, toggleMoreExpertise } from './profile';
import { screens as capturedScreens } from '../design/registry';
import behaviorData from '../design/behavior.json';
import controlData from '../design/controls.json';
import manifest from '../../docs/figma-screens.json';
import { STORAGE_KEY, initialState, restoreState, transition, profileRoute, consentReady } from './state.mjs';
import { getTelegram, initializeTelegram, isTelegram } from './telegram';
import { appendMessage, isPersonNode, personFromCard, refreshPeople, showRequestRecords, syncConsentButton, syncAmount, syncComposer, syncHomeFilters, prepareChoices, localPhoto, photoUrl, type Person } from './dom';

type DemoState = {payments:{id:string;amount:number;createdAt:string}[];createdDeals:Record<string,string>[];demoDealOverrides:Record<string,Record<string,string>>;profile:OwnProfile|null; relationship: Record<string, string>; recommendations: Record<string, string>; fields: Record<string, string>; consents: Record<string, boolean>; choices: Record<string, string>; person: Person | null; saved: string[]; savedPeople:Record<string,Person>; requests: { id: string; title: string; description: string; closed?:boolean }[]; selectedRequest:string|null; messages: { id: string; text: string; dealId?:string }[]; query: string; filter: string; criteria:Record<string,string>; contribution: number; amount: number; payment:{id:string;amount:number;status:string}|null; deal:Record<string,string>|null };
type Action = { id: string; to: string; event?: string; delay?: number };
const registry = capturedScreens as Record<string, () => Promise<{ default: ComponentType }>>;
const HOME = '464:2016';
const ownProfiles = new Set(['563:4968', '457:5605', '457:5722']);
const foreignProfiles = new Set(['457:5863', '457:5992', '726:5802', '726:5915', '729:5891', '729:6028']);
const captions: Record<string, string> = { 'Главная': HOME, 'Запросы': '503:2497', 'Сделки': '504:2892', 'Сообщество': '678:14745', 'Профиль': '563:4968', 'Найти людей': HOME, 'Создать запрос': '503:2596', 'Новый запрос': '503:2596', 'Редактировать': '500:2604', 'Редактировать профиль': '500:2604', 'Как видят другие': '457:5863', 'Рекомендовать': '487:1972', 'Фильтры': '505:3550', 'Уведомления': '505:3645', 'Пригласить участника': '505:4047', 'Мои приглашения': '505:4121', 'Оставить рекомендацию': '487:1972', 'Почему подходит Мария': '489:2295', 'Повторить': '489:2186', 'Предложить сделку':'504:2951', 'Пожаловаться':'505:3942', 'Заблокировать':'505:3982', 'Посмотреть отчёт о расходах':'488:2206', 'Вернуться к каталогу':HOME, 'Посмотреть результат':'504:3212', 'Мария откликнулась':'503:2782', 'Сделка согласована':'504:3088', 'Рекомендация опубликована':'487:1938', 'Заблокированные':'505:4017', 'Доступ к контактам':'505:3790', 'Правила и данные':'464:1714', 'Отозвать весь доступ':'505:3869', 'Отозвать приглашение':'506:4193', 'Пригласить человека':'505:4047', 'Отмена':'BACK', 'Оставить доступ':'BACK', 'Сохранить и выйти':'563:4968', 'Выйти без сохранения':'563:4968', 'Профиль автора':'457:5863', 'Андрей хочет познакомиться':'487:2068' };
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
    else if(w>280&&Math.abs(pw-393)<2&&getComputedStyle(n).position==='absolute'){
      const inset=Math.round((393-w)/2);n.style.width=`calc(100% - ${inset*2}px)`;n.style.minWidth='0';
    }
    else if (n.parentElement === root && w > 280) { const inset = Math.round((393 - w) / 2); n.style.width = `calc(100% - ${inset * 2}px)`; }
  }
  root.style.borderRadius = '0'; root.style.width = '100%'; root.style.height = '100%';
  for (const child of [...root.children] as HTMLElement[]) {
    const name = child.dataset.name || '';
    if (/Статус-бар|Telegram Mini App|Статус-бар и шапка/.test(name)) { child.style.display = 'none'; continue; }
    if (name === 'Rectangle' && child.offsetHeight <= 5) { child.style.display = 'none'; continue; }
    if (/Свет/.test(name)) { child.style.width = '100%'; child.style.top = '0'; continue; }
    const m = measurements.find(m => m.n === child)!;
    if(name==='Rectangle'&&m.h>500&&m.w>300)child.classList.add('prototype-overlay');
    if (/Таббар/.test(name)) { child.style.top = 'auto'; child.style.bottom = 'calc(12px + env(safe-area-inset-bottom, 0px))'; child.style.width = 'calc(100% - 32px)'; for (const item of [...child.children] as HTMLElement[]) if (getComputedStyle(item).position !== 'absolute') { item.style.flex = '1 1 0'; item.style.width = '0'; item.style.minWidth = '0'; } continue; }
    if(name==='Profile / Scroll content'){
      child.style.height='calc(100% - 100px - var(--safe-top) - env(safe-area-inset-bottom, 0px))';
      child.style.marginTop='var(--safe-top)';child.style.flexShrink='0';child.style.overflowY='auto';child.style.paddingBottom='24px';
      continue;
    }
    if (m.style.position === 'absolute' && m.top >= offset - 4) {
      const top = Math.max(0, m.top - offset); child.style.top = `calc(${top}px + var(--safe-top))`;
      if (m.top > 650 && m.h <= 76) { child.style.top = 'auto'; child.style.bottom = 'calc(16px + env(safe-area-inset-bottom, 0px))'; }
      else if (/Лента|Scroll content|прокрутка/.test(name)) { child.style.height = `calc(100% - ${top + (nav ? 100 : 24)}px - var(--safe-top) - env(safe-area-inset-bottom, 0px))`; }
      else if (/Содержание/.test(name)) { child.style.maxHeight = `calc(100% - ${top + 112}px - var(--safe-top))`; child.style.overflowY = 'auto'; }
    }
  }
  for(const actions of root.querySelectorAll<HTMLElement>('[data-name="Личные действия · Сохранённые и уведомления"]')){actions.style.left='auto';actions.style.right=root.querySelector('[data-name="Настройки · открыть"]')?'44px':'0';actions.parentElement?.classList.add('profile-trust-actions');}
  for (const row of root.querySelectorAll<HTMLElement>('[data-name="Действия профиля"]')) for (const b of [...row.children].slice(0, 2) as HTMLElement[]) { b.style.flex = '1 1 0'; b.style.width = '0'; b.style.minWidth = '0'; }
  const settings=root.querySelector<HTMLElement>('[data-name="Настройки · открыть"]');const trust=root.querySelector<HTMLElement>('.profile-trust-actions');
  if(settings&&trust){trust.append(settings);settings.style.position='absolute';settings.style.top='-8px';settings.style.right='0';settings.style.left='auto';}
  stage.style.width = '100%'; stage.style.height = '100%';
  for(const nav of root.querySelectorAll<HTMLElement>('[data-name*="Таббар"]')){
    if(nav.parentElement!==root){nav.parentElement!.style.height='100%';nav.parentElement!.style.width='100%';nav.style.top='auto';nav.style.bottom='calc(12px + env(safe-area-inset-bottom,0px))';nav.style.left='16px';nav.style.transform='none';nav.style.width='calc(100% - 32px)';
      for(const item of [...nav.children] as HTMLElement[])if(getComputedStyle(item).position!=='absolute'){item.style.flex='1 1 0';item.style.width='0';item.style.minWidth='0';}
    }
  }
  for(const n of root.querySelectorAll<HTMLElement>('[data-name="Контент"]'))if(getComputedStyle(n).flexDirection==='column'){n.style.height='auto';n.style.overflow='visible';n.style.flexShrink='0';}
  for(const row of root.querySelectorAll<HTMLElement>('*')){
    if(row.dataset.name==='Видео · прокрутка')continue;
    const css=getComputedStyle(row);if(css.display!=='flex'||css.flexDirection!=='row')continue;
    const children=[...row.children].filter(n=>getComputedStyle(n).position!=='absolute'&&getComputedStyle(n).display!=='none') as HTMLElement[];
    const available=row.clientWidth-parseFloat(css.paddingLeft)-parseFloat(css.paddingRight);
    const required=children.reduce((n,c)=>n+c.offsetWidth,0)+Math.max(0,children.length-1)*(parseFloat(css.columnGap)||0);
    if(required<=available+1)continue;
    const texts=children.filter(n=>['P','INPUT','TEXTAREA'].includes(n.tagName)&&n.offsetWidth>70);
    for(const child of texts.length?texts:children.filter(n=>n.offsetWidth>80)){child.style.flex='1 1 0';child.style.width='0';child.style.minWidth='0';}
  }
  for(const dot of root.querySelectorAll<HTMLElement>('[data-name*="Таббар"] [data-name="THE MISSION/Indicator/Unread"]')){
    const icon=dot.parentElement?.querySelector<HTMLElement>('[data-name*="briefcase"]');
    if(icon){dot.style.left=`calc(50% + ${icon.offsetWidth/2-dot.offsetWidth/2}px)`;dot.style.top=`${icon.offsetTop-dot.offsetHeight/2}px`;}
  }
  for(const nav of root.querySelectorAll<HTMLElement>('[data-name*="Таббар"]')){
    const items=[...nav.children].filter(n=>getComputedStyle(n).position!=='absolute') as HTMLElement[];
    const active=items.findIndex(n=>n.tagName!=='A');const glow=nav.querySelector<HTMLElement>('[data-name="Active glow"]');
    if(glow&&active>=0){items[active].prepend(glow);glow.style.left='50%';glow.style.top='24px';glow.style.transform='translateX(-50%)';glow.style.pointerEvents='none';}
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
  const motion = useRef<'none'|'section'|'forward'|'back'|'profile-tab'>('none');
  const profileView=useRef<{scroll:number;video:number;expanded:boolean}|null>(null);
  const navigation = useRef({route:currentRoute(),index:0});
  const navigationRequest = useRef(0);
  const editorReturn=useRef<{index:number;route:string}|null>(null);
  const [notice, setNotice] = useState('');
  const [loaded, setLoaded] = useState(false);
  const [catalogQuery, setCatalogQuery] = useState('');
  const frame = new URLSearchParams(location.search).get('frame') === '1' && !isTelegram();
  const catalog = new URLSearchParams(location.search).has('catalog');
  const Component = useMemo(() => registry[route] ? lazy(registry[route]) : null, [route]);
  const dispatch = useCallback((action: object) => { const next = transition(stateRef.current, action) as DemoState; stateRef.current = next; setState(next); try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch { /* The prototype also works without persistence. */ } return next; }, []);
  const storeInput = useCallback((action:object)=>{const next=transition(stateRef.current,action) as DemoState;stateRef.current=next;try{localStorage.setItem(STORAGE_KEY,JSON.stringify(next));}catch{/* Editing remains available without storage. */}return next;},[]);
  const personId = () => stateRef.current.person?.id || 'alexander';
  const go = useCallback((to: string,replace=false) => {
    const request=++navigationRequest.current;
    if(to==='500:2604'&&ownProfiles.has(currentRoute()))editorReturn.current={index:navigation.current.index,route:currentRoute()};
    if(to==='BACK'&&currentRoute()==='500:2604'){const root=stage.current;if(root?.dataset.dirty==='true'){storeInput({type:'field',id:'profile-draft',value:JSON.stringify(readProfileEditor(root,stateRef.current.profile))});to='505:4358';}else to='563:4968';}
    if(to==='BACK'&&ownProfiles.has(currentRoute()))to=HOME;
    if(to==='BACK'&&currentRoute()==='489:2257'&&navigation.current.index===0)to='489:2186';
    if(ownProfiles.has(to)&&['500:2604','505:4358','505:4326'].includes(currentRoute())){const origin=editorReturn.current;if(origin&&navigation.current.index>origin.index){editorReturn.current=null;history.go(origin.index-navigation.current.index);return;}replace=true;}
    if (to === 'BACK') { if (navigation.current.index > 0) history.back(); else location.hash = '/'+HOME; return; }
    if (to === '457:5863') to = profileRoute('Компании', stateRef.current.relationship[stateRef.current.person?.id || 'alexander']);
    const from=currentRoute();
    if((ownProfiles.has(from)&&ownProfiles.has(to))||(foreignProfiles.has(from)&&foreignProfiles.has(to)&&from!=='457:5992'&&to!=='457:5992')){
      const root=stage.current;profileView.current={scroll:root?.querySelector('[data-name="Profile / Scroll content"]')?.scrollTop||0,video:root?.querySelector('[data-name="Видео · прокрутка"]')?.scrollLeft||0,expanded:root?.querySelector('.profile-about-toggle')?.getAttribute('aria-expanded')==='true'};
    }else profileView.current=null;
    const commit=()=>{if(request===navigationRequest.current){if(replace){history.replaceState(history.state,'','#/'+to);window.dispatchEvent(new HashChangeEvent('hashchange'));}else location.hash='/'+to;}};
    // Keep the current screen visible until the next screen's code is ready.
    if(registry[to])void registry[to]().then(commit).catch(()=>setNotice('Не удалось загрузить экран. Попробуйте ещё раз'));
    else commit();
  }, []);
  const say = useCallback((text: string) => { setNotice(text); }, []);
  useEffect(() => { if (isTelegram()) initializeTelegram(); history.replaceState({...history.state,missionIndex:0},''); const sections=new Set([HOME,'503:2497','504:2892','678:14745','563:4968']); const update = () => {const next=currentRoute();if(next===navigation.current.route)return;const previous=navigation.current;const index=typeof history.state?.missionIndex==='number'?history.state.missionIndex:previous.index+1;history.replaceState({...history.state,missionIndex:index},'');motion.current=index<previous.index?'back':sections.has(next)&&sections.has(previous.route)?'section':'forward';navigation.current={route:next,index};setLoaded(false);setRoute(next);}; window.addEventListener('hashchange', update); return () => window.removeEventListener('hashchange', update); }, []);
  useEffect(()=>{const resize=()=>document.documentElement.style.setProperty('--app-height',`${window.visualViewport?.height||innerHeight}px`);resize();window.visualViewport?.addEventListener('resize',resize);window.addEventListener('resize',resize);return()=>{window.visualViewport?.removeEventListener('resize',resize);window.removeEventListener('resize',resize);};},[]);
  useEffect(() => { if (!notice) return; const t = setTimeout(() => setNotice(''), 4000); return () => clearTimeout(t); }, [notice]);
  useEffect(() => { const back = getTelegram()?.BackButton; if (!isTelegram() || !back) return; const handle = () => go('BACK'); route === HOME ? back.hide() : back.show(); back.onClick(handle); return () => back.offClick(handle); }, [route, go]);
  useEffect(() => { if (route !== '506:4521') return; const t = setTimeout(() => go('489:2257',true), 1200); return () => clearTimeout(t); }, [route, go]);
  useEffect(()=>{if(!frame&&route==='505:3352'&&!state.saved.length)go('505:3432');},[frame,route,state.saved.length,go]);

  const initializeView = useCallback(() => {
    const el = stage.current; if (!el || !el.firstElementChild || el.querySelector('.loading-placeholder')) return;
    fitToViewport(el, frame);
    if(!frame)for(const sheet of el.querySelectorAll<HTMLElement>('[data-name*="нижняя панель"],[data-name$="· панель"]')){if(sheet===el.firstElementChild)continue;sheet.classList.add('prototype-sheet');for(const close of sheet.querySelectorAll<HTMLElement>('[data-name*="x-close"]')){close.dataset.back='true';close.setAttribute('role','button');close.setAttribute('aria-label','Закрыть');close.tabIndex=0;close.classList.add('sheet-close');}}
    for (const a of behaviors.get(route) || []) { const n = find(el, a.id); if (n && a.event !== 'AFTER_TIMEOUT') { n.setAttribute('role', 'button'); n.tabIndex = 0; } }
    for(const icon of el.querySelectorAll<HTMLElement>('[data-name*="arrow-left"],[data-name*="chevron-left"],[data-name="Назад"]')) {
      const button=icon.closest<HTMLElement>('[data-name="Назад"]')||icon;
      button.dataset.back='true';button.setAttribute('role','button');button.setAttribute('aria-label','Назад');button.tabIndex=0;button.classList.add('prototype-back');
      if(getComputedStyle(button).position==='static')button.style.position='relative';
    }
    for(const p of el.querySelectorAll<HTMLElement>('p'))if(captions[normalized(p.textContent||'')]){const candidate=p.closest<HTMLElement>('a,button,[data-name*="/Row/"]')||p.parentElement;if(candidate&&candidate!==el&&candidate.getBoundingClientRect().height<=120&&!candidate.dataset.name?.includes('Таббар')){candidate.setAttribute('role','button');candidate.tabIndex=0;}}
    const makeInput = (node: HTMLElement | null, id: string, label: string, multiline = false, query = false) => {
      if (!node || node.tagName === 'INPUT' || node.tagName === 'TEXTAREA') return;
      const input = document.createElement(multiline ? 'textarea' : 'input');
      // Multi-paragraph Figma wrappers use line-height:0; the editor must inherit
      // the paragraph's typography, otherwise its caret and inserted text collapse.
      const textStyle=getComputedStyle(node.querySelector('p')||node);
      for(const prop of ['font-family','font-size','font-weight','line-height','letter-spacing','color'])input.style.setProperty(prop,textStyle.getPropertyValue(prop));
      if(parseFloat(textStyle.lineHeight)===0)input.style.lineHeight='1.4';
      const record=stateRef.current.requests.find(r=>r.id===stateRef.current.selectedRequest);
      const fieldId=id==='composer'?'composer:'+(route==='504:3133'?'deal:'+(stateRef.current.deal?.id||'demo-sales'):'ai'):route==='503:2896'&&record?id+':'+record.id:id;
      input.className = node.className + ' prototype-input'; input.dataset.field = fieldId;if(id==='composer')input.dataset.composer='true'; input.setAttribute('aria-label', label);
      const example=route==='503:2896'&&record?(/Заголовок/.test(label)?record.title:/Задача/.test(label)?record.description:node.textContent?.trim()):node.textContent?.trim();
      input.value = query ? stateRef.current.query : stateRef.current.fields[fieldId] ?? example ?? '';
      if(route==='504:2951'&&label==='Участник'&&stateRef.current.choices['504:3625'])input.value=stateRef.current.choices['504:3625'];
      if (/^(Введите|Опишите|Напишите|Расскажите|Сообщение|Уточните|Добавить номер|Имя участника|Текущий аккаунт)/i.test(input.value)) { input.placeholder = input.value; input.value = stateRef.current.fields[id] || ''; }
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
      for (const n of el.querySelectorAll<HTMLElement>('[data-name="Поле"]')) { const p = n.querySelector<HTMLElement>('p'); if (p) makeInput(p, n.dataset.nodeId || '', n.parentElement?.querySelector('p')?.textContent || 'Значение',Boolean(n.closest('[data-name="Что делали вместе"]'))); }
      for (const n of el.querySelectorAll<HTMLElement>('[data-name*="Composer"]')) { const p = n.querySelector<HTMLElement>('p'); if (p) makeInput(p, 'composer', 'Сообщение', true); n.classList.add('prototype-composer'); }
      syncComposer(el);
      if (route === HOME) makeInput(find(el, '464:2035'), 'search', 'Поиск участников', false, true);
      for(const field of el.querySelectorAll<HTMLElement>('[data-name*="/Field/"]')){if(field.querySelector('input,textarea'))continue;const ps=field.querySelectorAll<HTMLElement>('p');if(ps.length>1)makeInput(ps[ps.length-1],field.dataset.nodeId||'',ps[0].textContent||'Значение',field.dataset.name?.includes('Multiline'));}
      prepareChoices(el,route,stateRef.current.choices[route]);preparePickers(el);
      for (const p of el.querySelectorAll('p')) if (/Принимаю правила|Согласен на обработку|Согласен на обработку|Согласен на публикацию/.test(p.textContent || '')) { const n = p.parentElement!; n.dataset.consent = /Принимаю/.test(p.textContent||'')?'rules':/публикацию/.test(p.textContent||'')?'publication':'privacy'; n.tabIndex = 0; n.setAttribute('role', 'checkbox'); n.setAttribute('aria-checked', String(Boolean(stateRef.current.consents[n.dataset.consent]))); }
      if(route===HOME)syncHomeFilters(el,stateRef.current.filter);
      refreshPeople(el,route,stateRef.current);
      showRequestRecords(el,route,stateRef.current.requests,stateRef.current.selectedRequest);
      prepareRequestCards(el,route);showSelectedRequest(el,route,stateRef.current.selectedRequest);
      if(['503:2497','503:2728','503:2842'].includes(route))prepareRequestTabs(el,route);
      syncConsentButton(el,route,stateRef.current.consents);
      if(route==='488:2076'){const value=find(el,'488:2113');makeInput(value,'custom-amount','Другая сумма');const input=el.querySelector<HTMLInputElement>('[data-field="custom-amount"]');if(input){input.dataset.amount='true';input.inputMode='numeric';input.value='';}syncAmount(el,stateRef.current.amount);}
    }
    if (!frame && foreignProfiles.has(route)) {
      if (!stateRef.current.relationship[personId()] && ['726:5802','726:5915'].includes(route)) dispatch({type: route === '726:5915' ? 'accept' : 'request', person: personId()});
      const rel = stateRef.current.relationship[personId()];
      for (const p of el.querySelectorAll('p')) if (['Познакомиться', 'Написать', 'Запрос отправлен'].includes(p.textContent?.trim() || '')) { p.textContent = rel === 'accepted' ? 'Написать' : rel === 'pending' ? 'Запрос отправлен' : 'Познакомиться';if(rel==='pending')p.style.fontSize='12px'; }
      const actions=el.querySelector('[data-name="Действия профиля"]');if(actions&&rel==='accepted'&&![...el.querySelectorAll('p')].some(p=>p.textContent?.startsWith('Вы знакомы'))){const status=document.createElement('p');status.className='local-status';status.textContent='Вы знакомы · открыт Telegram';actions.before(status);}
      if(stateRef.current.person&&stateRef.current.person.id!=='alexander')applyParticipant(el,route,stateRef.current.person);
    }
    if(!frame&&route==='504:2892'){prepareDealList(el,stateRef.current.createdDeals,stateRef.current.demoDealOverrides);syncDeals(el,stateRef.current.choices['deal-filter']||'Активные',stateRef.current.deal?.status,stateRef.current.demoDealOverrides);}
    if(!frame&&(ownProfiles.has(route)||foreignProfiles.has(route)))prepareProfile(el,ownProfiles.has(route)||!stateRef.current.person||stateRef.current.person.id==='alexander',participants[stateRef.current.person?.name||'']?.bio||stateRef.current.person?.role);
    if(!frame&&['464:1674','464:1714','464:1784','464:1844','464:1965'].includes(route))prepareOnboarding(el,route,stateRef.current.fields);
    if(!frame&&route==='500:2604'){let draft:OwnProfile|null=null;try{draft=JSON.parse(stateRef.current.fields['profile-draft']||'null');}catch{/* Ignore a damaged draft. */}prepareProfileEditor(el,draft||stateRef.current.profile);el.dataset.profileBaseline=JSON.stringify(readProfileEditor(el,stateRef.current.profile));el.dataset.dirty=String(Boolean(draft));}
    if(!frame&&(ownProfiles.has(route)||foreignProfiles.has(route)&&(!stateRef.current.person||stateRef.current.person.id==='alexander'))&&stateRef.current.profile)applyOwnProfile(el,stateRef.current.profile,!ownProfiles.has(route));
    if(!frame&&foreignProfiles.has(route)&&stateRef.current.choices['profile-preview']==='own'&&!stateRef.current.person){const b=document.createElement('button');b.className='profile-return';b.dataset.returnOwn='true';b.textContent='Вернуться в мой профиль';el.querySelector('[data-name="Profile / Scroll content"]')?.prepend(b);}
    if(!frame&&route==='504:2951'&&stateRef.current.choices['deal-edit']==='true'&&stateRef.current.deal){const d=stateRef.current.deal;const values=[d.member,d.title,d.result,d.cost,d.deadline];el.querySelectorAll<HTMLInputElement>('.prototype-input').forEach((n,i)=>n.value=values[i]||'');}
    if(!frame)prepareFunding(el,route,stateRef.current);
    if(!frame)prepareSettings(el,route,stateRef.current.fields,stateRef.current.choices,(stateRef.current.profile?.showScale??'true')==='true');
    if(!frame&&route==='457:5992')prepareSupportExplanation(el);
    if(!frame&&stateRef.current.person&&route.startsWith('487:'))applyParticipant(el,'457:5863',stateRef.current.person);
    if(!frame&&stateRef.current.person&&route.startsWith('487:')){const p=stateRef.current.person;const name=p.name;const accusative=name==='Мария Волкова'?'Марию Волкову':name==='Андрей Белов'?'Андрея Белова':name;const instrumental=name==='Мария Волкова'?'Марией Волковой':name==='Андрей Белов'?'Андреем Беловым':name;for(const text of el.querySelectorAll('p'))if(text.textContent?.includes('Александр'))text.textContent=text.textContent.replaceAll('С Александром Репиным','С '+instrumental).replaceAll('Александра Репина',accusative).replaceAll('Александр Репин',name).replaceAll('Александр принял',name.split(' ')[0]+' принял');}
    if(!frame&&route.startsWith('504:')&&stateRef.current.deal){const deal=stateRef.current.deal;if(route!=='504:2892')for(const p of el.querySelectorAll('p')){const t=normalized(p.textContent||'');if(t==='Запуск отдела продаж')p.textContent=deal.title;if(t.startsWith('Мария Волкова')&&deal.member)p.textContent=t.replace('Мария Волкова',deal.member);if(t==='Воронка настроена, регламенты готовы, обучение проведено'&&deal.deliveredResult)p.textContent=deal.deliveredResult;if(t.includes('Воронка, регламенты')&&t.includes('обучение'))p.textContent=deal.result;if(t.includes('60 000 ₽'))p.textContent=t.replace('60 000 ₽',deal.cost||'60 000 ₽').replace(/до\s*20 ноября/,deal.deadline?'до '+deal.deadline:'Срок не указан');}}
    if (route === '504:3133' && stateRef.current.messages.length) { const list = document.createElement('div'); list.className = 'prototype-messages'; for (const msg of stateRef.current.messages.filter(m=>m.dealId===(stateRef.current.deal?.id||'demo-sales'))) { const p = document.createElement('p'); p.textContent = msg.text; list.append(p); } (el.querySelector('[data-name*="Содержание"]') || el.firstElementChild)?.appendChild(list); }
    if(!frame&&profileView.current){
      const saved=profileView.current;const scroll=el.querySelector<HTMLElement>('[data-name="Profile / Scroll content"]');const content=el.querySelector<HTMLElement>('[data-name="Вкладки профиля"]')?.nextElementSibling as HTMLElement|null;
      if(saved.expanded){const toggle=el.querySelector<HTMLElement>('[data-profile-toggle]');if(toggle)toggleProfileDetails(toggle);}
      const videos=el.querySelector<HTMLElement>('[data-name="Видео · прокрутка"]');if(videos)videos.scrollLeft=saved.video;
      if(scroll&&content){const top=content.getBoundingClientRect().top-scroll.getBoundingClientRect().top+scroll.scrollTop;content.style.minHeight=Math.max(0,saved.scroll+scroll.clientHeight-top-24)+'px';scroll.scrollTop=saved.scroll;}
      if(content&&!matchMedia('(prefers-reduced-motion: reduce)').matches)content.animate([{opacity:.5},{opacity:1}],{duration:160,easing:'ease-out'});
      profileView.current=null;motion.current='none';
    }
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
    if(route==='500:2604'&&handleProfileEditor(target)){const draft=JSON.stringify(readProfileEditor(root,stateRef.current.profile));root.dataset.dirty=String(draft!==root.dataset.profileBaseline);storeInput({type:'field',id:'profile-draft',value:root.dataset.dirty==='true'?draft:''});return;}
    if(target.closest('[data-return-own]')){dispatch({type:'person',person:null});dispatch({type:'choice',screen:'profile-preview',value:''});go('563:4968');return;}
    if(toggleProfileDetails(target)||toggleMoreExpertise(root,target))return;
    if(target.closest('[data-back]')||normalized(target.textContent||'')==='Назад'){go('BACK');return;}
    if(route==='457:5992'&&(target.closest('[data-name="Понятно"]')||target.closest('[data-name^="Затемнение"]'))){go(navigation.current.index>0?'BACK':profileRoute('Компании',stateRef.current.relationship[personId()]));return;}
    const dealFilter=target.closest<HTMLElement>('[data-deal-filter]');if(route==='504:2892'&&dealFilter){const next=dispatch({type:'choice',screen:'deal-filter',value:dealFilter.dataset.dealFilter});syncDeals(root,next.choices['deal-filter'],next.deal?.status,next.demoDealOverrides);return;}
    const onboardingTag=target.closest<HTMLElement>('[data-onboarding-tag]');if(onboardingTag){onboardingTag.setAttribute('aria-pressed',String(onboardingTag.getAttribute('aria-pressed')!=='true'));const values=[...root.querySelectorAll<HTMLElement>('[data-onboarding-tag][aria-pressed=true]')].map(n=>n.dataset.onboardingTag).join('|');storeInput({type:'field',id:'onboarding-competencies',value:values});return;}
    const accessPerson=target.closest<HTMLElement>('[data-access-person]');if(accessPerson){dispatch({type:'choice',screen:'access-person',value:accessPerson.dataset.accessPerson});go('505:3821');return;}
    const unblock=target.closest<HTMLElement>('[data-unblock]');if(unblock){dispatch({type:'field',id:'blocked-people',value:JSON.stringify(blockedNames(stateRef.current.fields).filter(n=>n!==unblock.dataset.unblock))});unblock.parentElement?.remove();return;}
    const picker=target.closest<HTMLElement>('[data-picker]');if(picker){dispatch({type:'choice',screen:'picker-origin',value:JSON.stringify({route,field:picker.dataset.pickerField,label:picker.getAttribute('aria-label')?.replace('Выбрать: ','')})});go(picker.dataset.picker!);return;}
    const consent = target.closest<HTMLElement>('[data-consent]'); if (consent) { const next = dispatch({ type: 'consent', id: consent.dataset.consent }); consent.setAttribute('aria-checked', String(next.consents[consent.dataset.consent!])); consent.classList.toggle('prototype-checked', next.consents[consent.dataset.consent!]);syncConsentButton(root,route,next.consents); return; }
    const requestTab=target.closest<HTMLElement>('[data-request-tab]');if(requestTab){go(requestTab.dataset.requestTab!);return;}
    const choice = target.closest<HTMLElement>('[data-choice]'); if (choice) {let values=[choice.dataset.choice!];if(choice.dataset.multiChoice==='true'){values=[...root.querySelectorAll<HTMLElement>('[data-choice][aria-checked=true]')].map(n=>n.dataset.choice!);values=values.includes(choice.dataset.choice!)?values.filter(v=>v!==choice.dataset.choice):values.length<5?[...values,choice.dataset.choice!]:values;}dispatch({ type: 'choice', screen: route, value: values.join('|') }); root.querySelectorAll<HTMLElement>('[data-choice]').forEach(n => n.setAttribute('aria-checked', String(values.includes(n.dataset.choice!)))); return; }
    const ancestors: HTMLElement[] = []; for (let n: HTMLElement | null = target; n && n !== root; n = n.parentElement) ancestors.push(n);
    const clickable=ancestors.find(n=>n.matches('a,button,[role="button"]'));
    const label = normalized(ancestors.find(n => n.tagName === 'P')?.textContent || clickable?.querySelector('p')?.textContent || clickable?.textContent || target.textContent || '');
    const name = ancestors.map(n => n.dataset.name || '').join(' / ');
    if (ancestors.some(n=>/bookmark/.test(n.dataset.name||'')||n.dataset.name==='Сохранить') && label !== 'Сохранить') { const card = ancestors.find(isPersonNode); const profile=card?personFromCard(card):stateRef.current.person||{id:'alexander',name:'Александр Репин',role:'Основатель · ТВОЙ СТИЛЬ',photo:localPhoto([...root.querySelectorAll<HTMLImageElement>('img')].find(i=>i.getBoundingClientRect().width>=75&&i.getBoundingClientRect().width<=85)?.src||'')}; const id=profile.id;const next = dispatch({ type: 'save', person:id,profile });const icon=ancestors.find(n=>/bookmark|Сохранить/.test(n.dataset.name||''));if(icon)icon.dataset.saved=String(next.saved.includes(id)); say(next.saved.includes(id) ? 'Участник сохранён' : 'Участник убран из сохранённых'); return; }
    const amountChoice=target.closest<HTMLElement>('[data-amount-choice]');if(amountChoice){const next=dispatch({type:'amount',value:Number(amountChoice.dataset.amountChoice)});syncAmount(root,next.amount);return;}
    if (route === '464:1714' && label === 'Продолжить') { if (!consentReady(stateRef.current)) { say('Примите правила и согласие на обработку данных'); return; } go('464:1784'); return; }
    if(route==='464:1844'&&label==='Отправить анкету'&&!stateRef.current.consents.publication){say('Подтвердите согласие на публикацию профиля');return;}
    if (target.closest('[data-name="Вкладки профиля"]')&&foreignProfiles.has(route) && ['Компании', 'Запросы', 'Экспертизы'].includes(label)) { go(profileRoute(label, stateRef.current.relationship[personId()])); return; }
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

    if(/Скопировать/.test(label)){if(route==='505:4084'&&stateRef.current.fields['invite-revoked']==='true'){say('Приглашение уже отозвано');return;}void navigator.clipboard.writeText(location.origin+location.pathname+'?screen=464%3A1674&invite=demo').then(()=>say('Ссылка на прототип скопирована')).catch(()=>say('Не удалось скопировать ссылку'));return;}
    const sampleRequest=target.closest<HTMLElement>('[data-sample-request]');if(sampleRequest){const id=sampleRequest.dataset.sampleRequest!;if(route==='503:2842'){const ownId='own-'+id;if(!stateRef.current.requests.some(r=>r.id===ownId))dispatch({type:'publish',...demoRequests[id],id:ownId});dispatch({type:'selectRequest',id:ownId});}else dispatch({type:'selectRequest',id});go('503:2556');return;}
    if(route==='503:2556'&&label==='Профиль автора'){const record=stateRef.current.requests.find(r=>r.id===stateRef.current.selectedRequest);if(record){go('563:4968');return;}const request=demoRequests[stateRef.current.selectedRequest||'sample-sales'];dispatch({type:'person',person:personForName(request?.author||'Алексей Смирнов')});go('457:5863');return;}
    const incoming=target.closest<HTMLElement>('[data-incoming-reply]');if(incoming){dispatch({type:'person',person:personForName('Мария Волкова')});go('503:2782');return;}
    if(label==='Андрей хочет познакомиться'){dispatch({type:'person',person:personForName('Андрей Белов')});go('487:2068');return;}
    const localRequest=target.closest<HTMLElement>('[data-request]');if(localRequest){dispatch({type:'selectRequest',id:localRequest.dataset.request});go('503:2556');return;}
    if(route==='503:2556'&&label==='Изменить запрос'&&stateRef.current.selectedRequest){go('503:2896');return;}
    if(route==='503:2653'&&label==='Отправить'){const text=root.querySelector<HTMLTextAreaElement>('textarea')?.value.trim();if(!text){say('Напишите, чем можете помочь');return;}dispatch({type:'field',id:'last-response',value:text});}
    if(route==='503:2782'&&label==='Отказать'){dispatch({type:'field',id:'incoming-response-status',value:'declined'});go('503:3027');return;}
    if(route==='503:2896'&&label==='Закрыть запрос'){go('503:2945');return;}
    const demoDeal=target.closest<HTMLElement>('[data-demo-deal]');if(demoDeal){const selected=dispatch({type:'selectDeal',value:demoDeals[demoDeal.dataset.demoDeal!]});go(({Работа:'504:3088',Проверка:'504:3212',Завершена:'504:3284',Отменена:'504:3527'} as Record<string,string>)[selected.deal?.status||'Проверка']||'504:3003');return;}
    const localDeal=target.closest<HTMLElement>('[data-deal]');if(localDeal){const record=stateRef.current.createdDeals.find(d=>d.id===localDeal.dataset.deal);if(record)dispatch({type:'selectDeal',value:record});go(({Согласование:'504:3003',Работа:'504:3088',Проверка:'504:3212',Завершена:'504:3284',Отменена:'504:3527'} as Record<string,string>)[stateRef.current.deal?.status||'Согласование']||'504:3003');return;}
    const card = ancestors.find(isPersonNode);
    if (card && !ownProfiles.has(route)) { dispatch({type:'choice',screen:'profile-preview',value:''}); if(route==='504:3625'){root.querySelectorAll('.prototype-checked').forEach(n=>n.classList.remove('prototype-checked'));dispatch({type:'choice',screen:route,value:personFromCard(card).name});card.classList.add('prototype-checked');return;}dispatch({ type: 'person', person:personFromCard(card) }); go('457:5863'); return; }
    if (route.startsWith('489:') && /Отправить/.test(name)) { const input=root.querySelector<HTMLTextAreaElement>('[data-composer]');if(!input?.value.trim())return;go('506:4521');return; }
    if (route === '504:3133' && /Отправить/.test(name)) { const input = root.querySelector<HTMLTextAreaElement>('[data-composer]'); if (input?.value.trim()) { dispatch({ type: 'message', id: crypto.randomUUID(), text: input.value,dealId:stateRef.current.deal?.id||'demo-sales' });appendMessage(root,input.value);storeInput({type:'field',id:input.dataset.field!,value:''}); input.value = '';syncComposer(root); } return; }
    const actions = behaviors.get(route) || [];
    const action = ancestors.map(n => actions.find(a => a.id === n.dataset.nodeId && a.event !== 'AFTER_TIMEOUT')).find(Boolean);
    let to = action?.to || captions[label];
    if(route==='489:2295'&&to==='457:5863')dispatch({type:'person',person:personForName('Мария Волкова')});
    if(route.startsWith('504:')&&to==='487:1972'&&stateRef.current.deal?.member)dispatch({type:'person',person:personForName(stateRef.current.deal.member)});
    if(ownProfiles.has(route)&&label==='Как видят другие'){dispatch({type:'person',person:null});dispatch({type:'choice',screen:'profile-preview',value:'own'});}
    if(route==='500:2604'&&label==='СОХРАНИТЬ'){const profile=readProfileEditor(root,stateRef.current.profile);if(!profile.name||!profile.city){say('Добавьте имя и город');return;}dispatch({type:'profile',value:profile,replace:true});storeInput({type:'field',id:'profile-draft',value:''});root.dataset.dirty='false';}
    if(route==='505:4358'&&label==='Выйти без сохранения'){storeInput({type:'field',id:'profile-draft',value:''});go('563:4968');return;}
    if(route==='505:4358'&&label==='Сохранить и выйти'){let draft:OwnProfile|null=null;try{draft=JSON.parse(stateRef.current.fields['profile-draft']||'null');}catch{}if(!draft?.name||!draft?.city){go('500:2604');return;}dispatch({type:'profile',value:draft,replace:true});storeInput({type:'field',id:'profile-draft',value:''});go('563:4968');return;}
    if(label==='Применить'&&stateRef.current.choices['picker-origin']){let origin:{route:string;field:string;label?:string}|null=null;try{origin=JSON.parse(stateRef.current.choices['picker-origin']);}catch{}const value=stateRef.current.choices[route]||root.querySelector<HTMLElement>('[data-choice][aria-checked=true]')?.dataset.choice;if(origin&&value){dispatch({type:'field',id:origin.field,value});if(origin.route==='464:1784'&&origin.label==='Город')dispatch({type:'field',id:'onboarding-city',value});dispatch({type:'choice',screen:'picker-origin',value:''});go(origin.route);return;}}
    if(route==='505:3821'&&label==='Сохранить'){const name=stateRef.current.choices['access-person']||'Мария Волкова';const access=accessFor(stateRef.current.fields,name);for(const input of root.querySelectorAll<HTMLSelectElement>('[data-permission]'))access[input.dataset.permission!]=input.value==='true';dispatch({type:'field',id:'access:'+name,value:JSON.stringify(access)});}
    if(route==='505:3869'&&label==='Отозвать доступ'){const name=stateRef.current.choices['access-person']||'Мария Волкова';dispatch({type:'field',id:'access:'+name,value:JSON.stringify({telegram:false,email:false,phone:false})});}
    if(route==='505:3982'&&label==='Заблокировать'){const names=blockedNames(stateRef.current.fields);const name=stateRef.current.person?.name||'Илья Соколов';dispatch({type:'field',id:'blocked-people',value:JSON.stringify([...new Set([...names,name])])});}
    if(route==='505:4084'&&label==='Отозвать приглашение')dispatch({type:'field',id:'invite-revoked',value:'true'});
    if(route==='505:4047'&&label==='Создать приглашение'){const username=root.querySelector<HTMLInputElement>('.prototype-input')?.value.trim();if(!username||username==='@username'||/\s/.test(username)){say('Укажите Telegram участника');return;}dispatch({type:'field',id:'invite-username',value:username.startsWith('@')?username:'@'+username});dispatch({type:'field',id:'invite-revoked',value:'false'});}
    if(['505:3942','505:4156'].includes(route)&&label==='Отправить'){const fields=[...root.querySelectorAll<HTMLInputElement|HTMLTextAreaElement>('.prototype-input')];if(fields.some(n=>!n.value.trim())){say('Заполните обращение');return;}}
    if(route==='505:4231'&&label==='Удалить профиль'){const value=root.querySelector<HTMLInputElement>('.prototype-input')?.value.trim();if(value!=='УДАЛИТЬ'){say('Введите УДАЛИТЬ для подтверждения');return;}if([...Object.values(demoDeals).map(d=>({...d,...stateRef.current.demoDealOverrides[d.id]})),...stateRef.current.createdDeals].some(d=>!['Завершена','Отменена'].includes(d.status))){go('506:4462');return;}dispatch({type:'choice',screen:'demo-profile-deleted',value:'true'});}
    if(label==='Отметить всё прочитанным'){dispatch({type:'field',id:'read-all',value:'true'});say('Уведомления отмечены прочитанными');return;}
    if(route==='505:3550'&&label==='Показать людей'){const criteria:Record<string,string>={};for(const input of root.querySelectorAll<HTMLInputElement>('.prototype-input'))criteria[input.getAttribute('aria-label')||'']=input.value;dispatch({type:'criteria',value:criteria});}
    if(route==='464:1784'&&label==='Далее'){const inputs=[...root.querySelectorAll<HTMLInputElement>('input.prototype-input')];if(inputs.some(i=>!i.value.trim())){say('Добавьте имя и город');return;}dispatch({type:'field',id:'onboarding-name',value:inputs[0]?.value||''});dispatch({type:'field',id:'onboarding-city',value:inputs[1]?.value||''});}
    if(route==='464:1844'&&label==='Отправить анкету'){dispatch({type:'profile',value:{...defaultProfile,summary:root.querySelector<HTMLInputElement>('.prototype-input')?.value||'',fresh:'true',about:'',companyName:'',companyDescription:'',role:'',experience:'',serviceName:'',serviceResult:'',task:'',team:'Не указано',turnover:'Не указано',showScale:'false',name:stateRef.current.fields['onboarding-name']||defaultProfile.name,city:stateRef.current.fields['onboarding-city']||defaultProfile.city,industry:root.querySelector<HTMLInputElement>('.prototype-input')?.value||defaultProfile.industry,competencies:stateRef.current.fields['onboarding-competencies']||'Управление|Команды'}});}
    if (route === '487:2037' && label === 'Отправить запрос') dispatch({ type: 'request', person: personId() });
    if (route === '487:2068' && label === 'Принять запрос') dispatch({ type: 'accept', person: personId() });
    if (route === '487:2068' && label === 'Отказать') { dispatch({ type: 'decline', person: personId() }); to = '506:4430'; }
    if (route === '487:1972' && label === 'На проверку') dispatch({ type: 'recommend', person: personId() });
    if(route==='488:2076'&&label==='Перейти к оплате'){if(!(stateRef.current.amount>0)){say('Введите сумму больше нуля');return;}dispatch({type:'startPayment',id:crypto.randomUUID()});}
    if (route === '488:2308' && label === 'Проверить статус') {if(!stateRef.current.payment)dispatch({type:'startPayment',id:crypto.randomUUID()});dispatch({ type: 'donate' });if(stateRef.current.profile?.fresh==='true')dispatch({type:'profile',value:{supportTier:'Поддержал'}});}
    if(route==='504:3003'&&label==='Изменить условия'){dispatch({type:'choice',screen:'deal-edit',value:'true'});go('504:2951');return;}
    if(route==='504:3003'&&label==='Отменить предложение'){go('504:3321');return;}
    if(route==='504:3449'&&label==='Принять изменения')dispatch({type:'deal',value:{deadline:'27 ноября'}});
    if(route==='504:2951'&&label==='На согласование'){const inputs=[...root.querySelectorAll<HTMLInputElement|HTMLTextAreaElement>('.prototype-input')];if(inputs.some(i=>!i.value.trim())){say('Заполните условия сделки');return;}dispatch({type:stateRef.current.choices['deal-edit']==='true'?'deal':'createDeal',value:{id:stateRef.current.choices['deal-edit']==='true'?stateRef.current.deal?.id:crypto.randomUUID(),member:inputs[0]?.value,title:inputs[1]?.value,result:inputs[2]?.value,cost:inputs[3]?.value,deadline:inputs[4]?.value,status:'Согласование'}});dispatch({type:'choice',screen:'deal-edit',value:''});}
    if(route==='504:3174'&&label==='На подтверждение'){const text=root.querySelector<HTMLTextAreaElement>('textarea')?.value.trim();if(!text){say('Опишите выполненную работу');return;}dispatch({type:'deal',value:{deliveredResult:text}});}
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

  if (catalog) return <main className="screen-catalog"><h1>Экраны прототипа</h1><p>{Object.keys(registry).length} экранов перенесены из Figma.</p><input aria-label="Найти экран" placeholder="Найти экран" value={catalogQuery} onChange={e => setCatalogQuery(e.target.value)}/><div>{manifest.screens.filter(s => s.name.toLowerCase().includes(catalogQuery.toLowerCase())).map(s => <a key={s.id} href={`?screen=${encodeURIComponent(s.id)}`}><span>{s.name}</span>{!registry[s.id] && <small>Нужно сравнить</small>}</a>)}</div></main>;
  return <div className={frame ? 'prototype-shell framed' : 'prototype-shell'}><div key={route} ref={stage} className="design-stage" data-screen={route} data-loaded={loaded} onClick={e => { if ((e.target as HTMLElement).closest('input,textarea,select')) return; e.preventDefault(); activate(e.target as HTMLElement); }} onKeyDown={e => { const target = e.target as HTMLElement; if (e.key === 'Enter' && target.matches('[data-query]')) { go('505:3464'); return; } if ((e.key === 'Enter' || e.key === ' ') && !target.matches('input,textarea,select')) { e.preventDefault(); activate(target); } }} onInput={e => { const t = e.target as HTMLInputElement; if(t.dataset.privacyScale){dispatch({type:'profile',value:{showScale:String(t.value==='Видны участникам')}});return;}if(route==='500:2604'&&t.matches('[data-profile-value],[data-custom-tag],input[type=file]')&&stage.current){const draft=JSON.stringify(readProfileEditor(stage.current,stateRef.current.profile));stage.current.dataset.dirty=String(draft!==stage.current.dataset.profileBaseline);storeInput({type:'field',id:'profile-draft',value:stage.current.dataset.dirty==='true'?draft:''});return;}if(t.dataset.amount){const n=Number(t.value.replace(/\s/g,''));const next=storeInput({type:'amount',value:Number.isFinite(n)&&n>0?n:0});if(stage.current)syncAmount(stage.current,next.amount);return;}if(route==='464:1784'&&t.dataset.field)storeInput({type:'field',id:/Имя/.test(t.getAttribute('aria-label')||'')?'onboarding-name':'onboarding-city',value:t.value});if (t.dataset.field) {storeInput(t.dataset.query ? { type: 'query', value: t.value } : { type: 'field', id: t.dataset.field, value: t.value });if(t.dataset.composer&&stage.current)syncComposer(stage.current);} }}><Suspense fallback={<div className="loading-placeholder" aria-label="Загрузка экрана"/>}>{Component ? <Component/> : <StateView id={route} go={go}/>}</Suspense></div>{notice && <div className="prototype-toast" role="status">{notice}<button aria-label="Закрыть уведомление" onClick={() => setNotice('')}>×</button></div>}</div>;
}
