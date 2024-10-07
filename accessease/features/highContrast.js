let styleElement;

export function init() {
  styleElement = document.createElement('style');
  styleElement.textContent = `
    body {
      filter: contrast(150%) brightness(120%);
    }
  `;
  document.head.appendChild(styleElement);
}

export function disable() {
  if (styleElement) {
    styleElement.remove();
  }
}