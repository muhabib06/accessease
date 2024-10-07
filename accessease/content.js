// Listen for messages from background script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "readAloud") {
      readAloud(request.text);
    } else if (request.action === "applySettings") {
      applyAccessibilitySettings(request.settings);
    }
  });
  
  function readAloud(text) {
    const utterance = new SpeechSynthesisUtterance(text);
    window.speechSynthesis.speak(utterance);
  }
  
  function applyAccessibilitySettings(settings) {
    if (settings.highContrast) {
      document.body.classList.add('high-contrast');
    } else {
      document.body.classList.remove('high-contrast');
    }
  
    if (settings.simplifyText) {
      simplifyPageText();
    }
  
    if (settings.autoAltText) {
      generateAltText();
    }
  }
  
  function simplifyPageText() {
    // Implement text simplification logic here
    // This is a placeholder and would require NLP capabilities
    console.log("Simplifying text...");
  }
  
  function generateAltText() {
    const images = document.querySelectorAll('img:not([alt])');
    images.forEach(img => {
      // This is a placeholder. In a real scenario, you'd use an image recognition API
      img.alt = "Image description placeholder";
    });
  }
  
  // Notify background script when content script has loaded
  chrome.runtime.sendMessage({action: "notify", message: "AccessEase is active on this page"});