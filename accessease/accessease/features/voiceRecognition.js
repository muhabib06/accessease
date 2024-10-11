export function init() {
    const recognition = new webkitSpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
  
    recognition.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map(result => result[0].transcript)
        .join('');
      
      document.activeElement.value += transcript;
    };
  
    const voiceButton = document.createElement('button');
    voiceButton.textContent = 'Start Voice Input';
    voiceButton.className = 'accessease-button';
    voiceButton.addEventListener('click', () => recognition.start());
    document.body.appendChild(voiceButton);
  }