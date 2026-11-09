export const AI_REQUEST_ROUTES = {
  input: '838:7413', clarify: '838:7466', loading: '838:7528',
  review: '838:7580', error: '838:7644', published: '838:7696',
};
export const AI_SESSION_KEY = 'ai-request-session';
export const isAiRequestRoute = route => Object.values(AI_REQUEST_ROUTES).includes(route);

export function restoreAiSession(value) {
  const empty = { id: '', raw: '', answer: '', title: '', description: '', kind: 'Специалиста', budget: '', deadline: '', format: '', editedTitle: false, editedDescription: false, returnTo: '503:2497', originId: '' };
  try {
    const parsed = JSON.parse(value || 'null');
    if (!parsed || typeof parsed !== 'object') return empty;
    for (const key of Object.keys(empty)) if (typeof parsed[key] === typeof empty[key]) empty[key] = parsed[key];
    if (!['503:2497','503:2842','503:2596','503:2896'].includes(empty.returnTo)) empty.returnTo = '503:2497';
    return empty;
  } catch { return empty; }
}

export function needsRequestClarification(raw) {
  return /продаж/i.test(raw) && !/запус|аудит|нанять|найм|настроить|внедрить|построить/i.test(raw);
}

/** Local prototype provider. It never claims to call a language model. */
export async function generateDemoRequest(raw, answer = '', signal) {
  const text = raw.trim();
  if (!text) throw new Error('Опишите задачу');
  await new Promise((resolve, reject) => {
    if (signal?.aborted) { reject(new DOMException('Cancelled', 'AbortError')); return; }
    const onAbort = () => { clearTimeout(timer); reject(new DOMException('Cancelled', 'AbortError')); };
    const timer = setTimeout(() => { signal?.removeEventListener('abort', onAbort); resolve(); }, 650);
    signal?.addEventListener('abort', onAbort, { once: true });
  });
  const result = answer && answer !== 'Пока не определился' ? answer.trim() : '';
  const title = result === 'Запущенный отдел продаж' ? 'Помочь запустить отдел продаж'
    : result === 'Аудит текущих продаж' ? 'Провести аудит продаж'
    : text.split(/[.!?\n]/)[0].slice(0, 100).trim();
  return { title: title || text.slice(0, 100), description: text + (result ? '\n\nОжидаемый результат: ' + result : '') };
}

export function applyGeneratedRequest(session, result) {
  return { ...session, title: session.editedTitle ? session.title : result.title,
    description: session.editedDescription ? session.description : result.description };
}

export function requestRecord(session, status) {
  if (!session.id || !session.title.trim() || !session.description.trim()) throw new Error('Добавьте заголовок и описание');
  return { id: session.originId || session.id, title: session.title.trim(), description: session.description.trim(),
    kind: session.kind, budget: session.budget.trim(), deadline: session.deadline.trim(), format: session.format,
    status, aiAssisted: true, raw: session.raw, answer: session.answer };
}
