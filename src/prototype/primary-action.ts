import './primary-action.css';

const primarySelector = '[data-name*="CTA"], [data-name="Сохранить изменения профиля"], .native-primary';
const designDisabled = new Set(['506:4046']);
const iconAssets = {
  default: 'connection-arrow.svg',
  pressed: 'connection-arrow-pressed.svg',
  disabled: 'connection-arrow-disabled.svg',
  loading: 'connection-loading.svg',
};

/** Apply the shared Figma CTA without replacing its identity or navigation. */
export function preparePrimaryActions(root: HTMLElement) {
  for (const button of root.querySelectorAll<HTMLElement>(primarySelector)) {
    if (button.classList.contains('connection-cta')) continue;
    let label = button.querySelector<HTMLElement>(':scope > p');
    let action = button.querySelector<HTMLElement>(':scope > [data-name="Стрелка в круге"], :scope > span');
    if (!label && button.classList.contains('native-primary')) {
      label = document.createElement('p');
      label.textContent = [...button.childNodes].filter(n => n.nodeType === Node.TEXT_NODE).map(n => n.textContent).join('').trim();
      for (const node of [...button.childNodes]) if (node.nodeType === Node.TEXT_NODE) node.remove();
      button.prepend(label);
    }
    // The selector deliberately excludes profile tabs, links, chips and composers.
    if (!label || !action) continue;
    const isLoading = Boolean(action.querySelector('[data-name*="loading"]'));
    button.classList.add('connection-cta');
    if (getComputedStyle(button).position === 'static') button.style.position = 'relative';
    button.setAttribute('role', 'button');
    button.tabIndex = 0;
    label.classList.add('connection-label');
    action.classList.add('connection-action');
    action.setAttribute('aria-hidden', 'true');
    const slot = document.createElement('span');
    slot.className = 'connection-icon-slot';
    for (const [state, file] of Object.entries(iconAssets)) {
      const icon = document.createElement('img');
      icon.className = `connection-icon connection-icon--${state}`;
      icon.src = import.meta.env.BASE_URL + 'assets/' + file;
      icon.alt = '';
      icon.width = 24;
      icon.height = 24;
      slot.append(icon);
    }
    action.replaceChildren(slot);
    if (designDisabled.has(button.dataset.nodeId || '')) button.setAttribute('aria-disabled', 'true');
    if (isLoading) button.setAttribute('aria-busy', 'true');
  }
}
