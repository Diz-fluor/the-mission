import test from 'node:test';
import assert from 'node:assert/strict';
import { restoreAiSession, needsRequestClarification, generateDemoRequest, applyGeneratedRequest, requestRecord } from '../src/prototype/ai-request-model.mjs';
import { initialState, transition, restoreState } from '../src/prototype/state.mjs';

test('clarification is relevant and skipped when the result is already explicit', () => {
  assert.equal(needsRequestClarification('Нужна помощь с продажами'), true);
  assert.equal(needsRequestClarification('Нужно запустить отдел продаж'), false);
  assert.equal(needsRequestClarification('Нужен дизайнер логотипа'), false);
});
test('generation retains the exact task, uses only an explicit answer and invents no commercial terms', async () => {
  const raw = 'Нужна помощь с продажами в моей студии';
  const result = await generateDemoRequest(raw, 'Запущенный отдел продаж');
  assert.ok(result.description.startsWith(raw));
  assert.ok(result.description.includes('Запущенный отдел продаж'));
  assert.deepEqual(Object.keys(result).sort(), ['description','title']);
  const draft = requestRecord({ ...restoreAiSession(''), id: 'one', raw, ...result }, 'draft');
  assert.equal(draft.budget, ''); assert.equal(draft.deadline, ''); assert.equal(draft.format, '');
});
test('cancellation aborts generation and leaves the draft untouched', async () => {
  const controller = new AbortController();
  const pending = generateDemoRequest('Сохранить этот исходный текст', '', controller.signal);
  controller.abort();
  await assert.rejects(pending, { name: 'AbortError' });
});
test('manual edits survive regeneration', () => {
  const session = { ...restoreAiSession(''), title: 'Мой заголовок', description: 'Мои правки', editedTitle: true, editedDescription: true };
  const result = applyGeneratedRequest(session, { title: 'Другой заголовок', description: 'Другой текст' });
  assert.equal(result.title, session.title); assert.equal(result.description, session.description);
});
test('saving and publishing upsert the same request, including after reload', () => {
  const draft = requestRecord({ ...restoreAiSession(''), id: 'stable', title: 'Ищу партнёра', description: 'Обсудить проект' }, 'draft');
  let state = transition(initialState(), { type: 'saveAiRequest', record: draft });
  state = restoreState(JSON.stringify(state));
  assert.equal(state.requests[0].status, 'draft');
  for (let i = 0; i < 2; i++) state = transition(state, { type: 'saveAiRequest', record: { ...draft, status: 'published', title: 'Проверенный заголовок' } });
  assert.equal(state.requests.length, 1); assert.equal(state.requests[0].status, 'published');
  assert.equal(state.requests[0].title, 'Проверенный заголовок'); assert.equal(state.selectedRequest, 'stable');
});
test('invalid storage, empty requests and unsafe return routes cannot corrupt state', () => {
  assert.equal(restoreAiSession('{bad').raw, '');
  assert.equal(restoreAiSession('{"returnTo":"https://example.com"}').returnTo, '503:2497');
  assert.throws(() => requestRecord(restoreAiSession(''), 'published'));
  const state = initialState();
  assert.equal(transition(state, { type: 'saveAiRequest', record: { id: 'bad', title: '', description: '', status: 'published' } }), state);
});
