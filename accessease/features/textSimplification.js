export function initTextSimplification() {
    function simplifyText(text) {
      // This is a basic simplification. In a real scenario, you'd use more advanced NLP techniques.
      return text.split('.').map(sentence => {
        return sentence.split(' ').slice(0, 10).join(' ');
      }).join('. ');
    }
  
    const simplifyButton = document.createElement('button');
    simplifyButton.textContent = 'Simplify Text';
    simplifyButton.addEventListener('click', () => {
      const selection = window.getSelection();
      const range = selection.getRangeAt(0);
      const simplifiedText = simplifyText(selection.toString());
      range.deleteContents();
      range.insertNode(document.createTextNode(simplifiedText));
    });
    document.body.appendChild(simplifyButton);
  }