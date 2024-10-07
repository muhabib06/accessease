document.addEventListener('DOMContentLoaded', () => {
    chrome.storage.sync.get(['userEmail', 'disabilityProfile', 'featuresEnabled'], (result) => {
      if (result.userEmail) {
        showUserSection(result);
      } else {
        showLoginSection();
      }
    });
  });
  
  function showLoginSection() {
    document.getElementById('loginSection').style.display = 'block';
    document.getElementById('registerSection').style.display = 'none';
    document.getElementById('userSection').style.display = 'none';
  
    document.getElementById('loginButton').addEventListener('click', () => {
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;
  
      // Simulate authentication
      chrome.storage.sync.set({ userEmail: email }, () => {
        showUserSection({ userEmail: email });
      });
    });
  
    document.getElementById('showRegisterLink').addEventListener('click', (e) => {
      e.preventDefault();
      showRegisterSection();
    });
  }
  
  function showRegisterSection() {
    document.getElementById('loginSection').style.display = 'none';
    document.getElementById('registerSection').style.display = 'block';
    document.getElementById('userSection').style.display = 'none';
  
    document.getElementById('registerButton').addEventListener('click', () => {
      const email = document.getElementById('regEmail').value;
      const password = document.getElementById('regPassword').value;
      const confirmPassword = document.getElementById('confirmPassword').value;
  
      if (password !== confirmPassword) {
        alert("Passwords don't match!");
        return;
      }
  
      // Simulate registration
      chrome.storage.sync.set({ userEmail: email }, () => {
        showUserSection({ userEmail: email });
      });
    });
  
    document.getElementById('showLoginLink').addEventListener('click', (e) => {
      e.preventDefault();
      showLoginSection();
    });
  }
  
  function showUserSection(userData) {
    document.getElementById('loginSection').style.display = 'none';
    document.getElementById('registerSection').style.display = 'none';
    document.getElementById('userSection').style.display = 'block';
  
    document.getElementById('userInfo').textContent = `Logged in as: ${userData.userEmail}`;
    
    const featureToggle = document.getElementById('featureToggle');
    featureToggle.checked = userData.featuresEnabled;
    
    featureToggle.addEventListener('change', (e) => {
      chrome.storage.sync.set({ featuresEnabled: e.target.checked });
      
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        chrome.tabs.sendMessage(tabs[0].id, { action: "toggleFeatures", state: e.target.checked });
      });
    });
  
    document.getElementById('optionsButton').addEventListener('click', () => {
      chrome.runtime.openOptionsPage();
    });
  
    document.getElementById('logoutButton').addEventListener('click', () => {
      chrome.storage.sync.remove(['userEmail', 'disabilityProfile', 'featuresEnabled'], () => {
        showLoginSection();
      });
    });
  }