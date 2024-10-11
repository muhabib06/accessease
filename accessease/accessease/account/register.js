document.getElementById('registerForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = document.getElementById('regEmail').value;
    const password = document.getElementById('regPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
  
    if (password !== confirmPassword) {
      alert("Passwords don't match!");
      return;
    }
  
    // Here you would typically send a request to your backend to register the user
    // For this example, we'll just store the email in chrome.storage
    chrome.storage.sync.set({userEmail: email}, () => {
      const successMessage = document.createElement('div');
      successMessage.className = 'success-message';
      successMessage.textContent = 'Registration successful! Redirecting to options page...';
      
      document.body.insertBefore(successMessage, document.body.firstChild);
      
      setTimeout(() => {
        window.location.href = '../popup.html'; // Redirect to popup after registration
      }, 2000);
    });
    
  });
  
  document.getElementById('loginLink').addEventListener('click', () => {
     window.location.href = 'login.html'; // Redirect to login page
  });