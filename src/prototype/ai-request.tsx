import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { AI_REQUEST_ROUTES as R, restoreAiSession, needsRequestClarification, generateDemoRequest, applyGeneratedRequest, requestRecord } from './ai-request-model.mjs';
import { preparePrimaryActions, prepareAIEntryActions, disposeGlassSurfaces } from './primary-action';
import './ai-request.css';

export type AiSession = ReturnType<typeof restoreAiSession>;
export type AiRequestRecord = ReturnType<typeof requestRecord>;
const asset = (name: string) => import.meta.env.BASE_URL + 'assets/' + name;

export function AIRequestEntry({ label = 'Создать запрос с ИИ', onClick }: { label?: string; onClick: () => void }) {
  return <button type="button" className="ai-request-entry ai-connection" onClick={onClick}>
    <span className="ai-connection-label"><img className="ai-connection-mark" src={asset('ai-request-mark.svg')} width="32" height="32" alt=""/><p>{label}</p></span>
    <span className="connection-action" aria-hidden="true"><img className="ai-connection-arrow" src={asset('connection-arrow.svg')} width="20" height="20" alt=""/></span>
  </button>;
}

export function appendAiRequestEntries(root: HTMLElement, route: string) {
  if (!['503:2497','503:2842','503:2596','503:2896','503:2979'].includes(route) || root.querySelector('[data-ai-request-entry]')) return;
  const container = root.querySelector('[data-name="Контент"]');
  if (!container) return;
  const button = document.createElement('button');
  button.type = 'button'; button.dataset.aiRequestEntry = 'true'; button.dataset.name = 'Вход · ИИ-подбор';
  button.className = 'ai-request-entry';
  const mark = document.createElement('span'); mark.dataset.name = 'ИИ · маркер помощника';
  const image = document.createElement('img'); image.src = asset('ai-request-mark.svg'); image.width = 32; image.height = 32; image.alt = ''; mark.append(image);
  const label = document.createElement('p'); label.textContent = route === '503:2896' ? 'Улучшить с ИИ' : 'Создать запрос с ИИ';
  const arrow = document.createElement('span'); arrow.dataset.name = 'arrow-right';
  const icon = document.createElement('img'); icon.src = asset('connection-arrow.svg'); icon.width = 20; icon.height = 20; icon.alt = ''; arrow.append(icon);
  button.append(mark, label, arrow);
  const manual = [...container.children].find(n => n.textContent?.trim() === 'Создать запрос');
  if (manual) { for (const p of manual.querySelectorAll('p')) if (p.textContent?.trim() === 'Создать запрос') p.textContent = 'Создать вручную'; manual.before(button); }
  else container.children[0]?.after(button);
  prepareAIEntryActions(root);
}

export function AiRequestFlow({ route, stored, frame, go, persist, saveRecord, selected, say, manual, match }: {
  route: string; stored: string; frame: boolean; go: (route: string, replace?: boolean) => void;
  persist: (value: string) => void; saveRecord: (record: AiRequestRecord) => void;
  selected?: { id: string; title: string; description: string; budget?: string; deadline?: string; format?: string; closed?: boolean };
  say: (text: string) => void; manual: (session: AiSession) => void; match: (description: string) => void;
}) {
  const [session, setSession] = useState(() => restoreAiSession(stored));
  const [custom, setCustom] = useState(false);
  const [conditions, setConditions] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const pending = useRef<AbortController | null>(null);
  const current = useRef(session); current.current = session;
  const update = (patch: Partial<AiSession>) => { const next = { ...current.current, ...patch }; current.current = next; setSession(next); persist(JSON.stringify(next)); return next; };
  useLayoutEffect(() => { const node = root.current; if (node) preparePrimaryActions(node); return () => { if (node) disposeGlassSurfaces(node); }; }, [route]);
  useEffect(() => {
    if (route !== R.loading) return;
    if (!navigator.onLine) { go(R.error, true); return; }
    const controller = new AbortController();
    pending.current = controller;
    const draft = current.current;
    generateDemoRequest(draft.raw, draft.answer, controller.signal).then(result => {
      if (controller.signal.aborted) return;
      update(applyGeneratedRequest(current.current, result)); go(R.review, true);
    }).catch(error => { if (error.name !== 'AbortError') go(R.error, true); });
    return () => controller.abort();
  }, [route]);
  const start = () => {
    if (!session.raw.trim()) { say('Опишите задачу'); return; }
    say('Демонстрация ИИ: настоящий сервис ещё не подключён');
    go(needsRequestClarification(session.raw) && !session.answer ? R.clarify : R.loading);
  };
  const record = selected || { ...session, closed: false };
  const save = (status: 'draft' | 'published') => {
    try { const next = requestRecord({ ...session, id: session.id || crypto.randomUUID() }, status); update({ id: next.id }); saveRecord(next); go(status === 'draft' ? '503:2842' : R.published); }
    catch { say('Добавьте заголовок и описание'); }
  };
  const titles: Record<string, string> = { [R.input]: 'Запрос с ИИ', [R.clarify]: 'Уточним задачу', [R.loading]: 'Собираю запрос', [R.review]: 'Проверьте запрос', [R.error]: 'Попробуем ещё раз', [R.published]: record.closed ? 'Запрос закрыт' : 'Запрос опубликован' };
  const labels: Record<string, string> = { [R.input]: 'Составить запрос', [R.clarify]: 'К черновику', [R.loading]: 'Вернуться к задаче', [R.review]: 'Опубликовать', [R.error]: 'Повторить', [R.published]: 'Подобрать людей' };
  const field = (label: string, key: keyof AiSession, multiline = false) => <label className="ai-request-field"><span>{label}</span>{multiline
    ? <textarea rows={3} aria-label={label} value={String(session[key])} onChange={e => update({ [key]: e.target.value, ...(key === 'description' ? { editedDescription: true } : {}) })}/>
    : <input aria-label={label} value={String(session[key])} onChange={e => update({ [key]: e.target.value, ...(key === 'title' ? { editedTitle: true } : {}) })}/>}</label>;
  return <div ref={root} className={'ai-request-screen' + (frame ? ' ai-request-frame' : '')} data-node-id={route} data-name="ИИ-запрос" onClick={e => e.stopPropagation()} onKeyDown={e => e.stopPropagation()} onInput={e => e.stopPropagation()}>
    <img className="ai-request-background" src={asset('ai-request-background.svg')} alt=""/>
    {frame && <div className="ai-request-chrome"><div className="ai-request-status"><span>9:41</span><i/><div className="ai-request-signals"><span className="ai-request-bars"><b/><b/><b/><b/></span><img src={asset('01bed147-0a79-4144-9745-f84d3ee5b060.svg')} width="16" height="16" alt=""/><span className="ai-request-battery"/></div></div><div className="ai-request-telegram"><img src={asset('008777cc-dd08-4982-9c80-52b06064798a.svg')} width="22" height="22" alt=""/><div><strong>THE MISSION</strong><small>мини-приложение</small></div><img src={asset('017081f7-c97e-4d62-b0e1-111bc030bb6b.svg')} width="24" height="24" alt=""/></div></div>}
    <button className="ai-request-back" aria-label="Назад" onClick={() => { pending.current?.abort(); go(route === R.input ? session.returnTo : route === R.published ? '503:2842' : R.input); }}><img src={asset('ai-request-back.svg')} width="18" height="18" alt=""/></button>
    <div className="ai-request-scroll"><h1>{titles[route]}</h1>
      {route === R.input && <><p className="ai-request-muted">Опишите задачу своими словами. Помогу собрать понятный запрос.</p>{field('С чем нужна помощь', 'raw', true)}<p className="ai-request-caption">Уточню детали, если чего-то не хватает.</p><button className="ai-request-link" onClick={() => manual(session)}>Заполнить вручную</button></>}
      {route === R.clarify && <><p className="ai-request-muted">{session.raw}</p><img src={asset('ai-request-mark.svg')} width="32" height="32" alt="ИИ"/><h2>Что должно быть готово в результате?</h2><div className="ai-request-choices" role="radiogroup" aria-label="Результат">{['Запущенный отдел продаж', 'Аудит текущих продаж', 'Пока не определился'].map((answer, index) => <label key={answer} className={'ai-request-choice' + (index === 2 ? ' ai-request-choice-quiet' : '')}><span>{answer}</span><input type="radio" name="result" value={answer} checked={!custom && session.answer === answer} onChange={() => { setCustom(false); update({ answer }); }}/></label>)}</div><button className="ai-request-link" onClick={() => setCustom(true)}>Ответить своими словами</button>{custom && field('Ваш ответ', 'answer', true)}<button className="ai-request-link ai-request-caption" onClick={() => { update({ answer: '' }); go(R.loading); }}>Пропустить уточнение</button></>}
      {route === R.loading && <div className="ai-request-progress" role="status"><img src={asset('ai-request-mark.svg')} width="32" height="32" alt=""/><h2>Оформляю заголовок и описание</h2><p className="ai-request-muted">Сохраняю смысл вашей задачи</p></div>}
      {route === R.review && <><p className="ai-request-muted">Черновик подготовлен с ИИ. Всё можно изменить.</p>{field('Заголовок', 'title')}{field('Задача и результат', 'description', true)}<label className="ai-request-field"><span>Кого ищу</span><select aria-label="Кого ищу" value={session.kind} onChange={e => update({ kind: e.target.value })}><option>Специалиста</option><option>Партнёра</option><option>Знакомство</option></select></label><button className="ai-request-link" aria-expanded={conditions} onClick={() => setConditions(!conditions)}>Добавить бюджет, срок и формат</button>{conditions && <>{field('Бюджет · необязательно', 'budget')}{field('Срок · необязательно', 'deadline')}<label className="ai-request-field"><span>Формат · необязательно</span><select aria-label="Формат" value={session.format} onChange={e => update({ format: e.target.value })}><option value="">Обсудим лично</option><option>Онлайн</option><option>Очно</option><option>Онлайн и очно</option></select></label></>}<p className="ai-request-caption">Можно указать сейчас или обсудить лично</p><button className="ai-request-link" onClick={() => go(R.input)}>Уточнить с ИИ</button><button className="ai-request-link" onClick={() => save('draft')}>Сохранить черновик</button></>}
      {route === R.error && <><p>Не удалось подготовить черновик. Ваша задача сохранена.</p>{field('Ваша задача', 'raw', true)}<button className="ai-request-link" onClick={() => manual(session)}>Заполнить вручную</button></>}
      {route === R.published && <><p className="ai-request-caption ai-request-accent">{record.closed ? 'Новые отклики недоступны' : 'Виден участникам сообщества'}</p><h2>{record.title}</h2><p className="ai-request-description">{record.description}</p><p className="ai-request-muted">{[record.budget, record.deadline, record.format].filter(Boolean).join(' · ') || 'Бюджет и сроки обсудим лично'}</p><button className="ai-request-link" onClick={() => go('503:2896')}>Редактировать запрос</button>{!record.closed && <button className="ai-request-link ai-request-muted" onClick={() => go('503:2945')}>Закрыть запрос</button>}<p className="ai-request-muted">ИИ подберёт до трёх участников по вашей задаче.</p></>}
    </div>
    <button type="button" className="native-primary ai-request-primary" disabled={route === R.input && !session.raw.trim()} aria-disabled={route === R.input && !session.raw.trim()} onClick={() => {
      if (route === R.input) start(); else if (route === R.clarify || route === R.error) go(R.loading);
      else if (route === R.loading) { pending.current?.abort(); go(R.input); } else if (route === R.review) save('published');
      else match(record.description);
    }}><p>{labels[route]}</p><span aria-hidden="true"/></button>
    {frame && <div className="ai-request-home-indicator"/>}
  </div>;
}
