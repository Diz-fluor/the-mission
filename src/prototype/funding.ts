type Payment={id:string;amount:number;createdAt:string};
const money=(amount:number)=>new Intl.NumberFormat('ru-RU').format(amount)+' ₽';
export function prepareFunding(root:HTMLElement,route:string,state:{contribution:number;payment:{amount:number;status:string}|null;payments:Payment[];profile:Record<string,string>|null}){
 if(route==='488:2119'&&state.payment?.status==='confirmed')for(const p of root.querySelectorAll('p'))if(p.textContent?.trim()==='500 ₽')p.textContent=money(state.payment.amount);
 if(route==='488:2153'){
  const base=state.profile?.fresh==='true'?0:5000;
  if(!base){const oldHistory=root.querySelector<HTMLElement>('[data-name="История переводов"]');if(oldHistory)oldHistory.style.display='none';}
  for(const p of root.querySelectorAll('p')){if(p.textContent?.trim()==='5 000 ₽')p.textContent=money(base+state.contribution);if(p.textContent?.trim()==='2 перевода')p.textContent=`${(base?2:0)+state.payments.length} переводов`;}
  const heading=[...root.querySelectorAll('p')].find(p=>p.textContent?.trim()==='История переводов');
  for(const payment of [...state.payments].reverse()){const row=document.createElement('div');row.className='local-request';const title=document.createElement('strong');title.textContent=money(payment.amount);const detail=document.createElement('small');detail.textContent=new Intl.DateTimeFormat('ru-RU',{day:'numeric',month:'long',year:'numeric'}).format(new Date(payment.createdAt))+' · демонстрация';row.append(title,detail);heading?.after(row);}
 }
 if(route==='678:14745'&&state.contribution){
  const total=42000+state.contribution;const percentage=Math.min(100,Math.round(total/1000));
  for(const p of root.querySelectorAll('p'))if(p.textContent?.trim()==='42 000 ₽')p.textContent=money(total);
  const bar=root.querySelector<HTMLElement>('[data-name="Шкала"]');if(bar){bar.setAttribute('role','progressbar');bar.setAttribute('aria-valuenow',String(percentage));bar.setAttribute('aria-valuemax','100');const fill=bar.firstElementChild as HTMLElement;if(fill)fill.style.width=percentage+'%';}
  for(const p of root.querySelectorAll('p'))if(p.textContent?.trim()==='42%')p.textContent=percentage+'%';
 }
 if(['488:2308','488:2340','488:2119'].includes(route)){
  const note=document.createElement('p');note.className='demo-payment-note';note.textContent='Демонстрация оплаты — деньги не списываются';(root.querySelector('[data-name^="Содержание"]')||root).prepend(note);
 }
}
