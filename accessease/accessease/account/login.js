document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    // Here you would typically send a request to your backend to authenticate
    // For this example, we'll just store the email in chrome.storage
    chrome.storage.sync.set({userEmail: email}, () => {
      window.location.href = '../options.html';
    });
  });