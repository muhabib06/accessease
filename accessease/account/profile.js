export function loadUserProfile() {
    return new Promise((resolve) => {
      chrome.storage.sync.get(['userEmail', 'disabilityProfile'], (result) => {
        resolve(result);
      });
    });
  }
  
  export function saveUserProfile(profile) {
    return new Promise((resolve) => {
      chrome.storage.sync.set({disabilityProfile: profile}, resolve);
    });
  }