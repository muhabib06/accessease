let activeFeatures = {};

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "toggleFeatures") {
    toggleFeatures(request.features);
  }
});

function toggleFeatures(features) {
  for (let feature in features) {
    if (features[feature]) {
      activateFeature(feature);
    } else {
      deactivateFeature(feature);
    }
  }
}

function activateFeature(feature) {
  switch (feature) {
    case 'highContrast':
      highContrastMode(true);
      break;
    case 'textToSpeech':
      textToSpeechMode(true);
      break;
    case 'fontSize':
      fontSizeAdjustment(true);
      break;
    case 'keyboardNav':
      keyboardNavigation(true);
      break;
    case 'colorBlind':
      colorBlindMode(true);
      break;
  }
  activeFeatures[feature] = true;
}

function deactivateFeature(feature) {
  switch (feature) {
    case 'highContrast':
      highContrastMode(false);
      break;
    case 'textToSpeech':
      textToSpeechMode(false);
      break;
    case 'fontSize':
      fontSizeAdjustment(false);
      break;
    case 'keyboardNav':
      keyboardNavigation(false);
      break;
    case 'colorBlind':
      colorBlindMode(false);
      break;
  }
  delete activeFeatures[feature];
}

function highContrastMode(activate) {
  if (activate) {
    document.body.style.filter = 'contrast(150%) brightness(120%)';
  } else {
    document.body.style.filter = '';
  }
}

function textToSpeechMode(activate) {
  if (activate) {
    document.addEventListener('mouseup', speakSelectedText);
  } else {
    document.removeEventListener('mouseup', speakSelectedText);
  }
}

function speakSelectedText() {
  const selectedText = window.getSelection().toString();
  if (selectedText) {
    const utterance = new SpeechSynthesisUtterance(selectedText);
    window.speechSynthesis.speak(utterance);
  }
}

function fontSizeAdjustment(activate) {
  if (activate) {
    document.body.style.fontSize = '120%';
  } else {
    document.body.style.fontSize = '';
  }
}

function keyboardNavigation(activate) {
  if (activate) {
    document.addEventListener('keydown', handleKeyboardNav);
  } else {
    document.removeEventListener('keydown', handleKeyboardNav);
  }
}

function handleKeyboardNav(e) {
  if (e.altKey && e.key === 'n') {
    focusNextElement();
  } else if (e.altKey && e.key === 'p') {
    focusPreviousElement();
  }
}

function focusNextElement() {
  const focusableElements = document.querySelectorAll('a, button, input, select, textarea, [tabindex]:not([tabindex="-1"])');
  const currentIndex = Array.from(focusableElements).indexOf(document.activeElement);
  const nextElement = focusableElements[currentIndex + 1] || focusableElements[0];
  nextElement.focus();
}

function focusPreviousElement() {
  const focusableElements = document.querySelectorAll('a, button, input, select, textarea, [tabindex]:not([tabindex="-1"])');
  const currentIndex = Array.from(focusableElements).indexOf(document.activeElement);
  const previousElement = focusableElements[currentIndex - 1] || focusableElements[focusableElements.length - 1];
  previousElement.focus();
}

function colorBlindMode(activate) {
  if (activate) {
    const style = document.createElement('style');
    style.id = 'colorBlindStyle';
    style.textContent = `
      body {
        filter: grayscale(100%) !important;
      }
    `;
    document.head.appendChild(style);
  } else {
    const style = document.getElementById('colorBlindStyle');
    if (style) style.remove();
  }
}