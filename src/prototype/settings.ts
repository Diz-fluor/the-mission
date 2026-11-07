export const accessFor=(fields:Record<string,string>,name:string):Record<string,boolean>=>{try{return JSON.parse(fields['access:'+name]||'{"telegram":true,"email":false,"phone":false}');}catch{return{telegram:true,email:false,phone:false};}};
export const blockedNames=(fields:Record<string,string>):string[]=>{try{return JSON.parse(fields['blocked-people']||'["Илья Соколов"]');}catch{return[];}};
export function prepareSettings(root:HTMLElement,route:string,fields:Record<string,string>,choices:Record<string,string>,showScale:boolean){
 if(fields['read-all']==='true')for(const n of root.querySelectorAll<HTMLElement>('[data-name*="Уведомления"] [data-name="THE MISSION/Indicator/Unread"]'))n.style.display='none';
 if(route==='505:3790'){
  for(const p of root.querySelectorAll('p'))if(['Мария Волкова','Андрей Белов'].includes(p.textContent?.trim()||'')){
   const name=p.textContent!.trim();const row=p.parentElement?.parentElement as HTMLElement;row.dataset.accessPerson=name;row.setAttribute('role','button');row.tabIndex=0;
   const saved=fields['access:'+name];if(saved){const access=accessFor(fields,name);const info=p.nextElementSibling;if(info)info.textContent=Object.keys(access).filter(k=>access[k]).map(k=>({telegram:'Telegram',email:'Почта',phone:'Телефон'}[k])).join(' · ')||'Контакты закрыты';}
  }
 }
 if(route==='505:3821'){
  const name=choices['access-person']||'Мария Волкова';const access=accessFor(fields,name);
  for(const p of root.querySelectorAll<HTMLElement>('p'))if(p.textContent?.includes('Доступ для')){p.textContent='Доступ к контактам · '+name;p.style.height='auto';}
  for(const input of root.querySelectorAll<HTMLInputElement>('.prototype-input')){
   const key=/Почта/.test(input.getAttribute('aria-label')||'')?'email':'phone';const select=document.createElement('select');select.className=input.className;select.setAttribute('style',input.getAttribute('style')||'');select.setAttribute('aria-label',key==='email'?'Почта':'Телефон');select.dataset.permission=key;
   for(const [value,label]of [['false','Закрыт'],['true','Разрешён']]){const option=document.createElement('option');option.value=value;option.textContent=label;select.append(option);}select.value=String(Boolean(access[key]));input.replaceWith(select);
  }
 }
 if(route==='505:3903'){
  const input=root.querySelector<HTMLInputElement>('.prototype-input');if(input){const select=document.createElement('select');select.className=input.className;select.setAttribute('style',input.getAttribute('style')||'');select.setAttribute('aria-label','Показатели бизнеса');select.dataset.privacyScale='true';for(const label of ['Скрыты','Видны участникам']){const option=document.createElement('option');option.value=label;option.textContent=label;select.append(option);}select.value=showScale?'Видны участникам':'Скрыты';input.replaceWith(select);}
 }
 if(route==='505:4017'){
  const content=root.querySelector('[data-name="Контент"]');if(content){for(const child of [...content.children])if(child.textContent?.includes('Илья Соколов'))child.remove();for(const name of blockedNames(fields)){const card=document.createElement('div');card.className='choice';const text=document.createElement('p');text.textContent=name;const b=document.createElement('button');b.className='quiet';b.textContent='Разблокировать';b.dataset.unblock=name;card.append(text,b);content.append(card);}if(!blockedNames(fields).length){const p=document.createElement('p');p.className='local-empty';p.textContent='Нет заблокированных участников';content.append(p);}}
 }
 if(route==='505:4084')for(const p of root.querySelectorAll('p'))if(p.textContent?.trim()==='Для @username')p.textContent='Для '+(fields['invite-username']||'@username');
 if(route==='505:4231'){const input=root.querySelector<HTMLInputElement>('.prototype-input');if(input){input.value='';input.placeholder='УДАЛИТЬ';}}
}
