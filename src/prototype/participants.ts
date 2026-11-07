import type {Person} from './dom';

type Entry={title:string;text:string;meta?:string};
type Participant={city:string;bio:string[];turnover:string;team:string;companies:Entry[];requests:Entry[];expertise:Entry[]};
// Fictional demo content for the two people shown on the community home screen.
export const participants:Record<string,Participant>={
 'Алексей Смирнов':{city:'Москва, Россия',turnover:'До 100 млн ₽/год',team:'11–50 сотрудников',bio:['Основатель сервисной студии. Развиваю команду, продажи и клиентский сервис. В сообществе ищу практиков, с которыми можно обсудить задачи роста бизнеса.','Сейчас хочу сформировать самостоятельный отдел продаж: описать процессы, настроить CRM и подобрать первых менеджеров. Открыт к взаимному обмену опытом и рекомендациям.'],companies:[{title:'Сервисная студия',text:'Команда, которая помогает компаниям запускать и сопровождать сервисные проекты.',meta:'Основатель · Москва'}],requests:[{title:'Нужен руководитель продаж',text:'Нужна помощь с запуском отдела продаж, воронкой, CRM и наймом команды.',meta:'Команда · онлайн'}],expertise:[{title:'Запуск сервисных проектов',text:'Поделюсь опытом организации клиентской работы и подготовки небольших команд к самостоятельному ведению проектов.',meta:'Обмен опытом'}]},
 'Андрей Белов':{
  city:'Москва, Россия',turnover:'До 50 млн ₽/год',team:'11–50 сотрудников',
  bio:['Сооснователь студии «Форма». Помогаю предпринимателям наводить порядок в операционной работе: распределять ответственность, выстраивать процессы и развивать команду.',
   'Последние восемь лет занимаюсь управлением проектами и сервисным бизнесом. Люблю понятные договорённости, самостоятельные команды и решения, которые действительно работают в повседневной практике.',
   'В сообществе хочу обмениваться опытом с руководителями и находить партнёров для совместных проектов. В свободное время бегаю, хожу в горы и изучаю городскую архитектуру.'],
  companies:[{title:'Форма',text:'Студия проектирования и реализации коммерческих пространств. Создаём офисы и общественные интерьеры: от концепции до запуска и сопровождения проекта.',meta:'Сооснователь · с 2018 года · 24 сотрудника'}],
  requests:[{title:'Ищу руководителя проектов',text:'Нужен человек, который умеет вести несколько проектов одновременно, общаться с заказчиками и собирать команду вокруг результата. Буду рад рекомендациям и знакомству.',meta:'Команда · Москва / гибрид'},
   {title:'Обмен опытом управления студией',text:'Хочу познакомиться с руководителями проектных и сервисных компаний. Интересно обсудить загрузку команды, финансовое планирование и систему ответственности.',meta:'Обмен опытом · онлайн'}],
  expertise:[{title:'Процессы и ответственность',text:'Помогу разобрать, где теряются задачи и договорённости, распределить роли и выстроить понятный рабочий ритм команды.',meta:'Управление · онлайн · обмен опытом'},
   {title:'Организация проектной работы',text:'Поделюсь опытом планирования ресурсов, работы с подрядчиками и контроля сроков без лишней бюрократии.',meta:'Проекты · лично / через команду'}]
 },
 'Мария Волкова':{
  city:'Санкт-Петербург, Россия',turnover:'Оборот скрыт',team:'Состав команды скрыт',
  bio:['Консультант по продажам. Помогаю небольшим B2B-компаниям запускать отделы продаж и превращать разрозненные обращения в понятную систему работы с клиентами.',
   'Начинала с личных продаж, затем руководила коммерческой командой. Сейчас сопровождаю предпринимателей: от первых интервью с клиентами до найма руководителя и настройки CRM.',
   'Открыта к обмену практиками, совместным образовательным проектам и знакомству с основателями сервисных компаний. Люблю плавание, путешествия и хорошие документальные фильмы.'],
  companies:[{title:'Практика продаж',text:'Независимая консультационная практика. Помогаем предпринимателям сформировать предложение, выстроить воронку продаж, обучить менеджеров и внедрить CRM.',meta:'Основатель · консалтинг и обучение'}],
  requests:[{title:'Партнёр по внедрению CRM',text:'Ищу специалиста или небольшую команду для совместных проектов. Нужны аккуратная настройка CRM, интеграции и поддержка клиентов после запуска.',meta:'Партнёрство · удалённо'},
   {title:'Предприниматели для обмена опытом',text:'Хочу обсудить, как компании переходят от продаж силами основателя к самостоятельному коммерческому отделу. Готова делиться практиками и разбирать конкретные ситуации.',meta:'Продажи · обмен опытом'}],
  expertise:[{title:'Запуск отдела продаж',text:'Помогу определить роли, подобрать первых менеджеров, организовать обучение и сформировать понятные показатели для команды.',meta:'Продажи · онлайн'},
   {title:'Разбор воронки и коммуникаций',text:'Посмотрим путь клиента, найдём точки потери обращений и сформулируем изменения в предложении, скриптах и работе с повторными продажами.',meta:'Диагностика · лично'}]
 }
};

export function applyParticipant(root:HTMLElement,route:string,person:Person){
 const data=participants[person.name];if(!data)return;
 for(const p of root.querySelectorAll('p')){
  const text=p.textContent?.trim()||'';
  if(text==='Александр Репин')p.textContent=person.name;
  if(text==='Москва, Россия')p.textContent=data.city;
  if(text.includes('Основатель · ТВОЙ СТИЛЬ')){p.textContent=person.role;p.style.lineHeight='20px';p.style.fontSize='14px';}
  if(text==='≈ 500 млн ₽ · 2025')p.textContent=data.turnover;
  if(text==='225 в штате')p.textContent=data.team;
  if(text==='Опора сообщества'){const badge=p.closest<HTMLElement>('[data-name="Уровень поддержки"]');if(badge)badge.style.display='none';}
 }
 const avatar=root.querySelector<HTMLImageElement>('[data-name="Аватар · Опора сообщества"] img');
 if(avatar&&person.photo)avatar.src=person.photo.startsWith('assets/')?import.meta.env.BASE_URL+person.photo:person.photo;
 else if(avatar){const wrapper=avatar.closest<HTMLElement>('[data-name="Аватар · Опора сообщества"]');if(wrapper){wrapper.replaceChildren();wrapper.textContent=person.name.split(' ').map(s=>s[0]).join('');wrapper.classList.add('profile-avatar-initials');}}
 const video=root.querySelector<HTMLElement>('[data-name="Видео"]');
 if(video){video.style.height='auto';video.style.minHeight='0';video.replaceChildren();const note=document.createElement('p');note.className='local-empty';note.textContent='Участник пока не добавил видео';video.append(note);}
 const tabs=root.querySelector<HTMLElement>('[data-name="Вкладки профиля"]');const content=tabs?.nextElementSibling;
 if(!content)return;
 const entries=route==='729:5891'?data.requests:route==='729:6028'?data.expertise:data.companies;
 content.replaceChildren();
 for(const entry of entries){
  const card=document.createElement('article');card.className='demo-profile-card';
  const title=document.createElement('h3');title.textContent=entry.title;const text=document.createElement('p');text.textContent=entry.text;card.append(title,text);
  if(entry.meta){const meta=document.createElement('small');meta.textContent=entry.meta;card.append(meta);}
  content.append(card);
 }
}

export function personForName(name:string):Person{
 const photos:Record<string,string>={'Андрей Белов':'assets/24ca7d52-0300-48a5-9966-d9f6a5eed0ad.png','Мария Волкова':'assets/03805a59-b953-4680-9b42-877ac303f158.png'};
 const roles:Record<string,string>={'Андрей Белов':'Сооснователь · «Форма»','Мария Волкова':'Консультант по продажам','Алексей Смирнов':'Основатель · сервисная студия'};
 return{id:name,name,role:roles[name]||'Участник сообщества',photo:photos[name]||''};
}
