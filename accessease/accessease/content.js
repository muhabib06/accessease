let textSimplificationEnabled = false;
let simplificationLevel = 'medium';
let activeFeatures = {};

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "toggleFeatures") {
    toggleFeatures(request.features);
  } else if (request.action === "simplifyPageText") {
    simplifyPageText();
  }
});

function toggleFeatures(features) {
  for (let feature in features) {
    if (feature === 'textSimplification') {
      textSimplificationEnabled = features[feature].enabled;
      simplificationLevel = features[feature].level;
    } else {
      if (features[feature]) {
        activateFeature(feature);
      } else {
        deactivateFeature(feature);
      }
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

// Implement other feature functions (highContrastMode, textToSpeechMode, etc.) here

async function simplifyPageText() {
  const paragraphs = document.querySelectorAll('p');
  for (let p of paragraphs) {
    try {
      const originalText = p.textContent;
      const simplifiedText = await simplifyText(originalText, simplificationLevel);
      p.textContent = simplifiedText;
    } catch (error) {
      console.error('Error simplifying text:', error);
    }
  }
}

document.addEventListener('mouseup', async () => {
  if (textSimplificationEnabled) {
    const selectedText = window.getSelection().toString().trim();
    if (selectedText.length > 0) {
      try {
        const simplifiedText = await simplifyText(selectedText, simplificationLevel);
        document.execCommand('insertText', false, simplifiedText);
      } catch (error) {
        console.error('Error simplifying selected text:', error);
      }
    }
  }
});

async function simplifyText(text, level) {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage(
      { action: "simplifyText", text: text, level: level },
      (response) => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
        } else {
          resolve(response);
        }
      }
    );
  });
}