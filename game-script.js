// Space Weather Educational Game
class SpaceWeatherGame {
    constructor() {
        this.currentScreen = 'intro';
        this.currentScene = 1;
        this.currentQuestion = 0;
        this.score = 0;
        this.playerInfo = {};
        this.directory = [];
        this.quizQuestions = [];
        this.gameTimer = null;
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.initializeQuizQuestions();
        this.setupMenuToggle();
        this.setupSplash();
        this.setupMainMenu();
        this.setupIntroVideo();
    }

    setupEventListeners() {
        // Splash interactions handled in setupSplash
        // Start game button
        document.getElementById('start-game').addEventListener('click', () => {
            this.startGame();
        });

        // Continue to story button
        document.getElementById('continue-to-story').addEventListener('click', () => {
            this.showStoryScreen();
        });

        // Scene navigation
        for (let i = 1; i <= 5; i++) {
            const nextBtn = document.getElementById(`next-scene-${i}`);
            if (nextBtn) {
                nextBtn.addEventListener('click', () => {
                    this.nextScene();
                });
            }
        }

        // Quiz navigation
        document.getElementById('next-question').addEventListener('click', () => {
            this.nextQuestion();
        });

        // Results screen
        document.getElementById('download-cert').addEventListener('click', () => {
            this.downloadCertificate();
        });

        document.getElementById('restart-game').addEventListener('click', () => {
            this.restartGame();
        });

        // Directory navigation
        document.getElementById('back-to-game').addEventListener('click', () => {
            this.backToGame();
        });

        // Mini-game interactions
        this.setupMiniGames();
    }

    setupMenuToggle() {
        const menuToggle = document.getElementById('menu-toggle');
        const sideMenu = document.getElementById('side-menu');
        const closeMenu = document.getElementById('close-menu');

        menuToggle.addEventListener('click', () => {
            sideMenu.classList.add('active');
        });

        closeMenu.addEventListener('click', () => {
            sideMenu.classList.remove('active');
        });

        // Menu items
        document.querySelectorAll('.menu-item').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const scene = e.currentTarget.getAttribute('data-scene');
                this.navigateToScene(scene);
                sideMenu.classList.remove('active');
            });
        });

        // Briefing controls
        const continueBtn = document.getElementById('continue-to-story');
        const skipBtn = document.getElementById('skip-briefing');
        if (continueBtn) {
            continueBtn.addEventListener('click', () => this.showStoryScreen());
        }
        if (skipBtn) {
            skipBtn.addEventListener('click', () => this.showStoryScreen());
        }
    }

    startGame() {
        // Get player information
        const name = document.getElementById('player-name').value;
        const surname = document.getElementById('player-surname').value;
        const gender = document.getElementById('player-gender').value;

        if (!name || !surname || !gender) {
            this.showNotification('Please fill in all fields!', 'error');
            return;
        }

        this.playerInfo = { name, surname, gender };
        
        // Add to directory
        this.addToDirectory('Player Information', `Name: ${name} ${surname}, Gender: ${gender}`);
        
        // Go to main menu (fallback to story if menu missing)
        if (document.getElementById('main-menu')) {
            this.showScreen('main-menu');
        } else {
            this.showStoryScreen();
        }
        this.showNotification('Registration saved ✅');
    }

    setupSplash() {
        const splash = document.getElementById('splash-screen');
        if (!splash) return;
        const goToIntro = () => {
            this.showScreen('intro-screen');
            window.removeEventListener('keydown', onAnyKey);
            splash.removeEventListener('click', goToIntro);
            splash.removeEventListener('touchstart', goToIntro);
        };
        const onAnyKey = () => goToIntro();
        window.addEventListener('keydown', onAnyKey);
        splash.addEventListener('click', goToIntro);
        splash.addEventListener('touchstart', goToIntro, { passive: true });
    }

    setupMainMenu() {
        const buttons = document.querySelectorAll('#main-menu .menu-btn');
        buttons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const action = e.currentTarget.getAttribute('data-action');
                this.handleMainMenuAction(action);
            });
        });
    }

    handleMainMenuAction(action) {
        switch (action) {
            case 'start':
                // Start cinematic video intro then story
                this.showScreen('video-screen');
                this.showNotification('New information added to your Directory ✅');
                break;
            case 'directory':
                this.showDirectory();
                break;
            case 'information':
                this.showNotification('Space Weather: investigate and collect info to pass the quiz!');
                break;
            default:
                break;
        }
    }

    setupIntroVideo() {
        const video = document.getElementById('introVideo');
        const yt = document.getElementById('introYouTube');
        if (!video) return;

        // Candidate public-domain sources (NASA/NOAA). Add or reorder as needed.
        const sources = [
            // Provide your preferred MP4 link first; fallback to next if it fails
            // Example placeholders (kept empty to avoid CORS failures at runtime):
            // 'https://svs.gsfc.nasa.gov/vis/a000000/a001000/a001095/solar_cme_sample.mp4',
        ];

        const applySource = (url) => new Promise((resolve, reject) => {
            try {
                video.src = url;
                const onCanPlay = () => { cleanup(); resolve(true); };
                const onError = () => { cleanup(); reject(new Error('video error')); };
                const cleanup = () => {
                    video.removeEventListener('canplay', onCanPlay);
                    video.removeEventListener('error', onError);
                };
                video.addEventListener('canplay', onCanPlay);
                video.addEventListener('error', onError);
                // Give it a short time to validate
                setTimeout(() => { cleanup(); resolve(!!video.readyState); }, 1500);
            } catch (e) {
                reject(e);
            }
        });

        const fallbackToAnimation = () => {
            const fb = document.querySelector('.cinematic-fallback');
            if (fb) fb.style.display = 'grid';
            video.style.display = 'none';
            if (yt) yt.style.display = 'none';
        };

        (async () => {
            // If direct MP4s absent, try YouTube NASA video as iframe
            if (!sources.length && yt) {
                // NASA Goddard “What is Space Weather?” (example educational video)
                const YT_ID = 'oOXVZo7KikE';
                yt.src = `https://www.youtube.com/embed/${YT_ID}?autoplay=1&mute=1&playsinline=1&rel=0`;
                yt.style.display = 'block';
                video.style.display = 'none';
                const fb = document.querySelector('.cinematic-fallback');
                if (fb) fb.style.display = 'none';
                return;
            }
            // Otherwise iterate MP4 list
            for (const url of sources) {
                try {
                    const ok = await applySource(url);
                    if (ok) {
                        video.muted = true;
                        video.playsInline = true;
                        await video.play().catch(() => {});
                        return;
                    }
                } catch (_) {}
            }
            fallbackToAnimation();
        })();

        // Continue button from cinematic
        const cont = document.getElementById('continue-to-story');
        if (cont) cont.addEventListener('click', () => this.showStoryScreen());
    }

    showStoryScreen() {
        this.showScreen('story-screen');
        this.currentScene = 1;
        this.showScene(1);
    }

    showScene(sceneNumber) {
        // Hide all scenes
        document.querySelectorAll('.story-scene').forEach(scene => {
            scene.classList.remove('active');
        });

        // Show current scene
        const currentScene = document.getElementById(`scene-${sceneNumber}`);
        if (currentScene) {
            currentScene.classList.add('active');
        }

        // Setup mini-game for current scene
        this.setupSceneMiniGame(sceneNumber);
    }

    setupSceneMiniGame(sceneNumber) {
        switch(sceneNumber) {
            case 1:
                this.setupSunGame();
                break;
            case 2:
                this.setupRadioGame();
                break;
            case 3:
                this.setupPowerGridGame();
                break;
            case 4:
                this.setupGPSGame();
                break;
            case 5:
                this.setupAuroraGame();
                break;
        }
    }

    setupSunGame() {
        const atoms = document.querySelectorAll('.atom');
        let acceleratedCount = 0;
        const feedback = document.getElementById('game-feedback');
        const progressFill = document.getElementById('progress-fill');

        atoms.forEach(atom => {
            atom.addEventListener('click', () => {
                if (!atom.classList.contains('accelerated')) {
                    atom.classList.add('accelerated');
                    acceleratedCount++;
                    document.getElementById('atom-count').textContent = acceleratedCount;
                    
                    // Update progress bar
                    const progress = (acceleratedCount / 5) * 100;
                    progressFill.style.width = progress + '%';
                    
                    // Show feedback
                    if (acceleratedCount === 1) {
                        feedback.textContent = 'First particle accelerated! The Sun is getting active...';
                        feedback.style.color = '#00bfff';
                    } else if (acceleratedCount === 3) {
                        feedback.textContent = 'Solar wind is building up! CME forming...';
                        feedback.style.color = '#ff6b35';
                    } else if (acceleratedCount === 5) {
                        feedback.textContent = 'CME launched! Solar storm heading toward Earth!';
                        feedback.style.color = '#ff0000';
                        
                        // Show impact zone animation
                        const impactZone = document.querySelector('.impact-zone');
                        impactZone.style.opacity = '1';
                        
                        this.addToDirectory('Solar Flare Effects', 'Solar flares can accelerate particles and create CMEs that damage satellites and expose astronauts to radiation.');
                        this.showNotification('New information added to your Directory ✅');
                    }
                }
            });
        });
    }

    setupRadioGame() {
        const lines = document.querySelectorAll('.line');
        let connectedCount = 0;
        let timeLeft = 30;
        
        const timer = setInterval(() => {
            timeLeft--;
            document.getElementById('radio-timer').textContent = timeLeft;
            
            if (timeLeft <= 0) {
                clearInterval(timer);
                this.addToDirectory('Communication Disruption', 'Space weather can disrupt radio communications and GPS signals, affecting aviation and navigation.');
                this.showNotification('New information added to your Directory ✅');
            }
        }, 1000);

        lines.forEach(line => {
            line.addEventListener('click', () => {
                if (!line.classList.contains('connected')) {
                    line.classList.add('connected');
                    connectedCount++;
                    
                    if (connectedCount === 4) {
                        clearInterval(timer);
                        this.addToDirectory('Communication Restoration', 'Radio communications can be restored by reconnecting frequency lines and using backup systems.');
                        this.showNotification('New information added to your Directory ✅');
                    }
                }
            });
        });
    }

    setupPowerGridGame() {
        const circuits = document.querySelectorAll('.circuit');
        let timeLeft = 45;
        
        const timer = setInterval(() => {
            timeLeft--;
            document.getElementById('power-timer').textContent = timeLeft;
            
            if (timeLeft <= 0) {
                clearInterval(timer);
                this.addToDirectory('Power Grid Effects', 'Geomagnetic storms can induce currents in power lines, causing blackouts and damaging transformers.');
                this.showNotification('New information added to your Directory ✅');
            }
        }, 1000);

        circuits.forEach(circuit => {
            circuit.addEventListener('click', () => {
                const powerLevel = circuit.querySelector('.power-level');
                const currentHeight = parseInt(powerLevel.style.height);
                const newHeight = Math.min(currentHeight + 20, 100);
                powerLevel.style.height = newHeight + '%';
                
                // Check if all circuits are balanced (around 80-100%)
                const allBalanced = Array.from(circuits).every(c => {
                    const height = parseInt(c.querySelector('.power-level').style.height);
                    return height >= 80;
                });
                
                if (allBalanced) {
                    clearInterval(timer);
                    circuit.classList.add('balanced');
                    this.addToDirectory('Power Grid Restoration', 'Power grids can be restored by balancing circuits and monitoring space weather conditions.');
                    this.showNotification('New information added to your Directory ✅');
                }
            });
        });
    }

    setupGPSGame() {
        const signals = document.querySelectorAll('.signal');
        let alignedCount = 0;
        let timeLeft = 40;
        
        const timer = setInterval(() => {
            timeLeft--;
            document.getElementById('gps-timer').textContent = timeLeft;
            
            if (timeLeft <= 0) {
                clearInterval(timer);
                this.addToDirectory('GPS Disruption', 'Space weather can disrupt GPS signals, affecting precision farming and navigation systems.');
                this.showNotification('New information added to your Directory ✅');
            }
        }, 1000);

        signals.forEach(signal => {
            signal.addEventListener('click', () => {
                if (!signal.classList.contains('aligned')) {
                    signal.classList.add('aligned');
                    alignedCount++;
                    
                    if (alignedCount === 4) {
                        clearInterval(timer);
                        this.addToDirectory('GPS Calibration', 'GPS systems can be calibrated by aligning satellite signals and using backup navigation methods.');
                        this.showNotification('New information added to your Directory ✅');
                    }
                }
            });
        });
    }

    setupAuroraGame() {
        const photos = document.querySelectorAll('.aurora-photo');
        const slots = document.querySelectorAll('.photo-slot');
        let selectedPhoto = null;

        photos.forEach(photo => {
            photo.addEventListener('click', () => {
                // Remove previous selection
                photos.forEach(p => p.classList.remove('selected'));
                photo.classList.add('selected');
                selectedPhoto = photo;
            });
        });

        slots.forEach(slot => {
            slot.addEventListener('click', () => {
                if (selectedPhoto && !slot.classList.contains('filled')) {
                    slot.textContent = selectedPhoto.textContent;
                    slot.classList.add('filled');
                    selectedPhoto.classList.remove('selected');
                    selectedPhoto = null;
                    
                    // Check if all slots are filled
                    const allFilled = Array.from(slots).every(s => s.classList.contains('filled'));
                    if (allFilled) {
                        this.addToDirectory('Aurora Photography', 'Space weather creates beautiful auroras when charged particles from the Sun interact with Earth\'s magnetic field.');
                        this.showNotification('New information added to your Directory ✅');
                    }
                }
            });
        });
    }

    nextScene() {
        if (this.currentScene < 5) {
            this.currentScene++;
            this.showScene(this.currentScene);
        } else {
            // All scenes completed, go to quiz
            this.showQuiz();
        }
    }

    showQuiz() {
        this.showScreen('quiz-screen');
        this.currentQuestion = 0;
        this.score = 0;
        this.startQuizTimer();
        this.displayQuestion();
    }

    startQuizTimer() {
        let timeLeft = 300; // 5 minutes
        this.gameTimer = setInterval(() => {
            timeLeft--;
            document.getElementById('quiz-timer').textContent = timeLeft;
            
            if (timeLeft <= 0) {
                clearInterval(this.gameTimer);
                this.finishQuiz();
            }
        }, 1000);
    }

    displayQuestion() {
        const question = this.quizQuestions[this.currentQuestion];
        document.getElementById('current-question').textContent = this.currentQuestion + 1;
        document.getElementById('question-text').textContent = question.question;
        
        const answersContainer = document.getElementById('answers-container');
        answersContainer.innerHTML = '';
        
        question.answers.forEach((answer, index) => {
            const answerElement = document.createElement('div');
            answerElement.className = 'answer-option';
            answerElement.textContent = answer;
            answerElement.addEventListener('click', () => {
                this.selectAnswer(index);
            });
            answersContainer.appendChild(answerElement);
        });
        
        document.getElementById('next-question').disabled = true;
    }

    selectAnswer(answerIndex) {
        // Remove previous selections
        document.querySelectorAll('.answer-option').forEach(option => {
            option.classList.remove('selected');
        });
        
        // Select current answer
        document.querySelectorAll('.answer-option')[answerIndex].classList.add('selected');
        document.getElementById('next-question').disabled = false;
        
        // Store the answer
        this.quizQuestions[this.currentQuestion].selectedAnswer = answerIndex;
    }

    nextQuestion() {
        const question = this.quizQuestions[this.currentQuestion];
        const selectedAnswer = question.selectedAnswer;
        
        if (selectedAnswer === question.correctAnswer) {
            this.score++;
        }
        
        this.currentQuestion++;
        
        if (this.currentQuestion < this.quizQuestions.length) {
            this.displayQuestion();
        } else {
            this.finishQuiz();
        }
    }

    finishQuiz() {
        clearInterval(this.gameTimer);
        this.showResults();
    }

    showResults() {
        this.showScreen('results-screen');
        document.getElementById('final-score').textContent = this.score;
        document.getElementById('player-name-display').textContent = this.playerInfo.name;
        
        const scoreMessage = document.getElementById('score-message');
        if (this.score >= 8) {
            scoreMessage.textContent = 'Excellent! You have mastered space weather knowledge!';
            scoreMessage.style.color = '#00ff00';
        } else if (this.score >= 6) {
            scoreMessage.textContent = 'Good job! You have a solid understanding of space weather.';
            scoreMessage.style.color = '#00bfff';
        } else {
            scoreMessage.textContent = 'Keep learning! Review the directory for more information.';
            scoreMessage.style.color = '#ff6b35';
        }
    }

    downloadCertificate() {
        // Create certificate content
        const certificateContent = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Space Weather Certificate</title>
                <style>
                    body { 
                        font-family: 'Orbitron', monospace; 
                        background: linear-gradient(45deg, #0a0a2e, #16213e);
                        color: #00bfff;
                        text-align: center;
                        padding: 50px;
                    }
                    .certificate {
                        background: rgba(0, 0, 0, 0.8);
                        border: 3px solid #00bfff;
                        border-radius: 20px;
                        padding: 50px;
                        max-width: 800px;
                        margin: 0 auto;
                        box-shadow: 0 0 50px #00bfff;
                    }
                    h1 { font-size: 3rem; margin-bottom: 30px; }
                    h2 { font-size: 2rem; margin-bottom: 20px; }
                    p { font-size: 1.2rem; margin: 20px 0; }
                    .score { color: #00ff00; font-size: 1.5rem; }
                </style>
            </head>
            <body>
                <div class="certificate">
                    <h1>SPACE WEATHER MISSION</h1>
                    <h2>CERTIFICATE OF COMPLETION</h2>
                    <p>This certifies that</p>
                    <h2>${this.playerInfo.name} ${this.playerInfo.surname}</h2>
                    <p>has successfully completed the Space Weather Educational Mission</p>
                    <p>Final Score: <span class="score">${this.score}/10</span></p>
                    <p>Date: ${new Date().toLocaleDateString()}</p>
                    <p>Developed by SAGA</p>
                </div>
            </body>
            </html>
        `;
        
        // Create and download file
        const blob = new Blob([certificateContent], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Space_Weather_Certificate_${this.playerInfo.name}.html`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    restartGame() {
        // Reset game state
        this.currentScreen = 'intro';
        this.currentScene = 1;
        this.currentQuestion = 0;
        this.score = 0;
        this.directory = [];
        this.playerInfo = {};
        
        // Clear form
        document.getElementById('player-name').value = '';
        document.getElementById('player-surname').value = '';
        document.getElementById('player-gender').value = '';
        
        // Show intro screen
        this.showScreen('intro-screen');
    }

    navigateToScene(scene) {
        switch(scene) {
            case 'home':
                this.showScreen('intro-screen');
                break;
            case 'directory':
                this.showDirectory();
                break;
        }
    }

    showDirectory() {
        this.showScreen('directory-screen');
        this.updateDirectoryDisplay();
    }

    updateDirectoryDisplay() {
        const directoryItems = document.getElementById('directory-items');
        directoryItems.innerHTML = '';
        
        if (this.directory.length === 0) {
            directoryItems.innerHTML = '<p>No information collected yet. Complete the story to gather information!</p>';
            return;
        }
        
        this.directory.forEach((item, index) => {
            const itemElement = document.createElement('div');
            itemElement.className = 'directory-item';
            itemElement.innerHTML = `
                <h4>${item.title}</h4>
                <p>${item.content}</p>
            `;
            directoryItems.appendChild(itemElement);
        });
    }

    backToGame() {
        // Return to current scene
        if (this.currentScreen === 'story-screen') {
            this.showScene(this.currentScene);
        } else {
            this.showScreen(this.currentScreen);
        }
    }

    addToDirectory(title, content) {
        this.directory.push({
            title: title,
            content: content,
            timestamp: new Date().toLocaleTimeString()
        });
    }

    showScreen(screenId) {
        // Hide all screens
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });
        
        // Show target screen
        const targetScreen = document.getElementById(screenId);
        if (targetScreen) {
            targetScreen.classList.add('active');
        }
        
        this.currentScreen = screenId;
    }

    showNotification(message, type = 'success') {
        const notification = document.getElementById('notification');
        const notificationText = notification.querySelector('.notification-text');
        
        notificationText.textContent = message;
        notification.classList.add('show');
        
        setTimeout(() => {
            notification.classList.remove('show');
        }, 3000);
    }

    initializeQuizQuestions() {
        this.quizQuestions = [
            {
                question: "What is space weather?",
                answers: [
                    "Weather conditions in space",
                    "Environmental conditions in space influenced by solar activity",
                    "Weather on other planets",
                    "Space storms only"
                ],
                correctAnswer: 1
            },
            {
                question: "What can solar flares damage?",
                answers: [
                    "Only Earth's atmosphere",
                    "Satellites and expose astronauts to radiation",
                    "Only power grids",
                    "Nothing significant"
                ],
                correctAnswer: 1
            },
            {
                question: "How does space weather affect aviation?",
                answers: [
                    "It doesn't affect aviation",
                    "It disrupts GPS and radio communications",
                    "It only affects space flights",
                    "It improves flight efficiency"
                ],
                correctAnswer: 1
            },
            {
                question: "What can geomagnetic storms cause?",
                answers: [
                    "Only beautiful auroras",
                    "Power grid blackouts and transformer damage",
                    "Only GPS disruptions",
                    "Nothing harmful"
                ],
                correctAnswer: 1
            },
            {
                question: "How does space weather affect farming?",
                answers: [
                    "It doesn't affect farming",
                    "It disrupts GPS systems used in precision agriculture",
                    "It only affects crop growth",
                    "It improves farming efficiency"
                ],
                correctAnswer: 1
            },
            {
                question: "What creates auroras?",
                answers: [
                    "Only solar flares",
                    "Charged particles from the Sun interacting with Earth's magnetic field",
                    "Only geomagnetic storms",
                    "Atmospheric pressure changes"
                ],
                correctAnswer: 1
            },
            {
                question: "What is a CME?",
                answers: [
                    "A type of satellite",
                    "Coronal Mass Ejection - a burst of solar wind",
                    "A communication system",
                    "A type of aurora"
                ],
                correctAnswer: 1
            },
            {
                question: "How do astronauts protect themselves from space weather?",
                answers: [
                    "They can't protect themselves",
                    "They take shelter in protected parts of the station",
                    "They use special suits",
                    "They return to Earth immediately"
                ],
                correctAnswer: 1
            },
            {
                question: "What monitors space weather?",
                answers: [
                    "Only NASA",
                    "NASA, NOAA, and other space agencies",
                    "Only weather stations",
                    "Only satellites"
                ],
                correctAnswer: 1
            },
            {
                question: "Why is space weather important to monitor?",
                answers: [
                    "It's not important",
                    "It can affect technology, communications, and power systems on Earth",
                    "Only for space missions",
                    "Only for scientific research"
                ],
                correctAnswer: 1
            }
        ];
    }

    setupMiniGames() {
        // Mini-games are set up in setupSceneMiniGame method
        // This method is called when each scene is displayed
    }

    setupFullscreen() {
        // Auto-enter fullscreen when game starts
        if (document.documentElement.requestFullscreen) {
            document.documentElement.requestFullscreen().catch(err => {
                console.log('Fullscreen not supported or denied');
            });
        }

        // Add fullscreen toggle with F11 key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'F11') {
                e.preventDefault();
                if (document.fullscreenElement) {
                    document.exitFullscreen();
                } else {
                    document.documentElement.requestFullscreen();
                }
            }
        });
    }
}

// Initialize the game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    try {
        new SpaceWeatherGame();
        console.log('Space Weather Educational Game initialized successfully!');
    } catch (error) {
        console.error('Error initializing Space Weather Game:', error);
    }
});

// Add error handling
window.addEventListener('error', (e) => {
    console.error('Game error:', e.error);
});

// Add performance monitoring
window.addEventListener('load', () => {
    console.log('Space Weather Educational Game loaded successfully!');
    
    if (window.performance) {
        const loadTime = window.performance.timing.loadEventEnd - window.performance.timing.navigationStart;
        console.log(`Game loaded in ${loadTime}ms`);
    }
});
