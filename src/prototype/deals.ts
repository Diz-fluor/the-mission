export const demoDeals:Record<string,Record<string,string>>={
 'demo-sales':{id:'demo-sales',title:'Запуск отдела продаж',member:'Мария Волкова',result:'Воронка, регламенты и обучение команды',cost:'60 000 ₽',deadline:'12 ноября, 18:00',status:'Проверка'},
 'demo-processes':{id:'demo-processes',title:'Настройка процессов',member:'Андрей Белов',result:'Понятные роли, процессы и план внедрения',cost:'30 000 ₽',deadline:'15 ноября',status:'Работа'}
};
export function syncDeals(root:HTMLElement,filter:string,status?:string,overrides:Record<string,Record<string,string>>={}){
 const group=root.querySelector<HTMLElement>('[data-name="THE MISSION/Control/Segmented"]');
 if(!group)return;
 group.classList.add('deal-filters');group.setAttribute('role','tablist');group.setAttribute('aria-label','Фильтр сделок');
 for(const tab of group.querySelectorAll<HTMLElement>(':scope>p')){const label=tab.textContent?.trim()||'';tab.dataset.dealFilter=label;tab.setAttribute('role','tab');tab.setAttribute('aria-selected',String(label===filter));tab.tabIndex=0;}
 let visible=0;
 for(const card of root.querySelectorAll<HTMLElement>('[data-name="THE MISSION/Card/Deal"],[data-deal]')){
  const demoId=card.dataset.demoDeal||'';const current=demoId?(overrides[demoId]?.status||demoDeals[demoId]?.status):card.dataset.dealStatus||status;
  const done=['Завершена','Отменена'].includes(current||'');
  const show=filter==='Все'||(filter==='Завершены'?done:!done);card.hidden=!show;card.style.display=show?'':'none';if(show)visible++;
 }
 root.querySelector('.deals-empty')?.remove();
 if(!visible){const empty=document.createElement('p');empty.className='local-empty deals-empty';empty.textContent=filter==='Завершены'?'Пока нет завершённых сделок':'Пока нет активных сделок';root.querySelector('[data-name="Контент"]')?.append(empty);}
}

export function prepareDealList(root:HTMLElement,created:Record<string,string>[],overrides:Record<string,Record<string,string>>){
 const container=root.querySelector('[data-name="Контент"]');if(!container)return;
 for(const card of root.querySelectorAll<HTMLElement>('[data-name="THE MISSION/Card/Deal"]')){
  const id=card.textContent?.includes('Настройка процессов')?'demo-processes':'demo-sales';card.dataset.demoDeal=id;
  const data={...demoDeals[id],...overrides[id]};const status=card.querySelector<HTMLElement>('[data-name="Статус · следующий шаг"] p');if(status&&overrides[id])status.textContent=data.status;card.setAttribute('role','button');card.tabIndex=0;
 }
 for(const deal of created){const b=document.createElement('button');b.className='local-request';b.dataset.deal=deal.id;b.dataset.dealStatus=deal.status;b.textContent=deal.title+' · '+deal.status;container.append(b);}
}

export function prepareRequestTabs(root:HTMLElement,route:string){
 const destinations:Record<string,string>={'Все':'503:2497','Входящие':'503:2728','Мои':'503:2842'};
 const group=root.querySelector<HTMLElement>('[data-name="THE MISSION/Control/Segmented"]');if(!group)return;
 group.classList.add('deal-filters');group.setAttribute('role','tablist');group.setAttribute('aria-label','Запросы');
 for(const tab of group.querySelectorAll<HTMLElement>(':scope>p')){const to=destinations[tab.textContent?.trim()||''];if(!to)continue;tab.dataset.requestTab=to;tab.setAttribute('role','tab');tab.setAttribute('aria-selected',String(route===to));tab.tabIndex=0;}
}
