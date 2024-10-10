// Initialize extension
chrome.runtime.onInstalled.addListener(() => {
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
    }
  });
  
  // Apply settings when navigation completes
  chrome.webNavigation.onCompleted.addListener((details) => {
    chrome.storage.sync.get(null, (settings) => {
      chrome.tabs.sendMessage(details.tabId, {action: "applySettings", settings: settings});
    });
  });

  // background.js

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "simplifyText") {
    simplifyText(request.text).then(sendResponse);
    return true; // Keep the message channel open for async response
  }
});

async function simplifyText(text) {
  const apiKey = 'AIzaSyDhl9nToelii_uuclZhTWmfvdEprQY5FyM'; // actual API key
  const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`;

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text }] }]
      })
    });
    const data = await response.json();
    if (data && data.contents) {
      return data.contents[0].parts[0].text;
    } else {
      console.error('Error in response:', data);
      return text; // Return original text if there's an error
    }
  } catch (error) {
    console.error('Error fetching from API:', error);
    return text; // Return original text if there's an error
  }
}

let summarizer;

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "simplifyText") {
    simplifyText(request.text).then(sendResponse);
    return true; // Keep the message channel open for async response
  }
});

async function initializeSummarizer() {
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
  return null;
}

async function simplifyText(text) {
  if (!summarizer) {
    summarizer = await initializeSummarizer();
  }
  
  if (summarizer) {
    try {
      const result = await summarizer.summarize(text);
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