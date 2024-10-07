export function initAudioSupport() {
    function speakText(text) {
      const utterance = new SpeechSynthesisUtterance(text);
      window.speechSynthesis.speak(utterance);
    }
  
    const speakButton = document.createElement('button');
    speakButton.textContent = 'Read Aloud';
    speakButton.addEventListener('click', () => {
      const selectedText = window.getSelection().toString();
      speakText(selectedText);
    });
    document.body.appendChild(speakButton);
  }