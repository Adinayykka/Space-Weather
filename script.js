// Space Weather Game - Cinematic Edition
class SpaceWeatherGame {
    constructor() {
        this.introScreen = document.getElementById('intro-screen');
        this.mainMenu = document.getElementById('main-menu');
        this.menuButtons = document.querySelectorAll('.menu-btn');
        this.isTransitioning = false;
        this.particleSystem = null;
        this.mouseX = 0;
        this.mouseY = 0;
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.startIntroSequence();
        this.setupCursorTrail();
        this.initializeParticleSystem();
        this.setupParallaxEffects();
    }

    setupEventListeners() {
        // Click anywhere on intro screen to skip to main menu
        this.introScreen.addEventListener('click', () => {
            if (!this.isTransitioning) {
                this.transitionToMainMenu();
            }
        });

        // Menu button event listeners
        this.menuButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                const action = e.currentTarget.getAttribute('data-action');
                this.handleMenuAction(action);
            });

            // Enhanced hover effects
            button.addEventListener('mouseenter', (e) => {
                this.enhanceButtonHover(e.currentTarget);
            });

            button.addEventListener('mouseleave', (e) => {
                this.resetButtonHover(e.currentTarget);
            });
        });

        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                if (this.introScreen.classList.contains('active') && !this.isTransitioning) {
                    this.transitionToMainMenu();
                }
            }
        });

        // Mouse movement for parallax
        document.addEventListener('mousemove', (e) => {
            this.mouseX = e.clientX;
            this.mouseY = e.clientY;
            this.updateParallax();
        });

        // Prevent context menu
        document.addEventListener('contextmenu', (e) => {
            e.preventDefault();
        });

        // Window resize handling
        window.addEventListener('resize', () => {
            this.handleResize();
        });
    }

    startIntroSequence() {
        // Auto-transition after 5 seconds
        setTimeout(() => {
            if (!this.isTransitioning) {
                this.transitionToMainMenu();
            }
        }, 5000);

        // Add cinematic effects
        this.addIntroEffects();
    }

    addIntroEffects() {
        // Add subtle parallax effect to background layers
        this.setupBackgroundParallax();
        
        // Add title animation sequence
        this.animateTitleSequence();
    }

    setupBackgroundParallax() {
        const backgroundLayers = document.querySelectorAll('.background-layer');
        backgroundLayers.forEach((layer, index) => {
            const speed = 0.5 + (index * 0.1);
            layer.style.transform = `translate(${this.mouseX * speed * 0.01}px, ${this.mouseY * speed * 0.01}px)`;
        });
    }

    animateTitleSequence() {
        const titleLines = document.querySelectorAll('.title-line');
        titleLines.forEach((line, index) => {
            line.style.animationDelay = `${index * 0.3}s`;
        });
    }

    transitionToMainMenu() {
        if (this.isTransitioning) return;
        
        this.isTransitioning = true;
        
        // Cinematic warp transition
        this.introScreen.style.transform = 'scale(1.1)';
        this.introScreen.style.filter = 'blur(5px)';
        this.introScreen.style.opacity = '0';
        this.introScreen.style.visibility = 'hidden';
        
        // Warp effect
        setTimeout(() => {
            this.mainMenu.style.transform = 'scale(0.9)';
            this.mainMenu.style.filter = 'blur(5px)';
            this.mainMenu.classList.add('active');
            
            // Smooth zoom in
            setTimeout(() => {
                this.mainMenu.style.transform = 'scale(1)';
                this.mainMenu.style.filter = 'blur(0px)';
                this.animateMenuButtons();
                this.isTransitioning = false;
            }, 300);
        }, 500);
    }

    animateMenuButtons() {
        this.menuButtons.forEach((button, index) => {
            button.style.opacity = '0';
            button.style.transform = 'translateY(50px) scale(0.8)';
            
            setTimeout(() => {
                button.style.transition = 'all 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
                button.style.opacity = '1';
                button.style.transform = 'translateY(0) scale(1)';
            }, index * 200);
        });
    }

    enhanceButtonHover(button) {
        // Enhanced glow effect
        button.style.boxShadow = `
            0 0 40px #00bfff,
            inset 0 0 40px rgba(0, 191, 255, 0.3),
            0 0 80px #00ffff
        `;
        
        // Scale and lift effect
        button.style.transform = 'translateY(-5px) scale(1.08)';
        
        // Add particle effect
        this.createButtonParticles(button);
        
        // Sound effect placeholder
        this.playHoverSound();
    }

    resetButtonHover(button) {
        button.style.boxShadow = '';
        button.style.transform = 'translateY(0) scale(1)';
    }

    createButtonParticles(button) {
        const rect = button.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        
        for (let i = 0; i < 5; i++) {
            const particle = document.createElement('div');
            particle.style.cssText = `
                position: fixed;
                left: ${centerX}px;
                top: ${centerY}px;
                width: 4px;
                height: 4px;
                background: #00bfff;
                border-radius: 50%;
                pointer-events: none;
                z-index: 1000;
                animation: buttonParticle 1s ease-out forwards;
            `;
            
            const angle = (Math.PI * 2 * i) / 5;
            const velocity = 50 + Math.random() * 30;
            const deltaX = Math.cos(angle) * velocity;
            const deltaY = Math.sin(angle) * velocity;
            
            particle.style.setProperty('--deltaX', deltaX + 'px');
            particle.style.setProperty('--deltaY', deltaY + 'px');
            
            document.body.appendChild(particle);
            
            setTimeout(() => {
                if (particle.parentNode) {
                    particle.parentNode.removeChild(particle);
                }
            }, 1000);
        }
    }

    playHoverSound() {
        // Placeholder for hover sound effect
        console.log('Hover sound effect');
    }

    handleMenuAction(action) {
        // Enhanced button click animation
        const button = document.querySelector(`[data-action="${action}"]`);
        if (button) {
            button.style.transform = 'scale(0.95)';
            button.style.filter = 'brightness(1.2)';
            setTimeout(() => {
                button.style.transform = '';
                button.style.filter = '';
            }, 200);
        }

        // Handle different menu actions
        switch (action) {
            case 'start':
                this.startGame();
                break;
            case 'directory':
                this.openDirectory();
                break;
            case 'information':
                this.showInformation();
                break;
            default:
                console.log('Unknown action:', action);
        }
    }

    startGame() {
        console.log('Starting Space Weather game...');
        this.showNotification('🚀 Launching into the cosmos...');
    }

    openDirectory() {
        console.log('Opening directory...');
        this.showNotification('📁 Accessing mission files...');
    }

    showInformation() {
        console.log('Showing information...');
        this.showNotification('ℹ️ Space Weather - A cosmic adventure awaits!');
    }

    showNotification(message) {
        // Remove any existing notifications
        const existingNotification = document.querySelector('.notification');
        if (existingNotification) {
            existingNotification.remove();
        }

        // Create a new notification with enhanced styling
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.textContent = message;
        document.body.appendChild(notification);
        
        // Remove notification after 3 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 3000);
    }

    setupCursorTrail() {
        let trailCount = 0;
        const maxTrails = 5;
        
        document.addEventListener('mousemove', (e) => {
            this.mouseX = e.clientX;
            this.mouseY = e.clientY;
            
            // Create enhanced cursor trail
            if (Math.random() > 0.7 && trailCount < maxTrails) {
                trailCount++;
                const particle = document.createElement('div');
                particle.className = 'cursor-trail';
                particle.style.left = this.mouseX + 'px';
                particle.style.top = this.mouseY + 'px';
                
                // Add random size and color variation
                const size = 2 + Math.random() * 3;
                const opacity = 0.5 + Math.random() * 0.5;
                particle.style.width = size + 'px';
                particle.style.height = size + 'px';
                particle.style.opacity = opacity;
                
                document.body.appendChild(particle);
                
                setTimeout(() => {
                    if (particle.parentNode) {
                        particle.parentNode.removeChild(particle);
                    }
                    trailCount--;
                }, 1500);
            }
        });
    }

    initializeParticleSystem() {
        // Particle system disabled - no floating particles
        this.particleSystem = document.querySelector('.particle-system');
        if (this.particleSystem) {
            // Keep particle system container but don't create particles
            this.particleSystem.style.display = 'none';
        }
    }

    setupParallaxEffects() {
        // Enhanced parallax for different elements
        this.parallaxElements = {
            stars: document.querySelector('.stars'),
            nebula: document.querySelector('.nebula'),
            galaxy: document.querySelector('.galaxy'),
            backgroundLayers: document.querySelectorAll('.background-layer')
        };
    }

    updateParallax() {
        if (!this.parallaxElements) return;
        
        const centerX = window.innerWidth / 2;
        const centerY = window.innerHeight / 2;
        const deltaX = (this.mouseX - centerX) / centerX;
        const deltaY = (this.mouseY - centerY) / centerY;
        
        // Stars parallax
        if (this.parallaxElements.stars) {
            this.parallaxElements.stars.style.transform = `translate(${deltaX * 20}px, ${deltaY * 20}px)`;
        }
        
        // Nebula parallax
        if (this.parallaxElements.nebula) {
            this.parallaxElements.nebula.style.transform = `translate(${deltaX * 15}px, ${deltaY * 15}px)`;
        }
        
        // Galaxy parallax
        if (this.parallaxElements.galaxy) {
            this.parallaxElements.galaxy.style.transform = `translate(${deltaX * 10}px, ${deltaY * 10}px)`;
        }
        
        // Background layers parallax
        this.parallaxElements.backgroundLayers.forEach((layer, index) => {
            const speed = 0.5 + (index * 0.2);
            layer.style.transform = `translate(${deltaX * speed * 10}px, ${deltaY * speed * 10}px)`;
        });
    }

    handleResize() {
        // Recalculate particle positions on resize
        if (this.particleSystem) {
            const particles = this.particleSystem.querySelectorAll('div');
            particles.forEach(particle => {
                particle.style.left = Math.random() * 100 + '%';
                particle.style.top = Math.random() * 100 + '%';
            });
        }
    }
}

// Add CSS animations for particles
const style = document.createElement('style');
style.textContent = `
    @keyframes floatingParticle {
        0% {
            transform: translateY(100vh) translateX(0);
            opacity: 0;
        }
        10% {
            opacity: 1;
        }
        90% {
            opacity: 1;
        }
        100% {
            transform: translateY(-100vh) translateX(${Math.random() * 200 - 100}px);
            opacity: 0;
        }
    }
    
    @keyframes buttonParticle {
        0% {
            transform: translate(0, 0) scale(1);
            opacity: 1;
        }
        100% {
            transform: translate(var(--deltaX), var(--deltaY)) scale(0);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Initialize the game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    try {
        new SpaceWeatherGame();
        console.log('Space Weather game initialized successfully!');
    } catch (error) {
        console.error('Error initializing Space Weather game:', error);
    }
});

// Add error handling and performance monitoring
window.addEventListener('error', (e) => {
    console.error('Game error:', e.error);
});

window.addEventListener('load', () => {
    console.log('Space Weather game loaded successfully!');
    
    // Add performance monitoring
    if (window.performance) {
        const loadTime = window.performance.timing.loadEventEnd - window.performance.timing.navigationStart;
        console.log(`Game loaded in ${loadTime}ms`);
    }
});

// Add keyboard shortcuts
document.addEventListener('keydown', (e) => {
    switch(e.key.toLowerCase()) {
        case 'escape':
            // Reset to intro screen
            const mainMenu = document.getElementById('main-menu');
            const introScreen = document.getElementById('intro-screen');
            if (mainMenu && introScreen) {
                mainMenu.classList.remove('active');
                introScreen.classList.add('active');
            }
            break;
        case 'f':
            // Toggle fullscreen
            if (document.fullscreenElement) {
                document.exitFullscreen();
            } else {
                document.documentElement.requestFullscreen();
            }
            break;
    }
});
