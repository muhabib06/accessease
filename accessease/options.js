document.addEventListener('DOMContentLoaded', () => {
  chrome.storage.sync.get(['userEmail', 'disabilityProfile'], (result) => {
    if (result.userEmail) {
      document.getElementById('userProfile').textContent = `Logged in as: ${result.userEmail}`;
      if (result.disabilityProfile) {
        document.getElementById('disabilityProfile').value = result.disabilityProfile;
      }
    } else {
      window.location.href = 'account/login.html';
    }
  });
});

document.getElementById('saveProfile').addEventListener('click', () => {
  const profile = document.getElementById('disabilityProfile').value;
  chrome.storage.sync.set({disabilityProfile: profile}, () => {
    const successMessage = document.createElement('div');
    successMessage.className = 'success-message';
    successMessage.textContent = 'Profile saved successfully!';
    document.body.insertBefore(successMessage, document.body.firstChild);
    
    setTimeout(() => {
      successMessage.remove();
    }, 3000);
  });
});