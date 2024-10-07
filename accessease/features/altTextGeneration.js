let observer;

export function init() {
  observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === 'childList') {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE && node.tagName === 'IMG') {
            generateAltText(node);
          }
        });
      }
    });
  });

  observer.observe(document.body, { childList: true, subtree: true });

  // Process existing images
  document.querySelectorAll('img:not([alt])').forEach(generateAltText);
}

export function disable() {
  if (observer) {
    observer.disconnect();
  }
}

function generateAltText(img) {
  // Simulate API call for image recognition
  fetch(`https://api.example.com/image-recognition?url=${encodeURIComponent(img.src)}`)
    .then(response => response.json())
    .then(data => {
      img.alt = data.description;
    })
    .catch(error => {
      console.error('Error generating alt text:', error);
      img.alt = 'Image description unavailable';
    });
}