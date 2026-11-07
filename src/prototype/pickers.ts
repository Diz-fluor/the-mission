const routes:Record<string,string>={'Город':'481:2275','Индустрия':'481:2923','Сотрудники':'481:2999','Годовой оборот':'481:3062','Формат работы':'481:2670','Доступность':'481:2570','Стоимость':'481:2732','Компетенции':'481:2339','Специализация':'481:2497','Кого ищу':'506:4051','Причина':'506:4090','Участник':'504:3625'};
export function preparePickers(root:HTMLElement){
 for(const field of root.querySelectorAll<HTMLElement>('[data-name="Поле"]')){
  const input=field.querySelector<HTMLInputElement>('input');const icon=field.querySelector<HTMLElement>('[data-name*="chevron-down"]');if(!input||!icon)continue;
  const label=input.getAttribute('aria-label')?.replace(/\s+/g,' ').trim()||'';const route=routes[label];if(!route)continue;
  icon.dataset.picker=route;icon.dataset.pickerField=input.dataset.field||'';icon.setAttribute('role','button');icon.setAttribute('aria-label','Выбрать: '+label);icon.tabIndex=0;
 }
}
