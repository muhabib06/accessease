let summarizer;

chrome.runtime.onInstalled.addListener(async () => {
  // Set default settings
  chrome.storage.sync.set({
    highContrast: false,
    textToSpeech: false,
    simplifyText: false,
    autoAltText: false
  });

  // Create context menu items
  chrome.contextMenus.create({
    id: "readAloud",
    title: "Read aloud",
    contexts: ["selection"]
  });

  // Initialize summarizer when extension is installed or updated
  summarizer = await initializeSummarizer();
});

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "readAloud") {
    chrome.tabs.sendMessage(tab.id, {action: "readAloud", text: info.selectionText});
  }
});

// Listen for messages from content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "notify") {
    chrome.notifications.create({
      type: "basic",
      iconUrl: "images/icon128.png",
      title: "AccessEase",
      message: request.message
    });
  } else if (request.action === "simplifyText") {
    simplifyText(request.text, request.level).then(sendResponse);
    return true; // Keep the message channel open for async response
  } else if (request.action === "simplifyPageText") {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.tabs.sendMessage(tabs[0].id, { action: "simplifyPageText" });
    });
  }
});

// Apply settings when navigation completes
chrome.webNavigation.onCompleted.addListener((details) => {
  chrome.storage.sync.get(null, (settings) => {
    chrome.tabs.sendMessage(details.tabId, {action: "applySettings", settings: settings});
  });
});

async function initializeSummarizer() {
  try {
    const canSummarize = await ai.summarizer.capabilities();
    if (canSummarize && canSummarize.available !== 'no') {
      if (canSummarize.available === 'readily') {
        return await ai.summarizer.create();
      } else {
        const summarizer = await ai.summarizer.create();
        summarizer.addEventListener('downloadprogress', (e) => {
          console.log(`Download progress: ${e.loaded}/${e.total}`);
        });
        await summarizer.ready;
        return summarizer;
      }
    }
  } catch (error) {
    console.error('Error initializing summarizer:', error);
  }
  return null;
}

async function simplifyText(text, level) {
  if (!summarizer) {
    summarizer = await initializeSummarizer();
  }
  
  if (summarizer) {
    try {
      // Adjust the summarization based on the level
      const options = {
        length: level === 'short' ? 'short' : level === 'medium' ? 'medium' : 'long'
      };
      const result = await summarizer.summarize(text, options);
      return result;
    } catch (error) {
      console.error('Error simplifying text:', error);
      return text; // Return original text if there's an error
    }
  } else {
    console.error('Summarizer is not available');
    return text; // Return original text if summarizer is not available
  }
}