const testWrapper = document.querySelector(".test-wrapper");
const testArea = document.querySelector("#test-area");
const originTextElement = document.querySelector("#origin-text p");
const resetButton = document.querySelector("#reset");
const theTimer = document.querySelector(".timer");
const ariaStatus = document.querySelector("#aria-status"); //Allows updates to the ARIA Accessibility

let timer = [0, 0, 0]; // [minutes, seconds, hundredths]
let interval = null;
let timerRunning = false;
let errorCount = 0;
let lastInput = "";
let countdownRunning = false;
let testComplete = false;

// Helper function
function getTotalSeconds() {
    return timer[0] * 60 + timer[1] + timer[2] / 100;
}

// ARIA Announce
function announce(message) {
    ariaStatus.textContent = "";
    
    // Small delay ensures screen readers re-trigger change
    setTimeout(() => {
        ariaStatus.textContent = message;
    }, 10);
}

// Randomized Text Support
const textArray = [
    "The quick brown fox jumps over the lazy dog.",
    "Typing fast requires both accuracy and practice.",
    "JavaScript allows dynamic interaction on web pages.",
    "Consistency is the key to improving typing speed.",
    "Small improvements each day lead to big results."
];

let originText = textArray[0];
originTextElement.innerHTML = originText;

function randomText() {
    let randomIndex = Math.floor(Math.random() * textArray.length);
    originText = textArray[randomIndex];
    originTextElement.innerHTML = originText;
}

// Local Storage
function saveScore() {
    let time = getTotalSeconds();

    let scores = JSON.parse(localStorage.getItem("scores")) || [];

    scores.push(time);

    // Sort fastest first
    scores.sort((a, b) => a - b);

    // Keep top 3
    scores = scores.slice(0, 3);

    localStorage.setItem("scores", JSON.stringify(scores));

    displayScores();
}

// Add leading zero to numbers 9 or below (purely for aesthetics):
function leadingZero(time) {
    return time <= 9 ? "0" + time : time;
}

// Run a standard minute/second/hundredths timer:
function runTimer() {
    let currentTime =
        leadingZero(timer[0]) + ":" +
        leadingZero(timer[1]) + ":" +
        leadingZero(timer[2]);

    theTimer.innerHTML = currentTime;

    timer[2]++;

    if (timer[2] === 100) {
        timer[2] = 0;
        timer[1]++;
    }

    if (timer[1] === 60) {
        timer[1] = 0;
        timer[0]++;
    }
}

// Display
function updateStats() {
    let totalChars = testArea.value.length;
    let seconds = getTotalSeconds();

    let wpm = 0;
    if (seconds > 0) {
        wpm = Math.round((totalChars / 5) / (seconds / 60));
    }

    document.getElementById("wpm").textContent = "WPM: " + wpm;
    document.getElementById("errors").textContent = "Errors: " + errorCount;
}

function displayScores() {
    let scores = JSON.parse(localStorage.getItem("scores")) || [];
    let list = document.getElementById("score-list");

    list.innerHTML = "";

    scores.forEach(score => {
        let li = document.createElement("li");
        li.textContent = score.toFixed(2) + " seconds";
        list.appendChild(li);
    });
}

// Match the text entered with the provided text on the page:
function spellCheck() {
    let textEntered = testArea.value;
    let originTextMatch = originText.substring(0, textEntered.length);

    if (textEntered !== originTextMatch && textEntered.length > lastInput.length) {
        errorCount++;
    }

    lastInput = textEntered;

    if (textEntered === originText && !testComplete) {
        testComplete = true;
        
        testWrapper.style.borderColor = "green";
        clearInterval(interval);
        timerRunning = false;

        saveScore();

        // Accessibility announcement
        announce("Test complete. Your time is " + theTimer.innerHTML);
    } else if (textEntered === originTextMatch) {
        testWrapper.style.borderColor = "blue";
    } else {
        testWrapper.style.borderColor = "red";
    }

    updateStats();
}

// Start the timer:
function start() {

}
// Starts the countdown
function startCountdown() {
    let count = 3;
    countdownRunning = true;

    testArea.disabled = true;

    const countdownEl = document.getElementById("countdown");
    countdownEl.textContent = count;

    announce("Typing test will start in 3 seconds");

    let countdownInterval = setInterval(() => {
        count--;

        if (count > 0) {
            countdownEl.textContent = count;
            announce("Starting in " + count);
        } else if (count === 0) {
            countdownEl.textContent = "GO!";
            announce("Go. Start typing now.");
        } else {
            clearInterval(countdownInterval);

            countdownEl.textContent = "";
            testArea.disabled = false;
            testArea.focus();

            interval = setInterval(runTimer, 10);
            timerRunning = true;
            countdownRunning = false;

            announce("Test started");
        }
    }, 1000);
}

// Reset everything:
function reset() {
    clearInterval(interval);
    interval = null;
    timer = [0, 0, 0];
    timerRunning = false;
    testComplete = false;

    testArea.value = "";
    theTimer.innerHTML = "00:00:00";
    testWrapper.style.borderColor = "grey";

    errorCount = 0;
    updateStats();

    randomText();

    announce("Test reset. Ready to begin.");
    
    startCountdown();
}

// Event listeners for keyboard input and the reset button:
testArea.addEventListener("keypress", () => {});
testArea.addEventListener("keyup", spellCheck);
resetButton.addEventListener("click", reset);

displayScores();