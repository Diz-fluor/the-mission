import './funding.css';

type Payment={id:string;amount:number;createdAt:string};
const money=(amount:number)=>new Intl.NumberFormat('ru-RU').format(amount)+' ₽';
export function prepareFunding(root:HTMLElement,route:string,state:{contribution:number;payment:{amount:number;status:string}|null;payments:Payment[];profile:Record<string,string>|null}){
 if(route==='488:2076'){
  root.querySelector('[data-node-id="488:2076"]')?.classList.add('funding-form');
  const first=root.querySelector<HTMLAnchorElement>('[data-node-id="488:2118"]');
  const second=root.querySelector<HTMLAnchorElement>('[data-node-id="636:5626"]');
  if(first&&second&&!first.closest('.funding-details')){
   const details=document.createElement('nav');details.className='funding-details';details.setAttribute('aria-label','Информация о сборе');first.before(details);
   for(const link of [first,second]){
    link.classList.add('funding-detail-link');
    const label=link.querySelector('p');if(label)label.textContent=label.textContent?.replace(/\s*→\s*$/,'')||'';
    const icon=document.createElement('img');icon.className='funding-detail-chevron';icon.src=import.meta.env.BASE_URL+'assets/03ac6dd8-a71d-4628-a958-26f15aea48eb.svg';icon.width=20;icon.height=20;icon.alt='';icon.setAttribute('aria-hidden','true');link.append(icon);details.append(link);
   }
  }
 }
 for(const row of root.querySelectorAll<HTMLElement>('[data-name="Отчёт и мой вклад"]')){
  row.classList.add('funding-links');
  for(const link of row.querySelectorAll<HTMLAnchorElement>(':scope > a')){
   link.classList.add('funding-link');
   const label=link.querySelector('p');if(label)label.textContent=label.textContent?.replace(/\s*›\s*$/,'')||'';
   if(!link.querySelector('.funding-chevron')){const icon=document.createElement('img');icon.className='funding-chevron';icon.src=import.meta.env.BASE_URL+'assets/03ac6dd8-a71d-4628-a958-26f15aea48eb.svg';icon.width=20;icon.height=20;icon.alt='';icon.setAttribute('aria-hidden','true');link.append(icon);}
  }
 }
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
