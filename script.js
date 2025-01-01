let currentRoom = 0;
let timer;
let score = 0; // Initialize the score
let hintsUsed = 0; // Track hints used per puzzle
let totalHintsUsed = 0; // Track total hints for the entire game
let timePenalty = false; // Track if the player ran out of time

const rooms = [
    // Room 1: Decode the Ransom Note
    {
        story: "You wake up in a dimly lit room. A ransom note lies on the table with a chilling message.",
        puzzle: function () {
            document.getElementById("puzzle-container").innerHTML = `
                <p>The note reads: 'Gsrh nbz sfig blf?'</p>
                <input type="text" id="cipher-input" placeholder="Enter decoded message">
                <button id="submit-button" onclick="checkCipher()">Submit</button>
            `;
            startTimer(90); // Start the timer for 90 seconds
        },
        solution: "This may hurt you?",
        hint: "Hint: The letters are reversed across the alphabet. Think A↔Z, B↔Y.",
    },
    // Room 2: Locked Laptop
    {
        story: "A laptop sits on the desk. A file named 'Top Secret' is locked with a password.",
        puzzle: function () {
            document.getElementById("puzzle-container").innerHTML = `
                <p>The file asks: 'Decrypt the password: Uifsf jt b tfdsfu dpef.'</p>
                <input type="text" id="cipher-input-2" placeholder="Enter password">
                <button id="submit-button" onclick="checkSecondCipher()">Submit</button>
            `;
            startTimer(90); // Start the timer for 90 seconds
        },
        solution: "there is a secret code",
        hint: "Hint: Each letter has shifted forward by one. Reverse this process.",
    },
    // Room 3: Chilling Riddle
    {
        story: "A sealed box sits in the corner with a numeric lock. A chilling riddle is engraved on it.",
        puzzle: function () {
            document.getElementById("puzzle-container").innerHTML = `
                <p>
                    "I am an odd number. Take away one letter and I become even.
                    Use me to unlock the box. Input the numbers in reverse order."
                </p>
                <input type="text" id="riddle-input" placeholder="Enter 4-digit code">
                <button id="submit-button" onclick="checkRiddle()">Submit</button>
            `;
            startTimer(120); // Start the timer for 120 seconds
        },
        solution: "7531", // Reverse of 1357 (Odd numbers)
        hint: "Hint: Think about the word 'odd' and how one letter changes its meaning.",
    },
    // Room 4: Decipher the Murderer's Map
    {
        story: "Pinned to the wall is a blood-stained map. The map has cryptic coordinates and a warning:",
        puzzle: function () {
            document.getElementById("puzzle-container").innerHTML = `
                <p>
                    "The killer’s location is hidden within these coordinates. 
                    Decode them to find the location."
                </p>
                <pre style="font-weight: bold;">
                    (1, 3), (2, 5), (3, 1), (4, 7)
                </pre>
                <table style="margin: 10px auto; border-collapse: collapse; font-weight: bold;">
                    <tr>
                        <td>A</td><td>B</td><td>C</td><td>D</td><td>E</td><td>F</td><td>G</td>
                    </tr>
                    <tr>
                        <td>H</td><td>I</td><td>J</td><td>K</td><td>L</td><td>M</td><td>N</td>
                    </tr>
                    <tr>
                        <td>O</td><td>P</td><td>Q</td><td>R</td><td>S</td><td>T</td><td>U</td>
                    </tr>
                    <tr>
                        <td>V</td><td>W</td><td>X</td><td>Y</td><td>Z</td><td>A</td><td>B</td>
                    </tr>
                </table>
                <input type="text" id="map-answer-input" placeholder="Enter the hidden location">
                <button id="submit-button" onclick="checkMapAnswer()">Submit</button>
            `;
            startTimer(150); // Start the timer for 150 seconds
        },
        solution: "city",
        hint: "Hint: Match the coordinates to the letters on the grid. For example, (1, 3) is the 3rd letter in the 1st row.",
    },
    // Room 5: Crack the Safe
    {
        story: "A large steel safe stands in the room. The lock has a strange pattern.",
        puzzle: function () {
            document.getElementById("puzzle-container").innerHTML = `
                <p>
                    "Safe Combination: The sum of two numbers equals the number directly below them. 
                    Solve for the numbers at the top."
                </p>
                <pre>
                       ?   ?
                     10   15
                  25   35   50
                </pre>
                <input type="text" id="safe-input" placeholder="Enter the two numbers">
                <button id="submit-button" onclick="checkSafe()">Submit</button>
            `;
            startTimer(150); // Start the timer for 150 seconds
        },
        solution: "5,10",
        hint: "Hint: Work backward from the sum at the bottom to the top numbers.",
    },
    // Room 6: Final Maze
    {
        story: "The final door is a logic maze. Solve the puzzle to escape.",
        puzzle: function () {
            document.getElementById("puzzle-container").innerHTML = `
                <p>
                    "You must travel from Start (S) to End (E). You can only pass through numbers divisible by 3."
                </p>
                <pre>
                    S  12  7   9
                    5  15  10  18
                    11 21  6   E
                </pre>
                <input type="text" id="maze-input" placeholder="Enter the correct path (e.g., S-12-15-21-E)">
                <button id="submit-button" onclick="checkMaze()">Submit</button>
            `;
            startTimer(180); // Start the timer for 180 seconds
        },
        solution: "s-12-15-21-6-e",
        hint: "Hint: Numbers divisible by 3 form the correct path.",
    },
];

function startGame() {
    const startButton = document.getElementById("next-button");
    const controlButtons = document.getElementById("control-buttons");
    const scoreContainer = document.getElementById("score-container");
    const timerContainer = document.getElementById("timer-container");

    // Hide Start button and show game controls
    startButton.style.display = "none";
    controlButtons.style.display = "block"; // Show Hint and Reset buttons
    scoreContainer.style.display = "block"; // Show the score display
    timerContainer.style.display = "flex"; // Show the timer

    // Clear the puzzle container (ensures no leftover elements from initialization)
    document.getElementById("puzzle-container").innerHTML = "";

    playBackgroundMusic(); // Start background music after user interaction
    
    nextRoom(); // Start the game
}

const villainMessages = [
    "You think you’re smart enough to escape? Let’s see...",
    "Ah, you’ve made it this far? Try cracking this one!",
    "I’m impressed, but you won’t solve my ultimate puzzle.",
    "You’re wasting time, Detective. Tick-tock, tick-tock...",
    "You’ll never get past this. Turn back while you can.",
    "This is it, Detective. Your final challenge!"
];

function nextRoom() {
    if (currentRoom < rooms.length) {
        clearInterval(timer); // Clear previous timer
        hintsUsed = 0; // Reset hints
        hintUsed = false; // Reset hintUsed flag
        timePenalty = false; // Reset time penalty

        // Clear the puzzle container
        document.getElementById("puzzle-container").innerHTML = "";

        document.getElementById("story").innerHTML = `
            <p>${rooms[currentRoom].story}</p>
            <p><strong>Message from the Villain:</strong> ${villainMessages[currentRoom]}</p>
        `;
        rooms[currentRoom].puzzle();
        currentRoom++;
    } else {
        clearInterval(timer);
        endGame();
    }
}

function endGame() {
    document.getElementById("story").innerHTML = `
        <p>Congratulations, Detective! You’ve escaped the villain’s clutches.</p>
        <p>Your final score: <strong>${score}</strong></p>
        <button onclick="restartGame()">Restart</button>
        <button onclick="closeGame()">Close</button>
    `;
    document.getElementById("puzzle-container").innerHTML = "";
    document.getElementById("control-buttons").style.display = "none";
}

function checkCipher() {
    const input = document.getElementById("cipher-input").value.toLowerCase();
    if (input === rooms[0].solution) {
        playSound("unlock"); // Play door unlock sound
        alert("Correct! Proceeding to the next room.");
        updateScore(20 - hintsUsed * 5); // Deduct points for hints
        nextRoom();
    } else {
        playSound("incorrect"); // Play incorrect sound
        alert("Incorrect. Try again.");
    }
}

function checkSecondCipher() {
    const input = document.getElementById("cipher-input-2").value.toLowerCase();
    if (input === rooms[1].solution) {
        playSound("unlock"); // Play door unlock sound
        const points = hintsUsed === 0 ? 20 : 10; // Full points for first attempt
        updateScore(points);
        nextRoom();
    } else {
        playSound("incorrect"); // Play incorrect sound
        alert("Incorrect. Try again.");
    }
}

function checkRiddle() {
    const input = document.getElementById("riddle-input").value;
    if (input === rooms[2].solution) {
        playSound("unlock"); // Play door unlock sound
        const points = hintsUsed === 0 ? 20 : 10; // Full points for first attempt
        updateScore(points);
        nextRoom();
    } else {
        playSound("incorrect"); // Play incorrect sound
        alert("Incorrect. Try again.");
    }
}

const countdownSound = document.getElementById("countdown-sound");
const failureSound = new Audio("sounds/failure.mp3"); // Add your "shitty phrase" audio file here

function startTimer(duration) {
    clearInterval(timer); // Clear any existing timer
    let timeLeft = duration;
    const timerDisplay = document.getElementById("timer");

    const formatTime = (time) => {
        const minutes = Math.floor(time / 60);
        const seconds = time % 60;
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    };

    timerDisplay.textContent = formatTime(timeLeft);

    timer = setInterval(() => {
        timeLeft--;
        timerDisplay.textContent = formatTime(timeLeft);

        // Trigger countdown sound at 10 seconds
        if (timeLeft === 10) {
            countdownSound.volume = 0.7; // Adjust volume
            countdownSound.play().catch((error) => {
                console.error("Countdown sound failed to play:", error);
            });
        }

        // Handle when the timer runs out
        if (timeLeft <= 0) {
            clearInterval(timer);
            countdownSound.pause(); // Stop the countdown sound
            countdownSound.currentTime = 0; // Reset the sound

            stopBackgroundMusic(); // Stop the background music
            failureSound.play().catch((error) => {
                console.error("Failure sound failed to play:", error);
            });

            document.getElementById("story").innerHTML = `
            <p>Game Over! You ran out of time!</p>
            <button onclick="restartGame()">Retry</button>`;    
        }
    }, 1000);
}

function updateScore(points) {
    score += points;
    document.getElementById("score").textContent = score;
}

function resetRoom() {
    const confirmReset = confirm("Are you sure you want to reset the game? This will clear your progress and score.");
    if (confirmReset) {
        clearInterval(timer); // Stop any running timer
        currentRoom = 0;
        score = 0;
        hintsUsed = 0;
        totalHintsUsed = 0;

        document.getElementById("score").textContent = score;
        document.getElementById("control-buttons").style.display = "none"; // Hide Hint and Reset buttons
        document.getElementById("score-container").style.display = "none"; // Hide score display
        document.getElementById("next-button").style.display = "block"; // Show Start button
        document.getElementById("timer-container").style.display = "none"; // Hide the timer
        document.getElementById("story").innerHTML = "<p>Welcome, Detective. Press Start to begin your mission.</p>";
        document.getElementById("puzzle-container").innerHTML = ""; // Clear puzzle content
    }
}

function restartGame() {
    clearInterval(timer); // Stop any running timer
    currentRoom = 0;
    score = 0;
    hintsUsed = 0;
    totalHintsUsed = 0;

    document.getElementById("score").textContent = score;
    document.getElementById("control-buttons").style.display = "none"; // Hide Hint and Reset buttons
    document.getElementById("score-container").style.display = "none"; // Hide score display
    document.getElementById("next-button").style.display = "block"; // Show Start button
    document.getElementById("timer-container").style.display = "none"; // Hide the timer
    document.getElementById("story").innerHTML = "<p>Welcome, Detective. Press Start to begin your mission.</p>";
    document.getElementById("puzzle-container").innerHTML = ""; // Clear puzzle content
}

function closeGame() {
    if (confirm("Are you sure you want to close the game?")) {
        window.close(); // Close the browser tab (may not work in some environments)
    }
}

function showHint() {
    if (currentRoom > 0 && currentRoom <= rooms.length) {
        if (!hintUsed) {
            alert(rooms[currentRoom - 1].hint); // Show the hint for the current room
            hintsUsed++;
            totalHintsUsed++;
            score -= 5; // Deduct 5 points for using a hint
            document.getElementById("score").textContent = score; // Update the score display
            hintUsed = true; // Mark hint as used for the current room
        } else {
            alert("You have already used the hint for this room!");
        }
    } else {
        alert("No hints available."); // Fallback if no room is active
    }
}

function showRules() {
    document.getElementById("rules-container").style.display = "block"; // Show the rules modal
}

function closeRules() {
    document.getElementById("rules-container").style.display = "none"; // Hide the rules modal
}

function checkSafe() {
    const input = document.getElementById("safe-input").value.toLowerCase().trim();
    if (input === rooms[4].solution) {
        playSound("unlock"); // Play door unlock sound
        alert("Correct! Proceeding to the next room.");
        updateScore(20 - hintsUsed * 5); // Deduct points for hints
        nextRoom();
    } else {
        playSound("incorrect"); // Play incorrect sound
        alert("Incorrect. Try again.");
    }
}

function checkMapAnswer() {
    const input = document.getElementById("map-answer-input").value.toLowerCase().trim();
    if (input === rooms[3].solution) {
        playSound("unlock"); // Play door unlock sound
        alert("Correct! You’ve found the killer’s hideout!");
        updateScore(20 - hintsUsed * 5); // Deduct points for hints
        nextRoom(); // Move to the next room
    } else {
        playSound("incorrect"); // Play incorrect sound
        alert("Incorrect. Keep trying!");
    }
}

function checkMaze() {
    const input = document.getElementById("maze-input").value.toLowerCase().trim();
    if (input === rooms[5].solution) {
        playSound("unlock"); // Play door unlock sound
        alert("Congratulations! You escaped!");
        updateScore(50 - hintsUsed * 5); // Deduct points for hints
        nextRoom();
    } else {
        playSound("incorrect"); // Play incorrect sound
        alert("Incorrect. Try again.");
    }
}
const backgroundMusic = document.getElementById("background-music");
const doorUnlockSound = document.getElementById("door-unlock");
const incorrectSound = document.getElementById("incorrect");
const successSound = document.getElementById("success");

function playBackgroundMusic() {
    backgroundMusic.volume = 0.5; // Adjust volume
    backgroundMusic.play().catch((error) => {
        console.error("Background music failed to play:", error);
    });
}

function stopBackgroundMusic() {
    backgroundMusic.pause();
    backgroundMusic.currentTime = 0; // Reset playback position
}

function playSound(effect) {
    if (effect === "unlock") doorUnlockSound.play();
    else if (effect === "incorrect") incorrectSound.play();
    else if (effect === "success") successSound.play();
}

function flickerScreen() {
    const body = document.body;
    let flicker = setInterval(() => {
        body.style.backgroundColor = body.style.backgroundColor === "black" ? "" : "black";
    }, 200);
    setTimeout(() => clearInterval(flicker), 3000);
}

if (timeLeft <= 0) {
    flickerScreen(); // Add screen flicker
}

function revealClue() {
    const clueElement = document.getElementById("hidden-clue");
    setTimeout(() => {
        clueElement.style.opacity = 1;
        clueElement.innerHTML = "The hidden clue says: 'The key is within the shadows.'";
        alert("You found the hidden clue! Use this to solve the puzzle.");
    }, 1000); // 1-second delay
}

function fadeOutSound(sound) {
    let volume = sound.volume;
    const fade = setInterval(() => {
        if (volume > 0) {
            volume -= 0.1;
            sound.volume = Math.max(volume, 0); // Prevent negative values
        } else {
            clearInterval(fade);
            sound.pause();
            sound.currentTime = 0;
        }
    }, 100); // Fade out every 100ms
}
