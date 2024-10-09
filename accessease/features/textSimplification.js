// textSimplification.js

let model;

// Load the model when the extension is installed or updated
chrome.runtime.onInstalled.addListener(async () => {
  model = await loadModel();
});

async function loadModel() {
  const modelUrl = chrome.runtime.getURL('model.tflite');
  const response = await fetch(modelUrl);
  const modelBuffer = await response.arrayBuffer();
  return await tfTask.NLClassifier.CustomModel.TFLite.load({
    model: modelBuffer,
  });
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "simplifyText") {
    simplifyText(request.text).then(sendResponse);
    return true; // Indicates that the response is asynchronous
  }
});

async function simplifyText(text) {
  if (!model) {
    model = await loadModel();
  }

  const result = await model.predict(text);
  
  // The model returns a classification. We'll use the highest scoring class as our simplified text.
  const simplifiedText = result.classes.reduce((prev, current) => 
    (prev.score > current.score) ? prev : current
  ).className;

  return simplifiedText;
}

// Content script to simplify text on the page
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete') {
    chrome.tabs.sendMessage(tabId, { action: "simplifyPageText" });
  }
});