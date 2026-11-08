// Approved Figma material 788:7321. The outline adapts without stretching the 64px circle.
const observers = new WeakMap<HTMLElement, ResizeObserver>();
let serial = 0;

export function disposeGlassSurfaces(root: HTMLElement) {
  observers.get(root)?.disconnect();
  observers.delete(root);
}

export function prepareGlassSurfaces(root: HTMLElement) {
  disposeGlassSurfaces(root);
  const observer = new ResizeObserver(entries => {
    for (const entry of entries) updateOutline(entry.target as HTMLElement);
  });
  observers.set(root, observer);
  for (const button of root.querySelectorAll<HTMLElement>('.connection-cta')) {
    if (!button.querySelector(':scope > .connection-glass')) {
      const id = `connection-glass-${++serial}`;
      const surface = document.createElement('span');
      surface.className = 'connection-glass';
      surface.setAttribute('aria-hidden', 'true');
      surface.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" focusable="false" preserveAspectRatio="none">
        <defs>
          <path id="${id}-shape" data-glass-outline=""/>
          <clipPath id="${id}-clip"><use href="#${id}-shape"/></clipPath>
          <radialGradient id="${id}-warm" cx="0" cy="0" r="1" gradientTransform="translate(.04 1) scale(.32 1.05)"><stop stop-color="#e4d7a7" stop-opacity=".58"/><stop offset="1" stop-color="#e4d7a7" stop-opacity="0"/></radialGradient>
          <radialGradient id="${id}-cyan" cx="0" cy="0" r="1" gradientTransform="translate(.77 1.08) scale(.39 1.1)"><stop stop-color="#8debdc" stop-opacity=".8"/><stop offset="1" stop-color="#8debdc" stop-opacity="0"/></radialGradient>
          <radialGradient id="${id}-mint" cx="0" cy="0" r="1" gradientTransform="translate(.39 .04) scale(.4 .95)"><stop stop-color="#a8f2d1" stop-opacity=".94"/><stop offset="1" stop-color="#a8f2d1" stop-opacity="0"/></radialGradient>
          <linearGradient id="${id}-sheen" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#f1f5f3" stop-opacity=".18"/><stop offset=".3" stop-color="#a8f2d1" stop-opacity="0"/><stop offset=".65" stop-color="#a8f2d1" stop-opacity="0"/><stop offset="1" stop-color="#f1f5f3" stop-opacity=".18"/></linearGradient>
          <linearGradient id="${id}-edge" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#f1f5f3" stop-opacity=".52"/><stop offset=".45" stop-color="#a8f2d1" stop-opacity="0"/><stop offset=".55" stop-color="#a8f2d1" stop-opacity="0"/><stop offset="1" stop-color="#f1f5f3" stop-opacity=".52"/></linearGradient>
          <filter id="${id}-inner" x="-10%" y="-50%" width="120%" height="200%"><feGaussianBlur in="SourceAlpha" stdDeviation="2.5" result="blur"/><feOffset in="blur" dy="2" result="offset"/><feComposite in="SourceAlpha" in2="offset" operator="out" result="shadow"/><feFlood flood-color="#001f12" flood-opacity=".12"/><feComposite in2="shadow" operator="in"/><feComposite in2="SourceGraphic" operator="over"/></filter>
        </defs>
        <g filter="url(#${id}-inner)">
          <use href="#${id}-shape" fill="var(--glass-base, #10b981)"/>
          <use href="#${id}-shape" fill="url(#${id}-warm)"/>
          <use href="#${id}-shape" fill="url(#${id}-cyan)"/>
          <use href="#${id}-shape" fill="url(#${id}-mint)"/>
          <use href="#${id}-shape" fill="url(#${id}-sheen)"/>
        </g>
        <use href="#${id}-shape" fill="none" stroke="url(#${id}-edge)" stroke-width="2" clip-path="url(#${id}-clip)"/>
      </svg>`;
      button.prepend(surface);
    }
    updateOutline(button);
    observer.observe(button);
  }
}

function updateOutline(button: HTMLElement) {
  const svg = button.querySelector<SVGSVGElement>(':scope > .connection-glass > svg');
  const width = button.clientWidth;
  if (!svg || width < 128) return;
  const bodyCenter = width - 96;
  const actionCenter = width - 32;
  const join = Math.sqrt(32 * 32 - 12 * 12);
  svg.setAttribute('viewBox', `0 0 ${width} 64`);
  svg.querySelector('[data-glass-outline]')!.setAttribute('d',
    `M32 0 H${bodyCenter} A32 32 0 0 1 ${bodyCenter + join} 20 H${actionCenter - join} A32 32 0 1 1 ${actionCenter - join} 44 H${bodyCenter + join} A32 32 0 0 1 ${bodyCenter} 64 H32 A32 32 0 0 1 0 32 A32 32 0 0 1 32 0Z`);
}
