// Main JavaScript for Universal Translate Pro

// Navigation function
function navigateTo(page) {
    window.location.href = page;
}

// Show settings modal
function showSettings() {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.style.display = 'block';
    modal.innerHTML = `
        <div class="modal-content">
            <span class="close" onclick="this.parentElement.parentElement.style.display='none'">&times;</span>
            <h2>Settings</h2>
            <div class="settings-content">
                <div class="setting-group">
                    <label for="inputLang">Input Language:</label>
                    <select id="inputLang">
                        <option value="en">English</option>
                        <option value="es">Spanish</option>
                        <option value="fr">French</option>
                        <option value="de">German</option>
                        <option value="hi">Hindi</option>
                    </select>
                </div>
                <div class="setting-group">
                    <label for="outputLang">Output Language:</label>
                    <select id="outputLang">
                        <option value="en">English</option>
                        <option value="es">Spanish</option>
                        <option value="fr">French</option>
                        <option value="de">German</option>
                        <option value="hi">Hindi</option>
                    </select>
                </div>
                <button onclick="saveSettings()" class="action-btn">Save Settings</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
}

// Quick audio translation
function startQuickAudio() {
    if (!('webkitSpeechRecognition' in window)) {
        alert('Speech recognition not supported in this browser. Try Chrome or Edge.');
        return;
    }
    
    const recognition = new webkitSpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';
    
    recognition.onstart = function() {
        showNotification('Listening... Speak now!', 'info');
    };
    
    recognition.onresult = function(event) {
        const transcript = event.results[0][0].transcript;
        showNotification(`You said: ${transcript}`, 'success');
        // Here you would call translation API
        translateText(transcript, 'en', 'es');
    };
    
    recognition.onerror = function(event) {
        showNotification('Error occurred in recognition: ' + event.error, 'error');
    };
    
    recognition.start();
}

// Quick text translation
function startQuickText() {
    const text = prompt('Enter text to translate:');
    if (text) {
        translateText(text, 'en', 'es');
    }
}

// Text translation function
async function translateText(text, fromLang, toLang) {
    showNotification('Translating...', 'info');
    
    try {
        // Using free MyMemory Translation API
        const response = await fetch(
            `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${fromLang}|${toLang}`
        );
        
        const data = await response.json();
        
        if (data.responseStatus === 200) {
            const translatedText = data.responseData.translatedText;
            showNotification(`Translated: ${translatedText}`, 'success');
            speakText(translatedText, toLang);
        } else {
            throw new Error('Translation failed');
        }
    } catch (error) {
        showNotification('Translation error: ' + error.message, 'error');
    }
}

// Text-to-speech function
function speakText(text, lang) {
    if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = lang;
        speechSynthesis.speak(utterance);
    }
}

// Notification system
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 1rem;
        border-radius: 5px;
        color: white;
        z-index: 10000;
        max-width: 300px;
        animation: slideIn 0.3s ease;
    `;
    
    const colors = {
        info: '#667eea',
        success: '#28a745',
        error: '#dc3545',
        warning: '#ffc107'
    };
    
    notification.style.background = colors[type] || colors.info;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Add CSS animations for notifications
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`;
document.head.appendChild(style);

// Save settings to localStorage
function saveSettings() {
    const inputLang = document.getElementById('inputLang').value;
    const outputLang = document.getElementById('outputLang').value;
    
    localStorage.setItem('inputLanguage', inputLang);
    localStorage.setItem('outputLanguage', outputLang);
    
    showNotification('Settings saved!', 'success');
    document.querySelector('.modal').style.display = 'none';
}

// Load settings from localStorage
function loadSettings() {
    const inputLang = localStorage.getItem('inputLanguage') || 'en';
    const outputLang = localStorage.getItem('outputLanguage') || 'es';
    
    if (document.getElementById('inputLang')) {
        document.getElementById('inputLang').value = inputLang;
        document.getElementById('outputLang').value = outputLang;
    }
}

// Morse code translation functions
const morseCode = {
    'A': '.-', 'B': '-...', 'C': '-.-.', 'D': '-..', 'E': '.', 'F': '..-.', 
    'G': '--.', 'H': '....', 'I': '..', 'J': '.---', 'K': '-.-', 'L': '.-..', 
    'M': '--', 'N': '-.', 'O': '---', 'P': '.--.', 'Q': '--.-', 'R': '.-.', 
    'S': '...', 'T': '-', 'U': '..-', 'V': '...-', 'W': '.--', 'X': '-..-', 
    'Y': '-.--', 'Z': '--..', ' ': '/', '1': '.----', '2': '..---', '3': '...--', 
    '4': '....-', '5': '.....', '6': '-....', '7': '--...', '8': '---..', 
    '9': '----.', '0': '-----'
};

function textToMorse(text) {
    return text.toUpperCase().split('').map(char => morseCode[char] || char).join(' ');
}

function morseToText(morse) {
    const reverseMorse = {};
    Object.keys(morseCode).forEach(key => {
        reverseMorse[morseCode[key]] = key;
    });
    
    return morse.split(' ').map(code => reverseMorse[code] || code).join('');
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', function() {
    loadSettings();
    console.log('Universal Translate Pro initialized!');
});