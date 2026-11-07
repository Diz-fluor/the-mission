import document from './alexander-profile.json';

const normalize=(text:string)=>text.replace(/\s+/g,' ').trim();

export function prepareProfile(root:HTMLElement,alexander:boolean,role?:string|string[]){
 const about=root.querySelector<HTMLElement>('[data-name="О себе"]');
 if(!about)return;
 const header=window.document.createElement('button');header.type='button';header.className='profile-about-toggle';header.dataset.profileToggle='true';header.setAttribute('aria-expanded','false');header.setAttribute('aria-controls','profile-biography');
 while(about.firstChild)header.append(about.firstChild);
 about.classList.add('profile-about');about.append(header);
 const body=window.document.createElement('div');body.className='profile-biography';body.id='profile-biography';body.hidden=true;
 if(alexander){
  for(const section of document.filter(s=>['Основная информация','О себе'].includes(s.title))){
   const title=window.document.createElement('h3');title.textContent=section.title;body.append(title);
   for(const text of section.paragraphs){const p=window.document.createElement('p');p.textContent=text;body.append(p);}
  }
 }else{for(const text of Array.isArray(role)?role:[role||'Участник пока не добавил подробную информацию о себе']){const p=window.document.createElement('p');p.textContent=text;body.append(p);}}
 const close=window.document.createElement('button');close.type='button';close.dataset.profileToggle='true';close.className='profile-about-close';close.textContent='Свернуть';body.append(close);about.append(body);
 if(!alexander)return;
 // Keep the Figma cards and typography while replacing shortened copy with
 // complete paragraphs supplied by the profile owner.
 const paragraphs=document.flatMap(s=>s.paragraphs);
 for(const p of root.querySelectorAll<HTMLElement>('p')){
  if(p.closest('.profile-biography'))continue;
  const text=normalize(p.textContent||'');if(text.length<70||p.children.length)continue;
  const full=paragraphs.find(candidate=>normalize(candidate).includes(text));
  if(full){p.textContent=full;p.style.height='auto';p.style.maxHeight='none';p.style.overflow='visible';p.style.whiteSpace='normal';p.style.setProperty('-webkit-line-clamp','unset');}
 }
 const more=root.querySelector<HTMLElement>('[data-name="Показать все"]');
 if(more){
  const template=root.querySelector<HTMLElement>('[data-name="Обмен практиками между командами"]');
  const section=document.find(s=>s.title==='Экспертизы');const index=section?.paragraphs.indexOf('Рекомендации и полезные знакомства')??-1;
  if(template&&section&&index>=0){
   const card=template.cloneNode(true) as HTMLElement;card.dataset.name='Рекомендации и полезные знакомства';card.dataset.extraExpertise='true';card.hidden=true;
   card.removeAttribute('data-node-id');card.querySelectorAll('[data-node-id]').forEach(n=>n.removeAttribute('data-node-id'));
   const titles=card.querySelectorAll('p');titles[0].textContent=section.paragraphs[index];
   const text=[...titles].find(p=>(p.textContent||'').length>70);if(text)text.textContent=section.paragraphs[index+1];
   const tag=card.querySelector<HTMLElement>('[data-name="Тег · Через команды"] p');if(tag)tag.textContent='Знакомства';
   more.before(card);more.dataset.moreExpertise='true';more.setAttribute('role','button');more.setAttribute('aria-expanded','false');more.tabIndex=0;
  }
 }
}

export function toggleProfileDetails(target:HTMLElement){
 const toggle=target.closest<HTMLElement>('[data-profile-toggle]');if(!toggle)return false;
 const about=toggle.closest<HTMLElement>('.profile-about');const body=about?.querySelector<HTMLElement>('.profile-biography');const header=about?.querySelector<HTMLElement>('.profile-about-toggle');
 if(!body||!header)return false;
 body.hidden=!body.hidden;header.setAttribute('aria-expanded',String(!body.hidden));
 if(body.hidden){header.focus({preventScroll:true});header.scrollIntoView({block:'nearest'});}
 return true;
}

export function toggleMoreExpertise(root:HTMLElement,target:HTMLElement){
 const button=target.closest<HTMLElement>('[data-more-expertise]');if(!button)return false;
 const card=root.querySelector<HTMLElement>('[data-extra-expertise]');if(!card)return false;
 card.hidden=!card.hidden;button.setAttribute('aria-expanded',String(!card.hidden));
 const labels=button.querySelectorAll('p');labels[0].textContent=card.hidden?'Показать все':'Свернуть';if(labels[1])labels[1].textContent=card.hidden?'Ещё 1 направление':'Все направления';
 return true;
}
