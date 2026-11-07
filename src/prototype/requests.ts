export const demoRequests:Record<string,{id:string;title:string;description:string;author:string}>={
 'sample-sales':{id:'sample-sales',title:'Нужен руководитель продаж',description:'Запустить отдел продаж в студии. Нужен практический опыт в сервисном бизнесе: подбор команды, воронка и работа с CRM.',author:'Алексей Смирнов'},
 'sample-marketing':{id:'sample-marketing',title:'Ищу партнёра по маркетингу',description:'Хочу совместно развивать направление для сервисных компаний. Ищу партнёра с опытом привлечения клиентов и упаковки услуг.',author:'Андрей Белов'}
};
export function prepareRequestCards(root:HTMLElement,route:string){
 if(['503:2497','503:2842'].includes(route))for(const card of root.querySelectorAll<HTMLElement>('[data-name="THE MISSION/Card/Request"]')){
  card.dataset.sampleRequest=card.textContent?.includes('Ищу партнёра')?'sample-marketing':'sample-sales';card.setAttribute('role','button');card.tabIndex=0;card.setAttribute('aria-label','Открыть запрос: '+card.querySelector('p')?.textContent?.trim());
 }
 if(route==='503:2728')for(const card of root.querySelectorAll<HTMLElement>('[data-name="THE MISSION/Navigation/Item"]')){if(!card.textContent?.includes('Мария откликнулась'))continue;card.dataset.incomingReply='true';card.setAttribute('role','button');card.tabIndex=0;}
}
export function showSelectedRequest(root:HTMLElement,route:string,selected:string|null){
 const request=selected?demoRequests[selected]:null;if(!request||!['503:2556','503:2653'].includes(route))return;
 for(const p of root.querySelectorAll<HTMLElement>('p')){
  const text=p.textContent?.replace(/\s+/g,' ').trim()||'';
  if(text.startsWith('Нужен руководитель продаж')||text==='Руководитель продаж')p.textContent=request.title;
  if(text.startsWith('Запустить отдел продаж'))p.textContent=request.description;
  if(text==='Запрос Алексея Смирнова')p.textContent='Запрос: '+request.author;
  if(text.startsWith('Алексей Смирнов'))p.textContent=request.author;
  if(text.startsWith('Нужны процессы, воронка'))p.textContent=request.description;
  if(selected==='sample-marketing'&&text.startsWith('До 100 000'))p.textContent='Партнёрство · Москва';
 }
}
