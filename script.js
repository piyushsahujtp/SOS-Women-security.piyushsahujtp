const video = document.getElementById('webcam');
const alertBox = document.getElementById('alert-box');
const darkModeToggle = document.getElementById('dark-mode-toggle');
const cameraToggle = document.getElementById('camera-toggle');
const stopAlarmButton = document.getElementById('stop-alarm');
const matrixLevels = document.querySelectorAll('.matrix-level');
let darkMode = false;
let cameraOn = true;
let audio;

// Load and setup the model
async function loadModel() {
    const model = await tmImage.load(
        'https://teachablemachine.withgoogle.com/models/uW6WyXpXj/model.json',
        'https://teachablemachine.withgoogle.com/models/uW6WyXpXj/metadata.json'
    );
    return model;
}

async function setupWebcam() {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    video.srcObject = stream;
    video.addEventListener('loadeddata', async () => {
        const model = await loadModel();
        while (cameraOn) {
            const predictions = await model.predict(video);
            handlePredictions(predictions);
            await tf.nextFrame();
        }
    });
}

function handlePredictions(predictions) {
    if (predictions[0].probability > 0.9) {
        triggerAlarm(predictions[0].probability);
    }
}

function triggerAlarm(probability) {
    alertBox.style.display = 'block';
    if (!audio) {
        audio = new Audio('https://example.com/alert-sound.mp3');  // Replace with actual sound URL
    }
    audio.loop = true;
    audio.play();
    updateMatrix(probability);
}

function stopAlarm() {
    alertBox.style.display = 'none';
    if (audio) {
        audio.pause();
        audio.currentTime = 0;
    }
}

function updateMatrix(probability) {
    matrixLevels.forEach((level, index) => {
        if (probability > (index + 1) * 0.25) {
            level.style.backgroundColor = level.classList.contains('level-4') ? 'red' : 'orange';
        } else {
            level.style.backgroundColor = 'grey';
        }
    });
}

darkModeToggle.addEventListener('click', () => {
    darkMode = !darkMode;
    document.body.classList.toggle('dark-mode', darkMode);
});

cameraToggle.addEventListener('click', () => {
    cameraOn = !cameraOn;
    if (cameraOn) {
        setupWebcam();
        cameraToggle.textContent = 'Turn Camera Off';
    } else {
        video.srcObject.getTracks().forEach(track => track.stop());
        cameraToggle.textContent = 'Turn Camera On';
    }
});

stopAlarmButton.addEventListener('click', stopAlarm);

setupWebcam();
