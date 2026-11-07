import documentSource from './alexander-profile.json';
export type OwnProfile=Record<string,string>;
export const defaultProfile:OwnProfile={name:'Александр Репин',city:'Москва, Россия',summary:'Развиваю три направления бизнеса: натяжные потолки, комплексное развитие бизнеса и подбор персонала.',about:documentSource.find(s=>s.title==='О себе')!.paragraphs.join('\n\n'),companyName:'ТВОЙ СТИЛЬ',companyDescription:documentSource.find(s=>s.title==='Компании')!.paragraphs[2],industry:'Строительство',role:'Основатель и собственник',team:'225 в штате',turnover:'≈ 500 млн ₽ · 2025',experience:'Предприниматель с 2003 года. Основатель сообщества THE MISSION.',serviceName:'Предпринимательское мышление и обмен опытом',specialization:'Управление',serviceResult:'Обмен практическим опытом и разбор бизнес-задач',price:'Без оплаты',format:'Онлайн и офлайн',availability:'Готов к новым обращениям',task:'Единомышленники и совместные проекты',video:'',telegram:'',email:'',phone:'',reference:'',competencies:'Управление|Команды',interests:'ИИ|Путешествия|Спорт',looking:'Партнёры|Наставник',contact:'Чат приложения',showScale:'true'};
const fieldMap:Record<string,string>={'500:2626':'name','500:2630':'city','500:2636':'summary','500:2641':'video','500:2839':'companyName','500:2843':'industry','500:2849':'role','500:2853':'team','500:2859':'turnover','500:2718':'experience','500:2870':'serviceName','500:2874':'specialization','500:2880':'serviceResult','500:2884':'price','500:2890':'format','500:2896':'availability','500:2766':'task','500:2808':'telegram','500:2812':'email','500:2816':'phone','500:2820':'reference'};
const normalized=(s:string)=>s.replace(/\s+/g,' ').trim();
function extraField(label:string,key:string,value:string,multiline=false){
 const field=document.createElement('label');field.className='editor-field';const text=document.createElement('span');text.textContent=label;
 const input=document.createElement(multiline?'textarea':'input');input.dataset.profileValue=key;input.setAttribute('aria-label',label);input.value=value;field.append(text,input);return field;
}
function extraEntry(root:HTMLElement,button:HTMLElement,kind:string,index:number,profile:OwnProfile){
 const entry=document.createElement('section');entry.className='editor-extra';entry.dataset.extraEntry=kind+'-'+index;
 entry.append(extraField(kind==='company'?'Название дополнительной компании':'Название дополнительной услуги',`extra-${kind}-${index}-title`,profile[`extra-${kind}-${index}-title`]||''));
 entry.append(extraField('Описание',`extra-${kind}-${index}-description`,profile[`extra-${kind}-${index}-description`]||'',true));
 const remove=document.createElement('button');remove.type='button';remove.className='editor-about-remove';remove.textContent='Убрать';remove.dataset.removeExtra='true';entry.append(remove);button.before(entry);
}
export function prepareProfileEditor(root:HTMLElement,saved:OwnProfile|null){
 const profile={...defaultProfile,...saved};root.classList.add('full-profile-editor');
 for(const original of root.querySelectorAll<HTMLInputElement>('.prototype-input')){
  const key=fieldMap[original.dataset.field||''];if(!key)continue;
  const multiline=['summary','experience','serviceResult','task'].includes(key);
  let input:HTMLInputElement|HTMLTextAreaElement=original;
  if(multiline){input=document.createElement('textarea');input.className=original.className;input.setAttribute('style',original.getAttribute('style')||'');original.replaceWith(input);}
  input.dataset.profileValue=key;input.setAttribute('aria-label',normalized(original.getAttribute('aria-label')||key));input.value=profile[key]||'';
  input.style.width='100%';input.style.flex='1 1 auto';input.style.minWidth='0';input.style.lineHeight='21px';input.style.height=multiline?'90px':'24px';
  const field=input.closest<HTMLElement>('[data-name="Поле"]');if(field){field.replaceChildren(input);field.style.height='auto';field.style.minHeight=multiline?'112px':'52px';}
 }
 const short=root.querySelector('[data-name="Коротко о себе"]');short?.after(extraField('Подробнее о себе','about',profile.about,true));
 root.querySelector<HTMLInputElement>('[data-profile-value="companyName"]')?.closest('[data-name="Поле"]')?.parentElement?.after(extraField('Описание компании','companyDescription',profile.companyDescription,true));
 const groups=[['Компетенции · теги','competencies'],['Интересы · теги','interests'],['Кого ищу · теги','looking'],['Способ связи','contact']];
 for(const [name,key]of groups){
  const container=root.querySelector<HTMLElement>(`[data-name="${name}"]`);const group=container?.querySelector<HTMLElement>('[data-name="Теги"],[data-name="Способ связи · один вариант"]');if(!group)continue;
  const labels=[...group.children].map(n=>normalized(n.querySelector('p')?.textContent||'')).filter(Boolean);group.replaceChildren();group.className='editor-tagset';group.dataset.profileGroup=key;
  for(const label of new Set([...labels,...(profile[key]||'').split('|').filter(Boolean)])){const button=document.createElement('button');button.type='button';button.textContent=label;button.dataset.profileTag=label;button.setAttribute('aria-pressed',String((profile[key]||'').split('|').includes(label)));group.append(button);}
 }
 for(const [name,key]of [['Показывать масштаб бизнеса','showScale'],['Работаю самостоятельно','independent'],['Хочу получать запросы на услуги','services']]){
  const n=root.querySelector<HTMLElement>(`[data-name="${name}"]`);if(n){n.dataset.profileFlag=key;n.setAttribute('role','checkbox');n.setAttribute('aria-checked',String(profile[key]==='true'));n.tabIndex=0;}
 }
 const content=root.querySelector<HTMLElement>('[data-name="Контент"]')||root.querySelector<HTMLElement>('[data-name^="Содержание"]');
 const back=document.createElement('button');back.type='button';back.className='editor-back';back.dataset.back='true';back.textContent='Назад';content?.prepend(back);
 const save=root.querySelector<HTMLElement>('[data-name="Сохранить изменения профиля"]');if(save){save.style.position='absolute';save.style.left='24px';save.style.bottom='calc(16px + env(safe-area-inset-bottom,0px))';save.style.top='auto';save.style.width='calc(100% - 48px)';save.setAttribute('aria-label','Сохранить профиль');}
 const scroll=root.querySelector<HTMLElement>('[data-name^="Содержание"]');if(scroll){scroll.style.height='calc(100% - 108px - var(--safe-top))';scroll.style.maxHeight='none';scroll.style.paddingBottom='24px';}
 if(profile.photo)root.dataset.profilePhoto=profile.photo;
 for(const kind of ['company','service']){
  const buttons=[...root.querySelectorAll<HTMLElement>(`[data-name="${kind==='company'?'Добавить компанию':'Добавить услугу'}"]`)];const button=buttons.at(-1);if(!button)continue;
  for(const key of Object.keys(profile)){const match=key.match(new RegExp(`^extra-${kind}-(\\d+)-title$`));if(match)extraEntry(root,button,kind,Number(match[1]),profile);}
 }
 const photo=root.querySelector<HTMLElement>('[data-name="Фото"]');
 if(photo){
  const upload=document.createElement('input');upload.type='file';upload.accept='image/jpeg,image/png';upload.hidden=true;upload.setAttribute('aria-label','Загрузить фото профиля');photo.append(upload);photo.dataset.photoUpload='true';photo.setAttribute('role','button');photo.setAttribute('aria-label','Изменить фото');photo.tabIndex=0;
  const display=(src:string)=>{photo.style.backgroundImage=`url(${JSON.stringify(src)})`;photo.style.backgroundSize='cover';photo.style.backgroundPosition='center';for(const child of [...photo.children])if(child!==upload)(child as HTMLElement).style.visibility='hidden';};
  if(profile.photo)display(profile.photo);
  upload.addEventListener('change',async()=>{const file=upload.files?.[0];if(!file)return;if(!['image/jpeg','image/png'].includes(file.type)||file.size>5*1024*1024){upload.setCustomValidity('Выберите JPEG или PNG до 5 МБ');upload.reportValidity();return;}upload.setCustomValidity('');try{const bitmap=await createImageBitmap(file);const canvas=document.createElement('canvas');const size=Math.min(640,Math.min(bitmap.width,bitmap.height));canvas.width=size;canvas.height=size;const ctx=canvas.getContext('2d')!;const crop=Math.min(bitmap.width,bitmap.height);ctx.drawImage(bitmap,(bitmap.width-crop)/2,(bitmap.height-crop)/2,crop,crop,0,0,size,size);bitmap.close();const src=canvas.toDataURL('image/jpeg',.85);root.dataset.profilePhoto=src;display(src);root.dataset.dirty='true';upload.dispatchEvent(new Event('input',{bubbles:true}));}catch{upload.setCustomValidity('Не удалось открыть фото. Выберите другой JPEG или PNG');upload.reportValidity();}});
 }
}
export function handleProfileEditor(target:HTMLElement){
 const remove=target.closest('[data-remove-extra]');if(remove){remove.closest('[data-extra-entry]')?.remove();return true;}
 const add=target.closest<HTMLElement>('[data-name="Добавить компанию"],[data-name="Добавить услугу"]');
 if(add){const root=add.closest<HTMLElement>('.full-profile-editor')!;if(add.closest('[data-name="Видео о себе"]')){root.querySelector<HTMLInputElement>('[data-profile-value="video"]')?.focus();return true;}const kind=add.dataset.name==='Добавить компанию'?'company':'service';const index=Date.now();extraEntry(root,add,kind,index,{});root.querySelector<HTMLElement>(`[data-extra-entry="${kind}-${index}"]`)?.scrollIntoView({block:'center'});return true;}
 const photo=target.closest<HTMLElement>('[data-photo-upload]');if(photo&&target.tagName!=='INPUT'){photo.querySelector<HTMLInputElement>('input[type=file]')?.click();return true;}
 const tag=target.closest<HTMLElement>('[data-profile-tag]');
 if(tag){const group=tag.parentElement!;const selected=tag.getAttribute('aria-pressed')==='true';if(group.dataset.profileGroup==='contact')group.querySelectorAll('button').forEach(n=>n.setAttribute('aria-pressed','false'));else if(!selected&&group.querySelectorAll('[aria-pressed=true]').length>=5)return true;tag.setAttribute('aria-pressed',String(!selected));if(tag.dataset.profileTag==='Свой'&&!selected&&!group.querySelector('input')){const input=document.createElement('input');input.className='editor-custom';input.dataset.customTag='true';input.setAttribute('aria-label','Свой вариант');input.placeholder='Введите свой вариант';group.append(input);input.focus();}const count=[...group.parentElement!.parentElement!.querySelectorAll('p')].find(p=>p.textContent?.trim().startsWith('Выбрано'));if(count)count.textContent=`Выбрано ${group.querySelectorAll('[aria-pressed=true]').length} из 5`;return true;}
 const flag=target.closest<HTMLElement>('[data-profile-flag]');if(flag){flag.setAttribute('aria-checked',String(flag.getAttribute('aria-checked')!=='true'));return true;}
 return false;
}
export function readProfileEditor(root:HTMLElement,saved:OwnProfile|null){
 const profile={...defaultProfile,...saved};for(const key of Object.keys(profile))if(key.startsWith('extra-'))delete profile[key];
 for(const input of root.querySelectorAll<HTMLInputElement|HTMLTextAreaElement>('[data-profile-value]'))profile[input.dataset.profileValue!]=input.value.trim();
 for(const group of root.querySelectorAll<HTMLElement>('[data-profile-group]')){const values=[...group.querySelectorAll<HTMLElement>('[aria-pressed=true]')].map(n=>n.dataset.profileTag!).filter(s=>s!=='Свой');const custom=group.querySelector<HTMLInputElement>('[data-custom-tag]')?.value.trim();if(custom)values.push(custom);profile[group.dataset.profileGroup!]=values.join('|');}
 for(const flag of root.querySelectorAll<HTMLElement>('[data-profile-flag]'))profile[flag.dataset.profileFlag!]=flag.getAttribute('aria-checked')||'false';
 if(root.dataset.profilePhoto)profile.photo=root.dataset.profilePhoto;return profile;
}
export function applyOwnProfile(root:HTMLElement,saved:OwnProfile,publicView=false){
 const profile={...defaultProfile,...saved};
 for(const p of root.querySelectorAll<HTMLElement>('p')){
  const t=normalized(p.textContent||'');
  if(t==='Александр Репин')p.textContent=profile.name;
  if(t==='Москва, Россия')p.textContent=profile.city;
  if(t.startsWith('Основатель · ТВОЙ СТИЛЬ')){p.textContent=[profile.role,profile.companyName].filter(Boolean).join(' · ');p.style.lineHeight='20px';}
  if(t==='≈ 500 млн ₽ · 2025')p.textContent=profile.turnover;
  if(t==='225 в штате')p.textContent=profile.team;
 }
 const about=root.querySelector('.profile-biography');
 if(about){about.replaceChildren();for(const text of [profile.summary,...profile.about.split(/\n\s*\n|\n/)].filter(Boolean)){const p=document.createElement('p');p.textContent=text;about.append(p);}const b=document.createElement('button');b.className='profile-about-close';b.dataset.profileToggle='true';b.textContent='Свернуть';about.append(b);}
 if(profile.photo){const image=root.querySelector<HTMLImageElement>('[data-name="Аватар · Опора сообщества"] img');if(image)image.src=profile.photo;}
 const company=root.querySelector<HTMLElement>('[data-name="ТВОЙ СТИЛЬ"]');
 if(company){const paragraphs=company.querySelectorAll('p');for(const p of paragraphs){const t=normalized(p.textContent||'');if(t==='ТВОЙ СТИЛЬ')p.textContent=profile.companyName;if(t==='Основатель и собственник')p.textContent=profile.role;if(t.startsWith('Федеральная компания')){p.textContent=profile.companyDescription;p.style.height='auto';}}}
 if(profile.showScale!=='true'){
  const scale=root.querySelector<HTMLElement>('[data-name="Масштаб бизнеса · видимость"]');if(scale&&(publicView||profile.fresh==='true')){scale.replaceChildren();const p=document.createElement('p');p.textContent='Оборот и сотрудники скрыты';p.className='local-empty';scale.append(p);}
  if(company){for(const p of company.querySelectorAll('p'))if(p.textContent?.includes('Показатели видны'))p.textContent='Показатели скрыты от участников';if(publicView){const founded=[...company.querySelectorAll('p')].find(p=>p.textContent?.trim()==='Основана');const row=founded?.parentElement?.parentElement;if(row)row.style.display='none';}}
 }
 if(profile.fresh==='true'){
  const badge=root.querySelector<HTMLElement>('[data-name="Уровень поддержки"]');if(badge){badge.style.display=profile.supportTier?'':'none';if(profile.supportTier){const p=badge.querySelector('p');if(p)p.textContent=profile.supportTier;}}
  const avatar=root.querySelector<HTMLElement>('[data-name="Аватар · Опора сообщества"]');
  if(avatar&&!profile.photo){avatar.replaceChildren();avatar.textContent=profile.name.split(/\s+/).slice(0,2).map(s=>s[0]).join('');avatar.classList.add('profile-avatar-initials');}
  if(avatar&&profile.supportTier)avatar.dataset.supported='true';
  const videos=root.querySelector<HTMLElement>('[data-name="Видео"]');if(videos){videos.replaceChildren();videos.style.height='auto';const p=document.createElement('p');p.className='local-empty';p.textContent=profile.video?'Ссылка на видео сохранена в профиле':'Видео можно добавить при редактировании профиля';videos.append(p);}
  const tabs=root.querySelector('[data-name="Вкладки профиля"]');const content=tabs?.nextElementSibling;
  if(content){const current=tabs?.querySelector('[data-name*="выбрана"]')?.textContent?.trim();const title=current==='Запросы'?profile.task:current==='Экспертизы'?profile.serviceName:profile.companyName;const text=current==='Запросы'?profile.task:current==='Экспертизы'?profile.serviceResult:profile.companyDescription;content.replaceChildren();if(title){const card=document.createElement('article');card.className='demo-profile-card';const h=document.createElement('h3');h.textContent=title;const p=document.createElement('p');p.textContent=text;card.append(h,p);content.append(card);}else{const p=document.createElement('p');p.className='local-empty';p.textContent=current==='Запросы'?'Вы пока не добавили запросы':current==='Экспертизы'?'Добавьте экспертизы в редактировании профиля':'Добавьте компанию или самостоятельную практику в редактировании профиля';content.append(p);}}
 }
 const tabs=root.querySelector('[data-name="Вкладки профиля"]');const current=tabs?.querySelector('[data-name*="выбрана"]')?.textContent?.trim();const content=tabs?.nextElementSibling;
 if(content&&profile.fresh!=='true'&&((current==='Запросы'&&profile.task!==defaultProfile.task)||(current==='Экспертизы'&&(profile.serviceName!==defaultProfile.serviceName||profile.serviceResult!==defaultProfile.serviceResult)))){content.replaceChildren();const card=document.createElement('article');card.className='demo-profile-card';const h=document.createElement('h3');h.textContent=current==='Запросы'?profile.task:profile.serviceName;const p=document.createElement('p');p.textContent=current==='Запросы'?profile.task:profile.serviceResult;card.append(h,p);content.append(card);}
 if(content){const kind=current==='Экспертизы'?'service':current==='Компании'?'company':null;if(kind)for(const key of Object.keys(profile)){const match=key.match(new RegExp(`^extra-${kind}-(\\d+)-title$`));if(match&&profile[key]){const card=document.createElement('article');card.className='demo-profile-card';const h=document.createElement('h3');h.textContent=profile[key];const p=document.createElement('p');p.textContent=profile[`extra-${kind}-${match[1]}-description`]||'';card.append(h,p);content.append(card);}}}
}
