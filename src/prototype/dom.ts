export type Person = { id: string; name: string; photo: string; role: string };
export const localPhoto=(src:string)=>src.includes('/assets/')?'assets/'+src.split('/assets/').pop():src;
export const photoUrl=(src:string)=>localPhoto(src).startsWith('assets/')?import.meta.env.BASE_URL+localPhoto(src):src;
export function syncComposer(root:HTMLElement){
 for(const composer of root.querySelectorAll<HTMLElement>('[data-name*="Composer"]')){
  const input=composer.querySelector<HTMLTextAreaElement>('[data-field="composer"]');
  const send=composer.querySelector<HTMLElement>('[data-name="Отправить"]');
  if(send){send.setAttribute('role','button');send.setAttribute('aria-label','Отправить сообщение');send.setAttribute('aria-disabled',String(!input?.value.trim()));send.tabIndex=0;}
 }
}
export function isPersonNode(n: HTMLElement) { return ['Андрей Белов','Мария Волкова','Александр Репин'].includes(n.dataset.name || '') || /\/Person\//.test(n.dataset.name || ''); }
export function personFromCard(n: HTMLElement): Person {
 const copy = n.querySelector('[data-name="Имя и деятельность"]') || n;
 const paragraphs = copy.querySelectorAll('p'); const name = paragraphs[0]?.textContent?.trim() || n.dataset.name || 'Участник';
 return { id: name === 'Александр Репин' ? 'alexander' : name, name, photo: localPhoto(n.querySelector('img')?.src || ''), role: paragraphs[1]?.textContent?.trim() || '' };
}
export function people(root: HTMLElement) { return [...root.querySelectorAll<HTMLElement>('[data-name]')].filter(isPersonNode); }
export function refreshPeople(root: HTMLElement, route: string, state: { saved: string[]; savedPeople: Record<string, Person>; query: string; filter: string; relationship: Record<string,string>; criteria: Record<string,string> }) {
 let cards = people(root);
 if (route === '505:3352' && cards.length) {
  const template = cards[0], container = template.parentElement!; cards.forEach(n => n.style.display = 'none');
  for (const id of state.saved) {
   const person = state.savedPeople[id]; if (!person) continue;
   const card = template.cloneNode(true) as HTMLElement; card.style.display = ''; card.dataset.name = person.name; card.dataset.nodeId = 'saved-'+id;
   const labels = card.querySelector('[data-name="Имя и деятельность"]')?.querySelectorAll('p'); if (labels?.[0]) labels[0].textContent = person.name; if (labels?.[1]) labels[1].textContent = person.role;
   const img = card.querySelector('img'); if (img && person.photo) img.src = photoUrl(person.photo);
   container.appendChild(card);
  }
  cards = people(root).filter(n => n.style.display !== 'none');
 }
 let visible = 0;
 for (const card of cards) {
  const person = personFromCard(card); card.tabIndex = 0; card.setAttribute('role','button'); card.setAttribute('aria-label','Открыть профиль: '+person.name);
  let show = true;
  if (route === '505:3464' && state.query) show = (card.textContent || '').toLowerCase().includes(state.query.toLowerCase());
  if (route === '505:3464' && state.criteria['Компетенции']) show &&= (card.textContent || '').toLowerCase().includes(state.criteria['Компетенции'].toLowerCase());
  if(route==='505:3464')for(const [key,value]of Object.entries(state.criteria)){const v=normalizedText(value).toLowerCase();if(!v||/^люб/.test(v))continue;if(key==='Город')show&&=v==='москва';if(key==='Формат работы')show&&=v==='онлайн';if(key==='Доступность')show&&=v==='готов к обращениям';if(key==='Индустрия')show&&=(card.textContent||'').toLowerCase().includes(v);}
  if (route === '464:2016' && state.filter === 'Мои') show = state.relationship[person.id] === 'accepted';
  if (route === '464:2016' && state.filter === 'Новые') show = person.name === 'Мария Волкова';
  if (route !== '505:3352') card.style.display = show ? '' : 'none';
  if (show) visible++;
  for (const n of card.querySelectorAll<HTMLElement>('[data-name*="bookmark"]')) { n.dataset.saved = String(state.saved.includes(person.id)); n.setAttribute('role','button'); n.tabIndex=0; n.setAttribute('aria-label',state.saved.includes(person.id)?'Убрать из сохранённых':'Сохранить участника'); }
 }
 root.querySelector('.local-empty')?.remove();
 if (cards.length && !visible && ['464:2016','505:3464'].includes(route)) { const message=document.createElement('p'); message.className='local-empty';message.textContent='Никого не нашли. Попробуйте другой запрос или фильтр';cards[0].parentElement?.append(message); }
}
export function appendMessage(root: HTMLElement, text: string) {
 let list=root.querySelector('.prototype-messages');if(!list){list=document.createElement('div');list.className='prototype-messages';(root.querySelector('[data-name*="Контент"]')||root.firstElementChild)?.append(list);}
 const p=document.createElement('p');p.textContent=text;list.append(p);p.scrollIntoView({block:'nearest'});
}
export function showRequestRecords(root: HTMLElement, route: string, requests: {id:string;title:string;description:string;closed?:boolean}[], selected: string|null) {
 const record=requests.find(r=>r.id===selected);
 if (record && ['503:2556','503:2896'].includes(route)) for (const p of root.querySelectorAll('p')) { if (normalizedText(p.textContent).startsWith('Нужен руководитель продаж')) p.textContent=record.title; if (normalizedText(p.textContent).includes('Запустить отдел продаж')) p.textContent=record.description; }
 if(record&&route==='503:2556')for(const p of root.querySelectorAll('p'))if(normalizedText(p.textContent)==='Откликнуться')p.textContent='Изменить запрос';
 if (!['503:2842','503:2497'].includes(route)) return;
 const container=root.querySelector('[data-name^="Содержание"] [data-name="Контент"]')||root.querySelector('[data-name^="Содержание"]');if(!container)return;
 for(const r of requests){const button=document.createElement('button');button.className='local-request';button.dataset.request=r.id;const title=document.createElement('strong');title.textContent=r.title;const p=document.createElement('p');p.textContent=r.description;button.append(title,p);if(r.closed){const status=document.createElement('small');status.textContent='Закрыт';button.append(status);}container.append(button);}
}
const normalizedText=(text:string|null)=>text?.replace(/\s+/g,' ').trim()||'';
export function syncConsentButton(root:HTMLElement,route:string,consents:Record<string,boolean>){
 const id=route==='464:1714'?'480:1817':route==='464:1844'?'480:1827':null;if(!id)return;
 const button=root.querySelector<HTMLElement>(`[data-node-id="${id}"]`);if(!button)return;
 const ready=route==='464:1714'?Boolean(consents.rules&&consents.privacy):Boolean(consents.publication);
 button.setAttribute('role','button');button.tabIndex=0;button.setAttribute('aria-disabled',String(!ready));button.classList.toggle('prototype-enabled',ready);
}
export function syncAmount(root:HTMLElement,amount:number){for(const n of root.querySelectorAll<HTMLElement>('[data-name="Суммы"]>div')){const value=Number((n.textContent||'').replace(/[^\d]/g,''));n.dataset.amountChoice=String(value);n.setAttribute('role','button');n.tabIndex=0;n.setAttribute('aria-pressed',String(value===amount));n.style.backgroundColor=value===amount?'#073c2c':'transparent';for(const p of n.querySelectorAll('p'))p.style.color=value===amount?'#20c38e':'#f1f5f3';}for(const p of root.querySelectorAll('p'))if(!p.children.length&&/^К оплате/.test(normalizedText(p.textContent)))p.textContent='К оплате '+new Intl.NumberFormat('ru-RU').format(amount)+' ₽';}
