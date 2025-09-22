// Sign Language Camera Translation

let stream = null;
let cameraActive = false;
const gestureHistory = [];

// Initialize camera
async function initCamera() {
    try {
        stream = await navigator.mediaDevices.getUserMedia({ 
            video: { 
                width: 640, 
                height: 480,
                facingMode: 'user' 
            } 
        });
        
        const cameraPreview = document.getElementById('cameraPreview');
        cameraPreview.innerHTML = '';
        
        const video = document.createElement('video');
        video.srcObject = stream;
        video.autoplay = true;
        video.playsInline = true;
        video.style.width = '100%';
        video.style.height = '100%';
        video.style.objectFit = 'cover';
        
        cameraPreview.appendChild(video);
        cameraActive = true;
        
        // Enable buttons
        document.getElementById('captureBtn').disabled = false;
        document.getElementById('stopCamera').disabled = false;
        document.getElementById('startCamera').disabled = true;
        
        showNotification('Camera started successfully!', 'success');
        
        // Start gesture detection if real-time is enabled
        if (document.getElementById('realtimeDetection').checked) {
            startRealtimeDetection(video);
        }
        
    } catch (error) {
        console.error('Error accessing camera:', error);
        showNotification('Error accessing camera: ' + error.message, 'error');
    }
}

// Stop camera
function stopCamera() {
    if (stream) {
        stream.getTracks().forEach(track => track.stop());
        stream = null;
    }
    
    cameraActive = false;
    const cameraPreview = document.getElementById('cameraPreview');
    cameraPreview.innerHTML = `
        <i class="fas fa-camera fa-3x" style="color: #666;"></i>
        <p>Camera preview will appear here</p>
    `;
    
    // Reset buttons
    document.getElementById('captureBtn').disabled = true;
    document.getElementById('stopCamera').disabled = true;
    document.getElementById('startCamera').disabled = false;
    
    showNotification('Camera stopped', 'info');
}

// Capture gesture from camera
function captureGesture() {
    if (!cameraActive) return;
    
    const video = document.querySelector('#cameraPreview video');
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    // Simulate gesture detection (in real app, this would use ML model)
    const gesture = detectGestureFromImage(canvas);
    displayGestureResult(gesture);
}

// Simulate gesture detection
function detectGestureFromImage(canvas) {
    // This is a simulation - real implementation would use TensorFlow.js or similar
    const gestures = [
        { name: 'Hello', meaning: 'Greeting', confidence: 0.85 },
        { name: 'Thank You', meaning: 'Gratitude', confidence: 0.78 },
        { name: 'Yes', meaning: 'Affirmation', confidence: 0.92 },
        { name: 'No', meaning: 'Negation', confidence: 0.88 },
        { name: 'Help', meaning: 'Assistance needed', confidence: 0.75 },
        { name: 'I Love You', meaning: 'Affection', confidence: 0.82 }
    ];
    
    // Random gesture for simulation
    const randomGesture = gestures[Math.floor(Math.random() * gestures.length)];
    return randomGesture;
}

// Display gesture detection results
function displayGestureResult(gesture) {
    document.getElementById('gestureResult').innerHTML = `
        <strong>${gesture.name}</strong><br>
        <span style="color: #666;">Confidence: ${Math.round(gesture.confidence * 100)}%</span>
    `;
    
    document.getElementById('gestureTranslation').innerHTML = `
        <strong>Meaning:</strong> ${gesture.meaning}<br>
        <span style="color: #666;">This gesture means "${gesture.meaning.toLowerCase()}"</span>
    `;
    
    document.getElementById('speakTranslation').disabled = false;
    
    // Add to history
    addToHistory(gesture);
}

// Real-time gesture detection simulation
function startRealtimeDetection(video) {
    let detectionInterval = setInterval(() => {
        if (!cameraActive || !document.getElementById('realtimeDetection').checked) {
            clearInterval(detectionInterval);
            return;
        }
        
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        // Simulate occasional detection
        if (Math.random() > 0.7) {
            const gesture = detectGestureFromImage(canvas);
            displayGestureResult(gesture);
        }
    }, 2000);
}

// Add gesture to history
function addToHistory(gesture) {
    const timestamp = new Date().toLocaleTimeString();
    gestureHistory.unshift({
        gesture: gesture.name,
        meaning: gesture.meaning,
        confidence: gesture.confidence,
        timestamp: timestamp
    });
    
    // Keep only last 10 items
    if (gestureHistory.length > 10) {
        gestureHistory.pop();
    }
    
    updateHistoryDisplay();
}

// Update history display
function updateHistoryDisplay() {
    const historyList = document.getElementById('historyList');
    historyList.innerHTML = '';
    
    gestureHistory.forEach((item, index) => {
        const historyItem = document.createElement('div');
        historyItem.className = 'history-item';
        historyItem.innerHTML = `
            <div class="history-gesture">${item.gesture}</div>
            <div class="history-meaning">${item.meaning}</div>
            <div class="history-confidence">${Math.round(item.confidence * 100)}%</div>
            <div class="history-time">${item.timestamp}</div>
        `;
        historyList.appendChild(historyItem);
    });
}

// Speak translation
function speakTranslation() {
    const translation = document.getElementById('gestureTranslation').textContent;
    if (translation && translation !== 'Translation will appear here...') {
        const utterance = new SpeechSynthesisUtterance(translation);
        speechSynthesis.speak(utterance);
    }
}

// Initialize camera page
document.addEventListener('DOMContentLoaded', function() {
    // Event listeners
    document.getElementById('startCamera').addEventListener('click', initCamera);
    document.getElementById('stopCamera').addEventListener('click', stopCamera);
    document.getElementById('captureBtn').addEventListener('click', captureGesture);
    document.getElementById('speakTranslation').addEventListener('click', speakTranslation);
    document.getElementById('saveGesture').addEventListener('click', function() {
        const currentGesture = document.getElementById('gestureResult').textContent;
        if (currentGesture && !currentGesture.includes('No gesture detected')) {
            showNotification('Gesture saved to history!', 'success');
        }
    });
    
    // Real-time detection toggle
    document.getElementById('realtimeDetection').addEventListener('change', function() {
        if (this.checked && cameraActive) {
            const video = document.querySelector('#cameraPreview video');
            if (video) {
                startRealtimeDetection(video);
            }
        }
    });
});







