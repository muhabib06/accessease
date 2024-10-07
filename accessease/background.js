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