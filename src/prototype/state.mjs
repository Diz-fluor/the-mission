export const STORAGE_KEY = 'the-mission-prototype-v1';
export function initialState() { return { relationship: {}, recommendations: {}, saved: [], savedPeople: {}, fields: {}, choices: {}, consents: {}, requests: [], selectedRequest: null, messages: [], query: '', filter: 'Все', criteria: {}, person: null, contribution: 0, amount: 500, payment: null, deal: null }; }
export function restoreState(raw) {
  try { const s = JSON.parse(raw || 'null'); if (!s || typeof s !== 'object') return initialState(); const base = initialState(); for (const key of ['relationship', 'recommendations', 'fields', 'choices', 'consents', 'savedPeople', 'criteria']) if (s[key] && typeof s[key] === 'object' && !Array.isArray(s[key])) base[key] = s[key]; for (const key of ['saved', 'requests', 'messages']) if (Array.isArray(s[key])) base[key] = s[key]; for (const key of ['query', 'filter']) if (typeof s[key] === 'string') base[key] = s[key]; if(typeof s.selectedRequest === 'string') base.selectedRequest=s.selectedRequest; if(s.payment && typeof s.payment==='object' && Number.isFinite(s.payment.amount))base.payment=s.payment; if(s.deal && typeof s.deal==='object' && !Array.isArray(s.deal)) base.deal=s.deal; if (s.person && typeof s.person.name === 'string') base.person = s.person; for (const key of ['amount', 'contribution']) if (Number.isFinite(s[key]) && s[key] >= 0) base[key] = s[key]; return base; } catch { return initialState(); }
}
export function transition(state, action) {
  switch (action.type) {
    case 'request': { const current = state.relationship[action.person] || 'stranger'; return current === 'stranger' || current === 'declined' ? { ...state, relationship: { ...state.relationship, [action.person]: 'pending' } } : state; }
    case 'accept': return { ...state, relationship: { ...state.relationship, [action.person]: 'accepted' } };
    case 'decline': return { ...state, relationship: { ...state.relationship, [action.person]: 'declined' } };
    case 'recommend': return { ...state, recommendations: { ...state.recommendations, [action.person]: 'pendingReview' } };
    case 'save': return { ...state, saved: state.saved.includes(action.person) ? state.saved.filter(id => id !== action.person) : [...state.saved, action.person], savedPeople: action.profile ? { ...state.savedPeople, [action.person]: action.profile } : state.savedPeople };
    case 'field': return { ...state, fields: { ...state.fields, [action.id]: action.value } };
    case 'consent': return { ...state, consents: { ...state.consents, [action.id]: !state.consents[action.id] } };
    case 'choice': return { ...state, choices: { ...state.choices, [action.screen]: action.value } };
    case 'person': return { ...state, person: action.person };
    case 'query': return { ...state, query: action.value };
    case 'filter': return { ...state, filter: action.value };
    case 'criteria': return { ...state, criteria: action.value };
    case 'amount': return { ...state, amount: action.value };
    case 'startPayment': return { ...state, payment: { id:action.id,amount:state.amount,status:'pending' } };
    case 'donate': return state.payment?.status==='pending' ? { ...state, contribution: state.contribution + state.payment.amount, payment:{...state.payment,status:'confirmed'} } : state;
    case 'message': return action.text.trim() ? { ...state, messages: [...state.messages, { id: action.id, text: action.text.trim() }] } : state;
    case 'publish': return { ...state, requests: [...state.requests, { id: action.id, title: action.title.trim(), description: action.description.trim() }] };
    case 'selectRequest': return { ...state, selectedRequest: action.id };
    case 'editRequest': return { ...state, requests: state.requests.map(r => r.id === state.selectedRequest ? { ...r, title: action.title.trim(), description: action.description.trim() } : r) };
    case 'closeRequest': return { ...state, requests: state.requests.map(r => r.id === state.selectedRequest ? { ...r, closed: true } : r) };
    case 'deal': return { ...state, deal: { ...state.deal, ...action.value } };
    default: return state;
  }
}
export function profileRoute(tab, relation) { if (tab === 'Запросы') return '729:5891'; if (tab === 'Экспертизы') return '729:6028'; return relation === 'pending' ? '726:5802' : relation === 'accepted' ? '726:5915' : '457:5863'; }
export const consentReady = s => Boolean(s.consents.rules && s.consents.privacy);
