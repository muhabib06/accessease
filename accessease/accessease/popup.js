function showConfirmationMessage(message) {
  const confirmationElement = document.getElementById('confirmationMessage');
  confirmationElement.textContent = message;
  confirmationElement.style.display = 'block';
  setTimeout(() => {
    confirmationElement.style.display = 'none';
  }, 3000);
}

function showLoginSection() {
  document.getElementById('loginSection').style.display = 'block';
  document.getElementById('registerSection').style.display = 'none';
  document.getElementById('userSection').style.display = 'none';
  document.getElementById('optionsSection').style.display = 'none';

  document.getElementById('loginButton').addEventListener('click', handleLogin);
  document.getElementById('showRegisterLink').addEventListener('click', (e) => {
    e.preventDefault();
    showRegisterSection();
  });
}

function handleLogin() {
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  if (email.trim() === '') {
    alert('Please enter an email address');
    return;
  }

  chrome.storage.sync.set({ userEmail: email }, () => {
    showConfirmationMessage('Login successful!');
    setTimeout(() => {
      showUserSection({ userEmail: email });
    }, 1000);
  });
}

function showRegisterSection() {
  document.getElementById('loginSection').style.display = 'none';
  document.getElementById('registerSection').style.display = 'block';
  document.getElementById('userSection').style.display = 'none';
  document.getElementById('optionsSection').style.display = 'none';

  document.getElementById('registerButton').addEventListener('click', handleRegister);
  document.getElementById('showLoginLink').addEventListener('click', (e) => {
    e.preventDefault();
    showLoginSection();
  });
}

function handleRegister() {
  const email = document.getElementById('regEmail').value;
  const password = document.getElementById('regPassword').value;
  const confirmPassword = document.getElementById('confirmPassword').value;

  if (password !== confirmPassword) {
    alert("Passwords don't match!");
    return;
  }

  chrome.storage.sync.set({ userEmail: email }, () => {
    showConfirmationMessage('Registration successful!');
    setTimeout(() => {
      showUserSection({ userEmail: email });
    }, 1000);
  });
}

const featuresByProfile = {
  visual: ['highContrast', 'textToSpeech', 'fontSize', 'altTextGeneration'],
  auditory: ['keyboardNav'],
  motor: ['keyboardNav'],
  cognitive: ['fontSize', 'textToSpeech', 'textSimplification']
};

const featureInfo = {
  highContrast: {
    name: "High Contrast",
    description: "Increases the contrast of the page for better readability. Recommended for users with visual impairments.",
    recommendedFor: ["visual"]
  },
  textToSpeech: {
    name: "Text-to-Speech",
    description: "Reads out the selected text. Useful for users with visual impairments or reading difficulties.",
    recommendedFor: ["visual", "cognitive"]
  },
  fontSize: {
    name: "Larger Font Size",
    description: "Increases the font size of the page for easier reading. Recommended for users with visual impairments or reading difficulties.",
    recommendedFor: ["visual", "cognitive"]
  },
  keyboardNav: {
    name: "Enhanced Keyboard Navigation",
    description: "Improves keyboard navigation on the page. Useful for users who have difficulty using a mouse.",
    recommendedFor: ["motor"]
  },
  colorBlind: {
    name: "Color Blind Friendly Mode",
    description: "Adjusts colors on the page to be more distinguishable for color blind users.",
    recommendedFor: ["visual"]
  },
  textSimplification: {
    name: "Text Simplification",
    description: "Simplifies complex text on the page for easier understanding. Useful for users with cognitive impairments or reading difficulties.",
    recommendedFor: ["cognitive"],
    options: [
      { value: 'short', label: "Short" },
      { value: 'medium', label: "Medium" },
      { value: 'long', label: "Long" }
    ]
  },
  altTextGeneration: {
    name: "Alt Text Generation",
    description: "Generates alternative text for images that lack descriptions. Beneficial for users with visual impairments.",
    recommendedFor: ["visual"]
  }
};

function showUserSection(userData) {
  document.getElementById('loginSection').style.display = 'none';
  document.getElementById('registerSection').style.display = 'none';
  document.getElementById('userSection').style.display = 'block';
  document.getElementById('optionsSection').style.display = 'none';
  
  document.getElementById('userInfo').textContent = `Logged in as: ${userData.userEmail}`;
  document.getElementById('profileType').textContent = `Profile: ${userData.disabilityProfile || 'Not set'}`;
  
  initializeFeatureToggles(userData.disabilityProfile);

  document.getElementById('optionsButton').addEventListener('click', showOptionsSection);
  document.getElementById('logoutButton').addEventListener('click', handleLogout);

  const additionalFeaturesContainer = document.getElementById('additionalFeaturesContainer');
  if (userData.disabilityProfile) {
    additionalFeaturesContainer.style.display = 'block';
    document.getElementById('addFeatureButton').addEventListener('click', addAdditionalFeature);
  } else {
    additionalFeaturesContainer.style.display = 'none';
  }
}

async function initializeFeatureToggles(profile) {
  const featuresContainer = document.getElementById('featuresContainer');
  featuresContainer.innerHTML = '';

  const features = Object.keys(featureInfo);
  
  for (let feature of features) {
    const featureContainer = document.createElement('div');
    featureContainer.className = 'feature-container';
    featureContainer.id = `${feature}Container`;

    const featureName = document.createElement('span');
    featureName.className = 'feature-name';
    featureName.textContent = featureInfo[feature].name;

    const infoButton = document.createElement('button');
    infoButton.className = 'feature-info';
    infoButton.textContent = 'i';
    infoButton.onclick = (e) => {
      e.stopPropagation();
      showFeatureInfo(feature);
    };

    featureContainer.appendChild(featureName);
    featureContainer.appendChild(infoButton);

    if (feature === 'textSimplification') {
      const levelSelect = document.createElement('select');
      levelSelect.className = 'simplification-level';
      featureInfo[feature].options.forEach(option => {
        const optionElement = document.createElement('option');
        optionElement.value = option.value;
        optionElement.textContent = option.label;
        levelSelect.appendChild(optionElement);
      });
      featureContainer.appendChild(levelSelect);

      levelSelect.addEventListener('change', (e) => {
        updateFeature(feature, true, e.target.value);
      });
    }

    featuresContainer.appendChild(featureContainer);

    featureContainer.addEventListener('click', () => {
      const isEnabled = !featureContainer.classList.contains('enabled');
      updateFeature(feature, isEnabled);
    });
  }

  chrome.storage.sync.get('features', (data) => {
    const savedFeatures = data.features || {};
    for (let feature in savedFeatures) {
      updateFeatureUI(feature, savedFeatures[feature]);
    }
  });

  if (profile && featuresByProfile[profile]) {
    featuresByProfile[profile].forEach(feature => {
      const container = document.getElementById(`${feature}Container`);
      if (container) {
        container.style.display = 'flex';
        updateFeature(feature, true);
      }
    });
  }

  const canSummarize = await ai.summarizer.capabilities();
  const summarizationAvailable = canSummarize && canSummarize.available !== 'no';
  if (!summarizationAvailable) {
    const container = document.getElementById('textSimplificationContainer');
    if (container) {
      container.style.display = 'none';
    }
    showConfirmationMessage("Text simplification is not available on this device.");
  }
}

async function updateFeature(feature, isEnabled, level = 'medium') {
  updateFeatureUI(feature, isEnabled);

  chrome.storage.sync.get('features', async (data) => {
    const features = data.features || {};
    if (feature === 'textSimplification') {
      features[feature] = { enabled: isEnabled, level: level };
    } else {
      features[feature] = isEnabled;
    }
    chrome.storage.sync.set({ features: features }, async () => {
      if (feature === 'textSimplification' && isEnabled) {
        try {
          const summarizer = await ai.summarizer.create();
          if (summarizer) {
            chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
              chrome.tabs.sendMessage(tabs[0].id, { 
                action: "simplifyPageText", 
                summarizer: summarizer,
                level: level
              });
            });
          } else {
            showConfirmationMessage("Text simplification is not available on this device.");
          }
        } catch (error) {
          console.error("Error initializing summarizer:", error);
          showConfirmationMessage("Failed to initialize text simplification.");
        }
      } else {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
          chrome.tabs.sendMessage(tabs[0].id, { action: "toggleFeatures", features: features });
        });
      }
      showConfirmationMessage(`${featureInfo[feature].name} ${isEnabled ? 'enabled' : 'disabled'}`);
    });
  });
}

function updateFeatureUI(feature, isEnabled) {
  const container = document.getElementById(`${feature}Container`);
  if (container) {
    container.classList.toggle('enabled', isEnabled);
  }
}

function showFeatureInfo(feature) {
  const modal = document.createElement('div');
  modal.className = 'info-modal';
  
  const modalContent = document.createElement('div');
  modalContent.className = 'modal-content';
  
  const closeButton = document.createElement('span');
  closeButton.className = 'close-modal';
  closeButton.innerHTML = '&times;';
  closeButton.onclick = () => modal.style.display = 'none';
  
  const title = document.createElement('h2');
  title.textContent = featureInfo[feature].name;
  
  const description = document.createElement('p');
  description.textContent = featureInfo[feature].description;
  
  const recommendedFor = document.createElement('p');
  recommendedFor.textContent = `Recommended for: ${featureInfo[feature].recommendedFor.join(', ')}`;
  
  modalContent.appendChild(closeButton);
  modalContent.appendChild(title);
  modalContent.appendChild(description);
  modalContent.appendChild(recommendedFor);
  
  modal.appendChild(modalContent);
  document.body.appendChild(modal);
  
  modal.style.display = 'block';
  
  window.onclick = (event) => {
    if (event.target == modal) {
      modal.style.display = 'none';
    }
  }
}

function addAdditionalFeature() {
  const select = document.getElementById('additionalFeatures');
  const feature = select.value;
  if (feature) {
    const container = document.getElementById(`${feature}Container`);
    if (container) {
      container.style.display = 'flex';
      container.classList.add('enabled');
      updateFeature(feature, true);
    }
    select.value = '';
  }
}

function showOptionsSection() {
  document.getElementById('userSection').style.display = 'none';
  document.getElementById('optionsSection').style.display = 'block';

  chrome.storage.sync.get('disabilityProfile', (result) => {
    if (result.disabilityProfile) {
      document.getElementById('disabilityProfile').value = result.disabilityProfile;
    }
  });

  document.getElementById('saveProfile').addEventListener('click', handleSaveProfile);
  document.getElementById('backToUser').addEventListener('click', () => {
    chrome.storage.sync.get(['userEmail', 'disabilityProfile', 'features'], showUserSection);
  });
}

function handleSaveProfile() {
  const profile = document.getElementById('disabilityProfile').value;
  chrome.storage.sync.set({ disabilityProfile: profile }, () => {
    showConfirmationMessage('Profile saved successfully!');
    setTimeout(() => {
      chrome.storage.sync.get(['userEmail', 'disabilityProfile'], (result) => {
        const features = {};
        if (featuresByProfile[profile]) {
          featuresByProfile[profile].forEach(feature => {
            features[feature] = true;
          });
        }
        chrome.storage.sync.set({ features: features }, () => {
          showUserSection(result);
        });
      });
    }, 1000);
  });
}

function handleLogout() {
  chrome.storage.sync.remove(['userEmail', 'disabilityProfile', 'features'], () => {
    showConfirmationMessage('Logged out successfully!');
    setTimeout(() => {
      showLoginSection();
    }, 1000);
  });
}

document.addEventListener('DOMContentLoaded', () => {
  chrome.storage.sync.get(['userEmail', 'disabilityProfile', 'features'], (result) => {
    if (result.userEmail) {
      showUserSection(result);
    } else {
      showLoginSection();
    }
  });
});