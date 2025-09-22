// Audio translation functionality

let isRecording = false;
let recognition;
let audioContext;
let analyser;

// Initialize audio recording
function initAudio() {
    if (!('webkitSpeechRecognition' in window)) {
        alert('Speech recognition not supported in this browser. Please use Chrome or Edge.');
        return;
    }

    recognition = new webkitSpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onstart = function() {
        isRecording = true;
        document.getElementById('recordBtn').innerHTML = '<i class="fas fa-stop"></i> Stop Recording';
        document.getElementById('recordBtn').style.background = '#dc3545';
        initAudioVisualizer();
    };

    recognition.onresult = function(event) {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
                finalTranscript += transcript;
            } else {
                interimTranscript += transcript;
            }
        }

        document.getElementById('originalText').textContent = finalTranscript || interimTranscript;
        
        if (finalTranscript) {
            const sourceLang = document.getElementById('sourceLang').value;
            const targetLang = document.getElementById('targetLang').value;
            
            if (sourceLang === 'animal') {
                identifyAnimalSound(finalTranscript);
            } else {
                translateText(finalTranscript, sourceLang, targetLang);
            }
        }
    };

    recognition.onerror = function(event) {
        console.error('Speech recognition error:', event.error);
        stopRecording();
    };

    recognition.onend = function() {
        stopRecording();
    };
}

// Start/stop recording
function toggleRecording() {
    if (!isRecording) {
        recognition.start();
    } else {
        recognition.stop();
    }
}

function stopRecording() {
    isRecording = false;
    document.getElementById('recordBtn').innerHTML = '<i class="fas fa-microphone"></i> Start Recording';
    document.getElementById('recordBtn').style.background = '';
    
    if (audioContext) {
        audioContext.close();
    }
}

// Audio visualizer
function initAudioVisualizer() {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    analyser = audioContext.createAnalyser();
    
    navigator.mediaDevices.getUserMedia({ audio: true })
        .then(stream => {
            const source = audioContext.createMediaStreamSource(stream);
            source.connect(analyser);
            visualizeAudio();
        })
        .catch(err => console.error('Error accessing microphone:', err));
}

function visualizeAudio() {
    const canvas = document.getElementById('audioCanvas');
    const ctx = canvas.getContext('2d');
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    function draw() {
        if (!isRecording) return;

        requestAnimationFrame(draw);
        analyser.getByteFrequencyData(dataArray);

        ctx.fillStyle = 'rgb(240, 240, 240)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        const barWidth = (canvas.width / bufferLength) * 2.5;
        let barHeight;
        let x = 0;

        for (let i = 0; i < bufferLength; i++) {
            barHeight = dataArray[i] / 2;

            ctx.fillStyle = `rgb(${barHeight + 100}, 50, 50)`;
            ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);

            x += barWidth + 1;
        }
    }

    draw();
}

// Animal sound identification
function identifyAnimalSound(text) {
    const animalSounds = {
        'woof': 'dog', 'bark': 'dog', 'ruff': 'dog',
        'meow': 'cat', 'purr': 'cat', 'hiss': 'cat',
        'moo': 'cow', 'low': 'cow',
        'roar': 'lion', 'growl': 'lion',
        'chirp': 'bird', 'tweet': 'bird', 'squawk': 'bird'
    };

    const sound = text.toLowerCase();
    const animal = animalSounds[sound] || 'unknown';
    
    document.getElementById('translatedText').textContent = 
        `Animal sound detected: ${sound}\nLikely animal: ${animal}`;
    document.getElementById('speakBtn').disabled = false;
}

// Play animal sound
function playAnimalSound(animal) {
    const sounds = {
        'dog': 'Woof! Woof!',
        'cat': 'Meow!',
        'cow': 'Moo!',
        'lion': 'Roar!'
    };
    
    const utterance = new SpeechSynthesisUtterance(sounds[animal]);
    speechSynthesis.speak(utterance);
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', function() {
    initAudio();
    document.getElementById('recordBtn').addEventListener('click', toggleRecording);
    
    document.getElementById('speakBtn').addEventListener('click', function() {
        const text = document.getElementById('translatedText').textContent;
        if (text && text !== 'Translation will appear here...') {
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = document.getElementById('targetLang').value;
            speechSynthesis.speak(utterance);
        }
    });
});