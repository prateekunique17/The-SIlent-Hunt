// Answer key - multiple accepted answers per level
// Each level can have multiple valid answers
const answers = {
    1: ['indiancoffeehouse', 'indian coffee house', 'coffeehouse', 'coffee house','inc','INC'],
    2: ['openhand', 'open hand', 'openhandmonument', 'open hand monument','capitol comlex','Capitol Complex','Capitol complex','Open Hand Monument', 'Open Hand'],
    3: ['elante', 'elantemall', 'elante mall','Elante Mall', 'Elante mall','elante'],
    4: ['birdpark', 'bird park', 'BirdPark','Bird Park','Bird park'],
    5: ['pec', 'punjab engineering college', 'punjabengineeringcollege', 'punjab engg college','PEC','Punjab Enginnering College','Punjab engineering college']
};

// Progress tracking
let progress = {
    level1: false,
    level2: false,
    level3: false,
    level4: false,
    level5: false
};

// Normalize answer - removes all spaces, converts to lowercase, removes special characters
function normalizeAnswer(answer) {
    return answer
        .toLowerCase()
        .replace(/\s+/g, '')           // Remove all spaces
        .replace(/[^a-z0-9]/g, '');    // Remove special characters, keep only letters and numbers
}

// Check if answer is correct by comparing against all valid answers
function isAnswerCorrect(userAnswer, level) {
    const normalizedUser = normalizeAnswer(userAnswer);
    const validAnswers = answers[level];
    
    // Check if normalized user answer matches any of the valid answers
    return validAnswers.some(validAnswer => {
        const normalizedValid = normalizeAnswer(validAnswer);
        return normalizedUser === normalizedValid;
    });
}

// Load progress from localStorage
function loadProgress() {
    const saved = localStorage.getItem('silentHuntProgress');
    if (saved) {
        try {
            progress = JSON.parse(saved);
        } catch (e) {
            console.error('Error loading progress:', e);
        }
    }
}

// Save progress to localStorage
function saveProgress() {
    try {
        localStorage.setItem('silentHuntProgress', JSON.stringify(progress));
    } catch (e) {
        console.error('Error saving progress:', e);
    }
}

// Show specific page with smooth transition
function showPage(pageId) {
    // Remove active class from all pages
    const pages = document.querySelectorAll('.page');
    pages.forEach(page => {
        page.classList.remove('active');
    });
    
    // Add active class to target page
    const targetPage = document.getElementById(pageId);
    if (targetPage) {
        targetPage.classList.add('active');
        
        // Scroll to top smoothly
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
        
        // Focus on input if it exists
        setTimeout(() => {
            const input = targetPage.querySelector('.answer-input');
            if (input) {
                input.focus();
            }
        }, 500);
    }
}

// Check answer for a specific level
function checkAnswer(level) {
    const inputElement = document.getElementById(`answer${level}`);
    const errorElement = document.getElementById(`error${level}`);
    
    if (!inputElement || !errorElement) {
        console.error('Input or error element not found');
        return;
    }
    
    const userAnswer = inputElement.value.trim();
    
    // Clear previous error
    errorElement.textContent = '';
    
    // Check if user entered something
    if (!userAnswer) {
        errorElement.textContent = 'Please enter an answer.';
        return;
    }
    
    // Check if answer is correct
    if (isAnswerCorrect(userAnswer, level)) {
        // Mark level as complete
        progress[`level${level}`] = true;
        saveProgress();
        
        // Clear input
        inputElement.value = '';
        
        // Add success animation
        inputElement.style.borderColor = 'var(--gold)';
        
        // Navigate to next level or final page
        setTimeout(() => {
            if (level < 5) {
                showPage(`level${level + 1}`);
            } else {
                showPage('final');
            }
        }, 600);
        
    } else {
        // Show error message
        errorElement.textContent = 'Not quite. Look closer.';
        
        // Shake animation
        inputElement.style.animation = 'shake 0.5s';
        setTimeout(() => {
            inputElement.style.animation = '';
        }, 500);
        
        // Clear error after 3 seconds
        setTimeout(() => {
            errorElement.textContent = '';
        }, 3000);
    }
}

// Handle Enter key press
function handleKeyPress(event) {
    if (event.key === 'Enter') {
        const activePage = document.querySelector('.page.active');
        if (activePage) {
            const activeInput = activePage.querySelector('.answer-input');
            if (activeInput) {
                const levelId = activeInput.id.replace('answer', '');
                checkAnswer(parseInt(levelId));
            }
        }
    }
}

// Add shake animation
const style = document.createElement('style');
style.textContent = `
    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
        20%, 40%, 60%, 80% { transform: translateX(5px); }
    }
`;
document.head.appendChild(style);

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    loadProgress();
    
    // Add event listeners to all inputs
    for (let i = 1; i <= 5; i++) {
        const input = document.getElementById(`answer${i}`);
        if (input) {
            input.addEventListener('keypress', handleKeyPress);
        }
    }
    
    // Check for existing progress and add Continue button
    updateLandingPage();
});

// Update landing page with Continue button if progress exists
function updateLandingPage() {
    const lastCompleted = getLastCompletedLevel();
    const landingButtons = document.getElementById('landingButtons');
    
    if (lastCompleted > 0 && lastCompleted < 5) {
        // User has progress, show Continue button
        const nextLevel = lastCompleted + 1;
        const continueBtn = document.createElement('button');
        continueBtn.className = 'btn-primary';
        continueBtn.style.marginTop = '1rem';
        continueBtn.innerHTML = `<span>Continue Journey (Level ${nextLevel})</span>`;
        continueBtn.onclick = () => showPage(`level${nextLevel}`);
        
        // Insert Continue button before the Begin button
        const beginButton = landingButtons.querySelector('button');
        landingButtons.insertBefore(continueBtn, beginButton);
        
        // Make Begin button secondary
        beginButton.className = 'btn-secondary';
        beginButton.innerHTML = '<span>Start Over</span>';
        beginButton.onclick = () => {
            if (confirm('This will reset your progress. Are you sure?')) {
                resetProgress();
            }
        };
    } else if (lastCompleted === 5) {
        // User completed all levels, show View Certificate button
        const certBtn = document.createElement('button');
        certBtn.className = 'btn-primary';
        certBtn.style.marginTop = '1rem';
        certBtn.innerHTML = '<span>View Your Certificate</span>';
        certBtn.onclick = () => showPage('final');
        
        const beginButton = landingButtons.querySelector('button');
        landingButtons.insertBefore(certBtn, beginButton);
        
        beginButton.className = 'btn-secondary';
        beginButton.innerHTML = '<span>Start Over</span>';
        beginButton.onclick = () => {
            if (confirm('This will reset your progress. Are you sure?')) {
                resetProgress();
            }
        };
    }
}

// Helper function to get last completed level
function getLastCompletedLevel() {
    for (let i = 5; i >= 1; i--) {
        if (progress[`level${i}`]) {
            return i;
        }
    }
    return 0;
}

// Reset progress (for testing - you can remove this in production)
function resetProgress() {
    progress = {
        level1: false,
        level2: false,
        level3: false,
        level4: false,
        level5: false
    };
    saveProgress();
    
    // Reload the page to reset button states
    location.reload();
}

// Add reset to window for testing (remove in production)
window.resetProgress = resetProgress;

// Generate certificate function
function generateCertificate() {
    const nameInput = document.getElementById('userName');
    const name = nameInput.value.trim();
    
    if (!name) {
        alert('Please enter your name');
        return;
    }
    
    // Set the name in certificate
    document.getElementById('certificateName').textContent = name;
    
    // Set the date
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    const currentDate = new Date().toLocaleDateString('en-US', options);
    document.getElementById('certificateDate').textContent = currentDate;
    
    // Show certificate page
    showPage('certificate');
}

// Download certificate as image
function downloadCertificate() {
    const certificateElement = document.getElementById('certificateContent');
    const name = document.getElementById('certificateName').textContent;
    
    // Hide buttons temporarily for cleaner screenshot
    const buttons = document.querySelector('.certificate-actions');
    const originalDisplay = buttons.style.display;
    buttons.style.display = 'none';
    
    // Use html2canvas to convert certificate to image
    html2canvas(certificateElement, {
        backgroundColor: '#0a0a0a',
        scale: 2, // Higher quality
        logging: false,
        useCORS: true
    }).then(canvas => {
        // Show buttons again
        buttons.style.display = originalDisplay;
        
        // Convert canvas to blob and download
        canvas.toBlob(blob => {
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.download = `The-Silent-Hunt-Certificate-${name.replace(/\s+/g, '-')}.png`;
            link.href = url;
            link.click();
            URL.revokeObjectURL(url);
        });
    }).catch(error => {
        // Show buttons again even if error
        buttons.style.display = originalDisplay;
        console.error('Error generating certificate:', error);
        alert('Error downloading certificate. Please try taking a screenshot instead.');
    });
}
