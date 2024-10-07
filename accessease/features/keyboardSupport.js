export function enhanceKeyboardNavigation() {
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Tab') {
        const focusedElement = document.activeElement;
        focusedElement.style.outline = '2px solid blue';
      }
    });
  
    document.addEventListener('blur', (e) => {
      e.target.style.outline = '';
    }, true);
  }