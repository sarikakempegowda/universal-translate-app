// Text Translation Functionality

let translationHistory = [];

// Initialize text translation page
function initTextTranslation() {
    // Load history from localStorage
    const savedHistory = localStorage.getItem('translationHistory');
    if (savedHistory) {
        translationHistory = JSON.parse(savedHistory);
        updateHistoryDisplay();
    }
    
    // Update character count
    document.getElementById('inputText').addEventListener('input', updateCharCount);
    updateCharCount();
}

// Update character count
function updateCharCount() {
    const text = document.getElementById('inputText').value;
    const charCount = text.length;
    document.getElementById('charCount').textContent = `${charCount} characters`;
}

// Swap languages
function swapLanguages() {
    const sourceLang = document.getElementById('sourceLanguage');
    const targetLang = document.getElementById('targetLanguage');
    
    const temp = sourceLang.value;
    sourceLang.value = targetLang.value;
    targetLang.value = temp;
    
    // If source was auto, set to detected language if available
    if (sourceLang.value === 'auto') {
        sourceLang.value = 'en'; // Default to English
    }
}

// Translate text
async function translateText() {
    const inputText = document.getElementById('inputText').value.trim();
    const sourceLang = document.getElementById('sourceLanguage').value;
    const targetLang = document.getElementById('targetLanguage').value;
    
    if (!inputText) {
        showNotification('Please enter text to translate', 'warning');
        return;
    }
    
    if (sourceLang === targetLang) {
        showNotification('Source and target languages are the same', 'warning');
        return;
    }
    
    // Show loading state
    const translateBtn = document.getElementById('translateBtn');
    const originalText = translateBtn.innerHTML;
    translateBtn.innerHTML = '<div class="loading"></div> Translating...';
    translateBtn.disabled = true;
    
    const startTime = Date.now();
    
    try {
        let detectedLang = sourceLang;
        
        // Auto-detect language if needed
        if (sourceLang === 'auto') {
            detectedLang = await detectLanguage(inputText);
            document.getElementById('detectedLang').textContent = `Language: ${getLanguageName(detectedLang)}`;
        }
        
        // Perform translation
        const translatedText = await performTranslation(inputText, detectedLang, targetLang);
        
        // Display results
        document.getElementById('outputText').textContent = translatedText;
        
        // Update translation info
        const endTime = Date.now();
        const translationTime = (endTime - startTime) / 1000;
        document.getElementById('translationTime').textContent = `Time: ${translationTime.toFixed(2)}s`;
        document.getElementById('translationQuality').textContent = 'Quality: Good';
        
        // Add to history
        addToTranslationHistory(inputText, translatedText, detectedLang, targetLang);
        
        showNotification('Translation completed!', 'success');
        
    } catch (error) {
        console.error('Translation error:', error);
        document.getElementById('outputText').textContent = 'Translation failed. Please try again.';
        showNotification('Translation failed: ' + error.message, 'error');
    } finally {
        // Reset button
        translateBtn.innerHTML = originalText;
        translateBtn.disabled = false;
    }
}

// Detect language
async function detectLanguage(text) {
    // Simulate language detection (in real app, use API)
    const languages = ['en', 'es', 'fr', 'de', 'it', 'pt', 'ru', 'zh', 'ja', 'ko', 'hi', 'ar'];
    
    // Simple keyword-based detection for demo
    const keywords = {
        'en': ['the', 'and', 'is', 'are', 'hello'],
        'es': ['el', 'la', 'y', 'hola', 'gracias'],
        'fr': ['le', 'la', 'et', 'bonjour', 'merci'],
        'de': ['der', 'die', 'das', 'und', 'hallo']
    };
    
    for (const [lang, words] of Object.entries(keywords)) {
        if (words.some(word => text.toLowerCase().includes(word))) {
            return lang;
        }
    }
    
    return 'en'; // Default to English
}

// Perform translation using API
async function performTranslation(text, fromLang, toLang) {
    try {
        // Try MyMemory Translation API first
        const response = await fetch(
            `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${fromLang}|${toLang}`
        );
        
        const data = await response.json();
        
        if (data.responseStatus === 200) {
            return data.responseData.translatedText;
        } else {
            throw new Error('Translation API failed');
        }
    } catch (error) {
        // Fallback: simple word substitution for demo
        return simulateTranslation(text, fromLang, toLang);
    }
}

// Simulate translation for demo
function simulateTranslation(text, fromLang, toLang) {
    const translations = {
        'en-es': {
            'hello': 'hola',
            'how are you': 'cómo estás',
            'thank you': 'gracias',
            'good morning': 'buenos días',
            'good night': 'buenas noches'
        },
        'en-fr': {
            'hello': 'bonjour',
            'how are you': 'comment allez-vous',
            'thank you': 'merci',
            'good morning': 'bonjour',
            'good night': 'bonne nuit'
        }
    };
    
    const key = `${fromLang}-${toLang}`;
    const translationMap = translations[key] || {};
    
    let translated = text.toLowerCase();
    for (const [english, foreign] of Object.entries(translationMap)) {
        translated = translated.replace(new RegExp(english, 'gi'), foreign);
    }
    
    return translated.charAt(0).toUpperCase() + translated.slice(1);
}

// Get language name from code
function getLanguageName(code) {
    const languages = {
        'en': 'English',
        'es': 'Spanish',
        'fr': 'French',
        'de': 'German',
        'it': 'Italian',
        'pt': 'Portuguese',
        'ru': 'Russian',
        'zh': 'Chinese',
        'ja': 'Japanese',
        'ko': 'Korean',
        'hi': 'Hindi',
        'ar': 'Arabic',
        'auto': 'Auto-detect'
    };
    
    return languages[code] || code;
}

// Add translation to history
function addToTranslationHistory(original, translated, fromLang, toLang) {
    const historyItem = {
        original,
        translated,
        fromLang,
        toLang,
        timestamp: new Date().toLocaleString()
    };
    
    translationHistory.unshift(historyItem);
    
    // Keep only last 20 items
    if (translationHistory.length > 20) {
        translationHistory.pop();
    }
    
    // Save to localStorage
    localStorage.setItem('translationHistory', JSON.stringify(translationHistory));
    
    updateHistoryDisplay();
}

// Update history display
function updateHistoryDisplay() {
    const historyContainer = document.getElementById('translationHistory');
    historyContainer.innerHTML = '';
    
    if (translationHistory.length === 0) {
        historyContainer.innerHTML = '<p class="no-history">No translation history yet.</p>';
        return;
    }
    
    translationHistory.forEach((item, index) => {
        const historyItem = document.createElement('div');
        historyItem.className = 'history-item';
        historyItem.innerHTML = `
            <div class="history-content">
                <div class="history-original">
                    <strong>${item.original}</strong>
                </div>
                <div class="history-translated">
                    ${item.translated}
                </div>
                <div class="history-meta">
                    ${getLanguageName(item.fromLang)} → ${getLanguageName(item.toLang)} • ${item.timestamp}
                </div>
            </div>
            <div class="history-actions">
                <button class="history-btn" onclick="useHistoryItem(${index})" title="Use this translation">
                    <i class="fas fa-redo"></i>
                </button>
                <button class="history-btn" onclick="deleteHistoryItem(${index})" title="Delete">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        historyContainer.appendChild(historyItem);
    });
}

// Use history item
function useHistoryItem(index) {
    const item = translationHistory[index];
    document.getElementById('inputText').value = item.original;
    document.getElementById('sourceLanguage').value = item.fromLang;
    document.getElementById('targetLanguage').value = item.toLang;
    document.getElementById('outputText').textContent = item.translated;
    
    showNotification('Translation loaded from history', 'info');
}

// Delete history item
function deleteHistoryItem(index) {
    translationHistory.splice(index, 1);
    localStorage.setItem('translationHistory', JSON.stringify(translationHistory));
    updateHistoryDisplay();
    showNotification('Translation deleted from history', 'info');
}

// Speak text
function speakText(text, lang) {
    if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = lang;
        speechSynthesis.speak(utterance);
    }
}

// Copy text to clipboard
async function copyToClipboard(text) {
    try {
        await navigator.clipboard.writeText(text);
        showNotification('Copied to clipboard!', 'success');
    } catch (error) {
        console.error('Copy failed:', error);
        showNotification('Copy failed', 'error');
    }
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', function() {
    initTextTranslation();
    
    // Event listeners
    document.getElementById('swapLanguages').addEventListener('click', swapLanguages);
    document.getElementById('translateBtn').addEventListener('click', translateText);
    document.getElementById('clearInput').addEventListener('click', function() {
        document.getElementById('inputText').value = '';
        updateCharCount();
    });
    document.getElementById('pasteText').addEventListener('click', async function() {
        try {
            const text = await navigator.clipboard.readText();
            document.getElementById('inputText').value = text;
            updateCharCount();
            showNotification('Text pasted!', 'success');
        } catch (error) {
            showNotification('Paste failed. Please paste manually.', 'error');
        }
    });
    document.getElementById('copyOutput').addEventListener('click', function() {
        const text = document.getElementById('outputText').textContent;
        if (text && text !== 'Translation will appear here...') {
            copyToClipboard(text);
        }
    });
    document.getElementById('speakInput').addEventListener('click', function() {
        const text = document.getElementById('inputText').value;
        const lang = document.getElementById('sourceLanguage').value;
        if (text) {
            speakText(text, lang === 'auto' ? 'en' : lang);
        }
    });
    document.getElementById('speakOutput').addEventListener('click', function() {
        const text = document.getElementById('outputText').textContent;
        const lang = document.getElementById('targetLanguage').value;
        if (text && text !== 'Translation will appear here...') {
            speakText(text, lang);
        }
    });
    
    // Preset buttons
    document.querySelectorAll('.preset-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.getElementById('inputText').value = this.getAttribute('data-text');
            updateCharCount();
        });
    });
});

// Morse Code Translation Functionality

const morseCode = {
    // Letters
    'A': '.-',      'B': '-...',    'C': '-.-.',    'D': '-..',
    'E': '.',       'F': '..-.',    'G': '--.',     'H': '....',
    'I': '..',      'J': '.---',    'K': '-.-',     'L': '.-..',
    'M': '--',      'N': '-.',      'O': '---',     'P': '.--.',
    'Q': '--.-',    'R': '.-.',     'S': '...',     'T': '-',
    'U': '..-',     'V': '...-',    'W': '.--',     'X': '-..-',
    'Y': '-.--',    'Z': '--..',
    
    // Numbers
    '0': '-----',   '1': '.----',   '2': '..---',   '3': '...--',
    '4': '....-',   '5': '.....',   '6': '-....',   '7': '--...',
    '8': '---..',   '9': '----.',
    
    // Punctuation
    '.': '.-.-.-',  ',': '--..--',  '?': '..--..',  "'": '.----.',
    '!': '-.-.--',  '/': '-..-.',   '(': '-.--.',   ')': '-.--.-',
    '&': '.-...',   ':': '---...',  ';': '-.-.-.',  '=': '-...-',
    '+': '.-.-.',   '-': '-....-',  '_': '..--.-',  '"': '.-..-.',
    '$': '...-..-', '@': '.--.-.',  ' ': '/'
};

let morseHistory = [];
let practiceActive = false;
let currentPracticeChar = '';

// Initialize Morse code page
function initMorsePage() {
    loadMorseHistory();
    generateReferenceCharts();
    setupEventListeners();
}

// Generate reference charts
function generateReferenceCharts() {
    generateLettersChart();
    generateNumbersChart();
    generatePunctuationChart();
}

function generateLettersChart() {
    const lettersGrid = document.querySelector('.ref-category.letters .morse-grid');
    lettersGrid.innerHTML = '';
    
    for (let char = 'A'.charCodeAt(0); char <= 'Z'.charCodeAt(0); char++) {
        const letter = String.fromCharCode(char);
        const code = morseCode[letter];
        
        const item = document.createElement('div');
        item.className = 'morse-item';
        item.innerHTML = `
            <span class="character">${letter}</span>
            <span class="code">${code}</span>
            <span class="meaning">${getLetterPhrase(letter)}</span>
        `;
        lettersGrid.appendChild(item);
    }
}

function generateNumbersChart() {
    const numbersGrid = document.querySelector('.ref-category.numbers .morse-grid');
    numbersGrid.innerHTML = '';
    
    for (let i = 0; i <= 9; i++) {
        const number = i.toString();
        const code = morseCode[number];
        
        const item = document.createElement('div');
        item.className = 'morse-item';
        item.innerHTML = `
            <span class="character">${number}</span>
            <span class="code">${code}</span>
            <span class="meaning">Number ${number}</span>
        `;
        numbersGrid.appendChild(item);
    }
}

function generatePunctuationChart() {
    const punctuationGrid = document.querySelector('.ref-category.punctuation .morse-grid');
    const punctuationChars = ['.', ',', '?', "'", '!', '/', '(', ')', ':', ';', '=', '+', '-', '"', '$', '@'];
    
    punctuationGrid.innerHTML = '';
    
    punctuationChars.forEach(char => {
        const code = morseCode[char];
        if (code) {
            const item = document.createElement('div');
            item.className = 'morse-item';
            item.innerHTML = `
                <span class="character">${char}</span>
                <span class="code">${code}</span>
                <span class="meaning">${getPunctuationName(char)}</span>
            `;
            punctuationGrid.appendChild(item);
        }
    });
}

// Helper functions for reference charts
function getLetterPhrase(letter) {
    const phrases = {
        'A': 'Alpha', 'B': 'Bravo', 'C': 'Charlie', 'D': 'Delta',
        'E': 'Echo', 'F': 'Foxtrot', 'G': 'Golf', 'H': 'Hotel',
        'I': 'India', 'J': 'Juliet', 'K': 'Kilo', 'L': 'Lima',
        'M': 'Mike', 'N': 'November', 'O': 'Oscar', 'P': 'Papa',
        'Q': 'Quebec', 'R': 'Romeo', 'S': 'Sierra', 'T': 'Tango',
        'U': 'Uniform', 'V': 'Victor', 'W': 'Whiskey', 'X': 'X-ray',
        'Y': 'Yankee', 'Z': 'Zulu'
    };
    return phrases[letter] || '';
}

function getPunctuationName(char) {
    const names = {
        '.': 'Period', ',': 'Comma', '?': 'Question Mark', "'": 'Apostrophe',
        '!': 'Exclamation', '/': 'Slash', '(': 'Left Parenthesis', ')': 'Right Parenthesis',
        ':': 'Colon', ';': 'Semicolon', '=': 'Equals', '+': 'Plus',
        '-': 'Hyphen', '"': 'Quotation Mark', '$': 'Dollar', '@': 'At Sign'
    };
    return names[char] || 'Punctuation';
}

// Encode text to Morse code
function encodeToMorse(text) {
    return text.toUpperCase().split('').map(char => {
        // Handle spaces
        if (char === ' ') return '/';
        
        // Return Morse code or original character if not found
        return morseCode[char] || char;
    }).join(' ');
}

// Decode Morse code to text
function decodeFromMorse(morse) {
    // Create reverse mapping
    const reverseMorse = {};
    Object.keys(morseCode).forEach(key => {
        reverseMorse[morseCode[key]] = key;
    });
    
    // Normalize Morse code input
    const normalizedMorse = morse
        .replace(/•/g, '.')  // Convert bullets to dots
        .replace(/–/g, '-')  // Convert en dashes to hyphens
        .replace(/\s+/g, ' ') // Normalize spaces
        .trim();
    
    return normalizedMorse.split(' ').map(code => {
        if (code === '/') return ' ';
        return reverseMorse[code] || `[${code}]`;
    }).join('');
}

// Play Morse code as sound
function playMorseCode(morse) {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const dotLength = 100; // ms
    const dashLength = 300; // ms
    const frequency = 600; // Hz
    
    let time = audioContext.currentTime;
    
    // Add a small delay before starting
    time += 0.1;
    
    for (const symbol of morse) {
        if (symbol === '.') {
            playBeep(audioContext, time, dotLength, frequency);
            time += dotLength / 1000 + 0.1; // Add space after dot
        } else if (symbol === '-') {
            playBeep(audioContext, time, dashLength, frequency);
            time += dashLength / 1000 + 0.1; // Add space after dash
        } else if (symbol === ' ') {
            time += 0.3; // Letter space
        } else if (symbol === '/') {
            time += 0.7; // Word space
        }
    }
}

function playBeep(audioContext, startTime, duration, frequency) {
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = frequency;
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0, startTime);
    gainNode.gain.linearRampToValueAtTime(0.3, startTime + 0.001);
    gainNode.gain.linearRampToValueAtTime(0.3, startTime + duration / 1000 - 0.001);
    gainNode.gain.linearRampToValueAtTime(0, startTime + duration / 1000);
    
    oscillator.start(startTime);
    oscillator.stop(startTime + duration / 1000);
}

// Morse code practice
function startPractice() {
    practiceActive = true;
    const level = document.getElementById('practiceLevel').value;
    currentPracticeChar = generatePracticeChar(level);
    
    document.getElementById('practicePrompt').textContent = `Listen to the Morse code for: ${currentPracticeChar}`;
    document.getElementById('practiceInput').disabled = false;
    document.getElementById('practiceInput').value = '';
    document.getElementById('practiceInput').focus();
    document.getElementById('practiceFeedback').textContent = '';
    
    // Play the Morse code for the character
    const morse = morseCode[currentPracticeChar];
    setTimeout(() => playMorseCode(morse), 500);
    
    document.getElementById('startPractice').textContent = 'Next Character';
}

function generatePracticeChar(level) {
    let characters = '';
    
    switch (level) {
        case 'easy':
            characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
            break;
        case 'medium':
            characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
            break;
        case 'hard':
            characters = Object.keys(morseCode).join('');
            break;
    }
    
    return characters[Math.floor(Math.random() * characters.length)];
}

function checkPracticeInput() {
    if (!practiceActive) return;
    
    const input = document.getElementById('practiceInput').value.trim();
    const correctMorse = morseCode[currentPracticeChar];
    
    if (input === correctMorse) {
        document.getElementById('practiceFeedback').textContent = 'Correct! 🎉';
        document.getElementById('practiceFeedback').style.color = '#28a745';
        
        // Auto-advance after short delay
        setTimeout(() => {
            if (practiceActive) {
                startPractice();
            }
        }, 1500);
    } else if (input.length >= correctMorse.length) {
        document.getElementById('practiceFeedback').textContent = `Incorrect. Try again! (Correct: ${correctMorse})`;
        document.getElementById('practiceFeedback').style.color = '#dc3545';
    }
}

// History functions
function loadMorseHistory() {
    const saved = localStorage.getItem('morseHistory');
    if (saved) {
        morseHistory = JSON.parse(saved);
        updateMorseHistoryDisplay();
    }
}

function addToMorseHistory(original, result, mode) {
    morseHistory.unshift({
        original,
        result,
        mode,
        timestamp: new Date().toLocaleString()
    });
    
    if (morseHistory.length > 20) {
        morseHistory.pop();
    }
    
    localStorage.setItem('morseHistory', JSON.stringify(morseHistory));
    updateMorseHistoryDisplay();
}

function updateMorseHistoryDisplay() {
    const container = document.getElementById('morseHistory');
    container.innerHTML = '';
    
    if (morseHistory.length === 0) {
        container.innerHTML = '<p class="no-history">No Morse code history yet.</p>';
        return;
    }
    
    morseHistory.forEach((item, index) => {
        const historyItem = document.createElement('div');
        historyItem.className = 'history-item';
        historyItem.innerHTML = `
            <div class="history-content">
                <div class="history-mode">${item.mode === 'encode' ? 'Encoded' : 'Decoded'}</div>
                <div class="history-original">${item.original}</div>
                <div class="history-result">${item.result}</div>
                <div class="history-time">${item.timestamp}</div>
            </div>
            <div class="history-actions">
                <button class="history-btn" onclick="useMorseHistoryItem(${index})" title="Use this">
                    <i class="fas fa-redo"></i>
                </button>
                <button class="history-btn" onclick="deleteMorseHistoryItem(${index})" title="Delete">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        container.appendChild(historyItem);
    });
}

function useMorseHistoryItem(index) {
    const item = morseHistory[index];
    
    if (item.mode === 'encode') {
        // Switch to encode mode
        switchMode('encode');
        document.getElementById('textInput').value = item.original;
    } else {
        // Switch to decode mode
        switchMode('decode');
        document.getElementById('morseInput').value = item.original;
    }
    
    showNotification('History item loaded', 'info');
}

function deleteMorseHistoryItem(index) {
    morseHistory.splice(index, 1);
    localStorage.setItem('morseHistory', JSON.stringify(morseHistory));
    updateMorseHistoryDisplay();
    showNotification('History item deleted', 'info');
}

// Mode switching
function switchMode(mode) {
    // Update tabs
    document.querySelectorAll('.mode-tab').forEach(tab => {
        tab.classList.toggle('active', tab.getAttribute('data-mode') === mode);
    });
    
    // Show/hide sections
    document.querySelectorAll('.encode-section, .decode-section').forEach(section => {
        section.classList.toggle('active', 
            (mode === 'encode' && section.classList.contains('encode-section')) ||
            (mode === 'decode' && section.classList.contains('decode-section'))
        );
    });
}

// Reference tab switching
function switchReferenceTab(category) {
    document.querySelectorAll('.ref-tab').forEach(tab => {
        tab.classList.toggle('active', tab.getAttribute('data-category') === category);
    });
    
    document.querySelectorAll('.ref-category').forEach(cat => {
        cat.classList.toggle('active', cat.classList.contains(category));
    });
}

// Setup event listeners
function setupEventListeners() {
    // Mode tabs
    document.querySelectorAll('.mode-tab').forEach(tab => {
        tab.addEventListener('click', function() {
            switchMode(this.getAttribute('data-mode'));
        });
    });
    
    // Reference tabs
    document.querySelectorAll('.ref-tab').forEach(tab => {
        tab.addEventListener('click', function() {
            switchReferenceTab(this.getAttribute('data-category'));
        });
    });
    
    // Encode button
    document.getElementById('encodeBtn').addEventListener('click', function() {
        const text = document.getElementById('textInput').value;
        if (!text.trim()) {
            showNotification('Please enter text to encode', 'warning');
            return;
        }
        
        const morse = encodeToMorse(text);
        displayResult(morse, 'encode');
        addToMorseHistory(text, morse, 'encode');
    });
    
    // Decode button
    document.getElementById('decodeBtn').addEventListener('click', function() {
        const morse = document.getElementById('morseInput').value;
        if (!morse.trim()) {
            showNotification('Please enter Morse code to decode', 'warning');
            return;
        }
        
        const text = decodeFromMorse(morse);
        displayResult(text, 'decode');
        addToMorseHistory(morse, text, 'decode');
    });
    
    // Play Morse button
    document.getElementById('playMorse').addEventListener('click', function() {
        const morse = document.getElementById('morseResult').textContent;
        if (morse && !morse.includes('Your Morse code translation')) {
            playMorseCode(morse);
        }
    });
    
    // Practice
    document.getElementById('startPractice').addEventListener('click', startPractice);
    document.getElementById('practiceInput').addEventListener('input', checkPracticeInput);
    
    // Clear buttons
    document.getElementById('clearEncode').addEventListener('click', function() {
        document.getElementById('textInput').value = '';
    });
    
    document.getElementById('clearDecode').addEventListener('click', function() {
        document.getElementById('morseInput').value = '';
    });
}

function displayResult(result, mode) {
    const resultElement = document.getElementById('morseResult');
    resultElement.innerHTML = `
        <div class="result-success">
            <i class="fas fa-check-circle"></i>
            <strong>${mode === 'encode' ? 'Morse Code' : 'Decoded Text'}:</strong>
            <div class="result-text">${result}</div>
        </div>
    `;
    
    // Enable action buttons
    document.getElementById('copyResult').disabled = false;
    document.getElementById('speakResult').disabled = false;
    document.getElementById('playMorse').disabled = mode !== 'encode';
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', initMorsePage);








// Scan & OCR Translation Functionality

let currentImage = null;
let cameraStream = null;

// Initialize scan page
function initScanPage() {
    setupEventListeners();
    setupDragAndDrop();
}

// Setup event listeners
function setupEventListeners() {
    // Upload method selection
    document.querySelectorAll('.upload-option').forEach(option => {
        option.addEventListener('click', function() {
            const method = this.getAttribute('data-method');
            switchUploadMethod(method);
        });
    });

    // File input
    document.getElementById('fileInput').addEventListener('change', handleFileSelect);
    
    // URL loading
    document.getElementById('loadUrl').addEventListener('click', loadImageFromUrl);
    document.getElementById('imageUrl').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') loadImageFromUrl();
    });

    // Camera controls
    document.getElementById('startCamera').addEventListener('click', startCamera);
    document.getElementById('stopCamera').addEventListener('click', stopCamera);
    document.getElementById('capturePhoto').addEventListener('click', capturePhoto);

    // OCR and translation
    document.getElementById('scanImage').addEventListener('click', performOCR);
    document.getElementById('translateText').addEventListener('click', performTranslation);
    document.getElementById('editText').addEventListener('click', enableTextEditing);
    document.getElementById('clearImage').addEventListener('click', clearAll);

    // Action buttons
    document.getElementById('copyTranslation').addEventListener('click', copyTranslation);
    document.getElementById('speakTranslation').addEventListener('click', speakTranslation);
}

// Switch between upload methods
function switchUploadMethod(method) {
    // Update active option
    document.querySelectorAll('.upload-option').forEach(opt => {
        opt.classList.toggle('active', opt.getAttribute('data-method') === method);
    });

    // Show/hide areas
    document.getElementById('uploadArea').classList.toggle('active', method === 'upload');
    document.getElementById('cameraArea').classList.toggle('active', method === 'camera');
    document.getElementById('urlArea').classList.toggle('active', method === 'url');

    // Stop camera if switching away from camera mode
    if (method !== 'camera' && cameraStream) {
        stopCamera();
    }
}

// Drag and drop setup
function setupDragAndDrop() {
    const dropZone = document.getElementById('dropZone');
    
    dropZone.addEventListener('dragover', function(e) {
        e.preventDefault();
        this.classList.add('dragover');
    });
    
    dropZone.addEventListener('dragleave', function() {
        this.classList.remove('dragover');
    });
    
    dropZone.addEventListener('drop', function(e) {
        e.preventDefault();
        this.classList.remove('dragover');
        
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            handleImageFile(files[0]);
        }
    });
    
    dropZone.addEventListener('click', function() {
        document.getElementById('fileInput').click();
    });
}

// Handle file selection
function handleFileSelect(e) {
    const file = e.target.files[0];
    if (file) {
        handleImageFile(file);
    }
}

// Handle image file
function handleImageFile(file) {
    // Check file type and size
    if (!file.type.startsWith('image/')) {
        showNotification('Please select an image file', 'error');
        return;
    }
    
    if (file.size > 5 * 1024 * 1024) { // 5MB limit
        showNotification('Image size must be less than 5MB', 'error');
        return;
    }
    
    const reader = new FileReader();
    reader.onload = function(e) {
        displayImagePreview(e.target.result);
        currentImage = e.target.result;
        document.getElementById('scanImage').disabled = false;
    };
    reader.readAsDataURL(file);
}

// Load image from URL
async function loadImageFromUrl() {
    const url = document.getElementById('imageUrl').value.trim();
    if (!url) {
        showNotification('Please enter an image URL', 'warning');
        return;
    }
    
    try {
        // Validate URL
        new URL(url);
        
        // Create image to check if it loads
        const img = new Image();
        img.onload = function() {
            displayImagePreview(url);
            currentImage = url;
            document.getElementById('scanImage').disabled = false;
            showNotification('Image loaded successfully', 'success');
        };
        img.onerror = function() {
            showNotification('Failed to load image from URL', 'error');
        };
        img.src = url;
        
    } catch (error) {
        showNotification('Please enter a valid URL', 'error');
    }
}

// Camera functions
async function startCamera() {
    try {
        cameraStream = await navigator.mediaDevices.getUserMedia({ 
            video: { facingMode: 'environment' } // Use back camera
        });
        
        const video = document.getElementById('cameraVideo');
        video.srcObject = cameraStream;
        
        document.getElementById('startCamera').disabled = true;
        document.getElementById('capturePhoto').disabled = false;
        document.getElementById('stopCamera').disabled = false;
        
        showNotification('Camera started', 'success');
        
    } catch (error) {
        console.error('Camera error:', error);
        showNotification('Failed to access camera: ' + error.message, 'error');
    }
}

function stopCamera() {
    if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
        cameraStream = null;
    }
    
    const video = document.getElementById('cameraVideo');
    video.srcObject = null;
    
    document.getElementById('startCamera').disabled = false;
    document.getElementById('capturePhoto').disabled = true;
    document.getElementById('stopCamera').disabled = true;
    
    showNotification('Camera stopped', 'info');
}

function capturePhoto() {
    const video = document.getElementById('cameraVideo');
    const canvas = document.getElementById('cameraCanvas');
    const context = canvas.getContext('2d');
    
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    const imageData = canvas.toDataURL('image/jpeg');
    displayImagePreview(imageData);
    currentImage = imageData;
    document.getElementById('scanImage').disabled = false;
    
    showNotification('Photo captured', 'success');
}

// Display image preview
function displayImagePreview(imageSrc) {
    const preview = document.getElementById('imagePreview');
    preview.innerHTML = `
        <img src="${imageSrc}" alt="Selected image">
        <div class="preview-overlay">
            <button onclick="zoomImage('${imageSrc}')" class="preview-btn">
                <i class="fas fa-search-plus"></i>
            </button>
        </div>
    `;
}

// Zoom image function
function zoomImage(src) {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content image-modal">
            <span class="close" onclick="this.parentElement.parentElement.remove()">&times;</span>
            <img src="${src}" alt="Zoomed image" style="max-width: 90vw; max-height: 90vh;">
        </div>
    `;
    document.body.appendChild(modal);
}

// Perform OCR using Tesseract.js
async function performOCR() {
    if (!currentImage) {
        showNotification('Please select an image first', 'warning');
        return;
    }
    
    const language = document.getElementById('ocrLanguage').value;
    const scanBtn = document.getElementById('scanImage');
    const originalText = scanBtn.innerHTML;
    
    // Show loading state
    scanBtn.innerHTML = '<div class="loading"></div> Scanning...';
    scanBtn.disabled = true;
    
    try {
        const result = await Tesseract.recognize(
            currentImage,
            language,
            { 
                logger: m => console.log(m),
                // Add custom configuration for better accuracy
                tessedit_pageseg_mode: Tesseract.PSM.SINGLE_BLOCK
            }
        );
        
        displayOCRResult(result.data.text);
        showNotification('Text extraction completed', 'success');
        
    } catch (error) {
        console.error('OCR error:', error);
        showNotification('OCR failed: ' + error.message, 'error');
        displayOCRResult('Error extracting text. Please try again with a clearer image.');
    } finally {
        // Reset button
        scanBtn.innerHTML = originalText;
        scanBtn.disabled = false;
    }
}

// Display OCR results
function displayOCRResult(text) {
    const resultElement = document.getElementById('ocrResult');
    resultElement.innerHTML = `
        <div class="ocr-text-content">
            <div class="ocr-stats">
                <span>Characters: ${text.length}</span>
                <span>Words: ${text.trim() ? text.trim().split(/\s+/).length : 0}</span>
            </div>
            <div class="ocr-text" contenteditable="false">
                ${text || 'No text detected'}
            </div>
        </div>
    `;
    
    // Enable translation button if text was found
    if (text && text.trim() && text !== 'No text detected') {
        document.getElementById('translateText').disabled = false;
    }
}

// Enable text editing
function enableTextEditing() {
    const textElement = document.querySelector('.ocr-text');
    if (textElement) {
        textElement.contentEditable = true;
        textElement.focus();
        showNotification('Text editing enabled. Click outside to save.', 'info');
        
        // Save on blur
        textElement.addEventListener('blur', function() {
            this.contentEditable = false;
            // Re-enable translation if text exists
            const text = this.textContent.trim();
            document.getElementById('translateText').disabled = !text;
        });
    }
}

// Perform translation
async function performTranslation() {
    const textElement = document.querySelector('.ocr-text');
    if (!textElement) {
        showNotification('No text to translate', 'warning');
        return;
    }
    
    const text = textElement.textContent.trim();
    if (!text) {
        showNotification('No text to translate', 'warning');
        return;
    }
    
    const targetLang = document.getElementById('translationLanguage').value;
    const translateBtn = document.getElementById('translateText');
    const originalText = translateBtn.innerHTML;
    
    // Show loading state
    translateBtn.innerHTML = '<div class="loading"></div> Translating...';
    translateBtn.disabled = true;
    
    try {
        const translatedText = await translateText(text, 'auto', targetLang);
        displayTranslationResult(translatedText);
        showNotification('Translation completed', 'success');
        
    } catch (error) {
        console.error('Translation error:', error);
        showNotification('Translation failed: ' + error.message, 'error');
        displayTranslationResult('Translation failed. Please try again.');
    } finally {
        // Reset button
        translateBtn.innerHTML = originalText;
        translateBtn.disabled = false;
    }
}

// Translate text using API
async function translateText(text, fromLang, toLang) {
    try {
        const response = await fetch(
            `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${fromLang}|${toLang}`
        );
        
        const data = await response.json();
        
        if (data.responseStatus === 200) {
            return data.responseData.translatedText;
        } else {
            throw new Error('Translation API failed');
        }
    } catch (error) {
        // Fallback simulation
        return `[Translated: ${text}] - This is a simulation. Real translation would occur here.`;
    }
}

// Display translation result
function displayTranslationResult(text) {
    const resultElement = document.getElementById('translationResult');
    resultElement.innerHTML = `
        <div class="translation-text-content">
            <div class="translation-text">${text}</div>
        </div>
    `;
    
    // Enable action buttons
    document.getElementById('copyTranslation').disabled = false;
    document.getElementById('speakTranslation').disabled = false;
}

// Copy translation to clipboard
async function copyTranslation() {
    const text = document.querySelector('.translation-text');
    if (text) {
        try {
            await navigator.clipboard.writeText(text.textContent);
            showNotification('Translation copied to clipboard', 'success');
        } catch (error) {
            showNotification('Copy failed', 'error');
        }
    }
}

// Speak translation
function speakTranslation() {
    const text = document.querySelector('.translation-text');
    if (text && 'speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(text.textContent);
        utterance.lang = document.getElementById('translationLanguage').value;
        speechSynthesis.speak(utterance);
    }
}

// Clear all
function clearAll() {
    currentImage = null;
    
    // Reset preview
    document.getElementById('imagePreview').innerHTML = `
        <div class="preview-placeholder">
            <i class="fas fa-image fa-3x"></i>
            <p>No image selected</p>
        </div>
    `;
    
    // Clear results
    document.getElementById('ocrResult').innerHTML = `
        <div class="result-placeholder">
            <i class="fas fa-font fa-2x"></i>
            <p>Extracted text will appear here</p>
        </div>
    `;
    
    document.getElementById('translationResult').innerHTML = `
        <div class="result-placeholder">
            <i class="fas fa-globe fa-2x"></i>
            <p>Translation will appear here</p>
        </div>
    `;
    
    // Disable buttons
    document.getElementById('scanImage').disabled = true;
    document.getElementById('translateText').disabled = true;
    document.getElementById('copyTranslation').disabled = true;
    document.getElementById('speakTranslation').disabled = true;
    
    // Stop camera if active
    if (cameraStream) {
        stopCamera();
    }
    
    showNotification('Cleared all', 'info');
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', initScanPage);



