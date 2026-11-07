export function prepareOnboarding(root:HTMLElement,route:string,fields:Record<string,string>){
 const canvas=root.firstElementChild as HTMLElement;if(!canvas)return;
 const footer=[...canvas.children].find(n=>/Черновик сохраняется|Профиль появится после проверки/.test(n.textContent||'')) as HTMLElement|undefined;
 const action=canvas.querySelector<HTMLElement>('[data-name^="CTA"]');
 const nav=canvas.querySelector<HTMLElement>('[data-name^="Навигация / Назад"]');
 const main=document.createElement('div');main.className='onboarding-scroll';
 if(!footer)main.style.bottom='calc(100px + env(safe-area-inset-bottom,0px))';
 const chips=[...canvas.querySelectorAll<HTMLElement>('[data-name^="Компетенция /"]')];
 let group:HTMLElement|null=null;
 if(chips.length){
  group=document.createElement('div');group.className='editor-tagset';group.dataset.onboardingTags='true';
  const selected=(fields['onboarding-competencies']||'Управление|Команды').split('|');
  for(const chip of chips){const label=chip.querySelector('p')?.textContent?.trim()||'';const b=document.createElement('button');b.type='button';b.textContent=label;b.dataset.onboardingTag=label;b.setAttribute('aria-pressed',String(selected.includes(label)));group.append(b);}
  chips[0].before(group);chips.forEach(n=>n.remove());
 }
 const children=[...canvas.children].filter(n=>{
  const el=n as HTMLElement;const name=el.dataset.name||'';
  return el!==footer&&el!==action&&el!==nav&&!/Статус-бар|Telegram|Rectangle|Свет/.test(name)&&el.getBoundingClientRect().height>5;
 }).sort((a,b)=>a.getBoundingClientRect().top-b.getBoundingClientRect().top);
 for(const child of children as HTMLElement[]){child.style.transform='none';child.style.position='relative';child.style.top='auto';child.style.bottom='auto';child.style.left='auto';child.style.right='auto';child.style.width='100%';child.style.height='auto';child.style.minWidth='0';child.style.flexShrink='0';main.append(child);}
 // The newly-created chip group has no absolute position yet, so place it
 // after the competency label rather than sorting it with the phone chrome.
 if(group){const label=[...main.children].find(n=>n.textContent?.trim().startsWith('Компетенции ·'));if(label)label.after(group);}
 canvas.append(main);
 if(nav){nav.style.transform='none';nav.style.top='calc(8px + var(--safe-top))';nav.style.left='24px';nav.style.width='calc(100% - 48px)';}
 if(action){action.style.transform='none';action.style.top='auto';action.style.bottom=`calc(${footer?44:16}px + env(safe-area-inset-bottom,0px))`;action.style.left='24px';action.style.width='calc(100% - 48px)';}
 if(footer){footer.style.transform='none';footer.style.top='auto';footer.style.bottom='calc(16px + env(safe-area-inset-bottom,0px))';footer.style.left='24px';footer.style.width='calc(100% - 48px)';footer.style.height='auto';}
 for(const input of main.querySelectorAll<HTMLInputElement>('.prototype-input')){if(route==='464:1784'){const key=/Имя/.test(input.getAttribute('aria-label')||'')?'onboarding-name':'onboarding-city';input.value=fields[key]||input.value;}}
}
