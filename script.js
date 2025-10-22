// Simple variables
let currentUser = null;
let flashcards = [];  
let notes = [];
let timerSeconds = 1500; // 25 minutes
let timerRunning = false;
let timerInterval = null;
let sessionsToday = 0;

//  page navigation
function showPage(pageName) {
    // Hide all pages
    const pages = document.querySelectorAll('.page');
    pages.forEach(page => page.classList.remove('active'));
    
    // Show selected page
    document.getElementById(pageName).classList.add('active');
    
    // Load data for specific pages
    if (pageName === 'flashcards') {
        loadFlashcards();
    } else if (pageName === 'notes') {
        loadNotes();
    }
}

//  checks if user is logged in

//Makes sure clicking the get started button works based on log in 
function getStarted() {
    if (currentUser) {
        showPage('timer'); // Go to timer if already logged in
    } else {
        showPage('login'); // Go to login if not logged in
    }
}


document.getElementById('login-form').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value.trim();

    // Only allows this username and password
    const correctUsername = "student";
    const correctPassword = "1234";

    // Simple validation
    if (username.length < 3) {
        showError('username-error', 'Username too short');
        return;
    }
    
    if (password.length < 4) {
        showError('password-error', 'Password too short');
        return;
    }

    // Checks if username and password match
    if (username === correctUsername && password === correctPassword) {
        currentUser = username;
        localStorage.setItem('studybuddy-user', username);
        
        showSuccess('login-success');
        updateNavigation();
        
        setTimeout(() => {
            showPage('home'); // Go to home after login
        }, 1000);
    } else {
        showError('password-error', 'Invalid username or password');
    }
});





// Update navigation after login
function updateNavigation() {
    if (currentUser) {
        document.getElementById('login-btn').style.display = 'none';
        document.getElementById('logout-btn').style.display = 'block';
        document.getElementById('timer-link').style.display = 'block';
        document.getElementById('flashcards-link').style.display = 'block';
        document.getElementById('notes-link').style.display = 'block';
    } else {
        document.getElementById('login-btn').style.display = 'block';
        document.getElementById('logout-btn').style.display = 'none';
        document.getElementById('timer-link').style.display = 'none';
        document.getElementById('flashcards-link').style.display = 'none';
        document.getElementById('notes-link').style.display = 'none';
    }
}

// Simple logout
function logout() {
    currentUser = null;
    localStorage.removeItem('studybuddy-user');
    updateNavigation();
    showPage('home');
}

// Check if user is logged in
function checkLogin() {
    const savedUser = localStorage.getItem('studybuddy-user');
    if (savedUser) {
        currentUser = savedUser;
        updateNavigation();
    }
}

// Simple timer functions
function startTimer() {
    if (!timerRunning) {
        timerRunning = true;
        document.getElementById('start-btn').style.display = 'none';
        document.getElementById('pause-btn').style.display = 'inline-block';
        
        timerInterval = setInterval(() => {
            timerSeconds--;
            let min = Math.floor(timerSeconds / 60);
            let sec = timerSeconds % 60;
            document.getElementById('timer-display').textContent = 
                min.toString().padStart(2,'0') + ':' + sec.toString().padStart(2,'0');
            
            if(timerSeconds === 0){
                clearInterval(timerInterval);
                alert('Session completed!');
                timerSeconds = 1500; // reset
                document.getElementById('timer-display').textContent = '25:00';
            }
        }, 1000);
    }
}

function pauseTimer() {
    timerRunning = false;
    clearInterval(timerInterval);
    document.getElementById('start-btn').style.display = 'inline-block';
    document.getElementById('pause-btn').style.display = 'none';
}

function resetTimer() {
    pauseTimer();
    timerSeconds = 1500;
    document.getElementById('timer-display').textContent = '25:00';
}

function completeSession() {
    pauseTimer();
    sessionsToday++;
    document.getElementById('session-count').textContent = sessionsToday;
    alert('Great job! Session completed!');
    resetTimer();
}

// Simple flashcard functions
function showAddCard() {
    document.getElementById('add-card-form').style.display = 'block';
}

function hideAddCard() {
    document.getElementById('add-card-form').style.display = 'none';
    document.getElementById('card-form').reset();
}

document.getElementById('card-form').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const question = document.getElementById('card-question').value;
    const answer = document.getElementById('card-answer').value;
    
    const newCard = {
        id: Date.now(),
        question: question,
        answer: answer,
        flipped: false
    };
    
    flashcards.push(newCard);
    saveFlashcards();
    loadFlashcards();
    hideAddCard();
});

function loadFlashcards() {
    const container = document.getElementById('cards-container');
    
    if (flashcards.length === 0) {
        container.innerHTML = '<p class="text-muted text-center">No flashcards yet. Create your first one!</p>';
        return;
    }
    
    let html = '';
    flashcards.forEach(card => {
        html += `
            <div class="flashcard ${card.flipped ? 'flipped' : ''}" onclick="flipCard(${card.id})">
                <div>
                    ${card.flipped ? card.answer : card.question}
                </div>
            </div>
        `;
    });
    
    container.innerHTML = html;
}

function flipCard(cardId) {
    const card = flashcards.find(c => c.id === cardId);
    if (card) {
        card.flipped = !card.flipped;
        loadFlashcards();
    }
}

function saveFlashcards() {
    localStorage.setItem('flashcards', JSON.stringify(flashcards));
}

function loadSavedFlashcards() {
    const saved = localStorage.getItem('flashcards');
    if (saved) flashcards = JSON.parse(saved);
}

// Simple notes functions
function showAddNote() {
    document.getElementById('add-note-form').style.display = 'block';
}

function hideAddNote() {
    document.getElementById('add-note-form').style.display = 'none';
    document.getElementById('note-form').reset();
}

document.getElementById('note-form').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const title = document.getElementById('note-title').value;
    const content = document.getElementById('note-content').value;
    
    const newNote = {
        id: Date.now(),
        title: title,
        content: content,
        date: new Date().toLocaleDateString()
    };
    
    notes.push(newNote);
    saveNotes();
    loadNotes();
    hideAddNote();
});

function loadNotes() {
    const container = document.getElementById('notes-container');
    
    if (notes.length === 0) {
        container.innerHTML = '<p class="text-muted text-center">No notes yet. Create your first one!</p>';
        return;
    }
    
    let html = '';
    notes.forEach(note => {
        html += `
            <div class="border-start border-primary border-4 ps-3 mb-3">
                <h5>${note.title}</h5>
                <p>${note.content}</p>
                <small class="text-muted">Created: ${note.date}</small>
            </div>
        `;
    });
    
    container.innerHTML = html;
}

function saveNotes() {
    localStorage.setItem('notes', JSON.stringify(notes));
}

function loadSavedNotes() {
    const saved = localStorage.getItem('notes');
    if (saved) notes = JSON.parse(saved);
}

// Simple contact form
document.getElementById('contact-form').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const name = document.getElementById('contact-name').value;
    const email = document.getElementById('contact-email').value;
    const message = document.getElementById('contact-message').value;
    
    // Simple validation
    if (name.length < 2) {
        showError('name-error', 'hey, name is too short');
        return;
    }
    
    if (!email.includes('@')) {
        showError('email-error', 'Invalid email');
        return;
    }
    
    if (message.length < 10) {
        showError('message-error', 'hey, message is too short');
        return;
    }
    
    showSuccess('contact-success');
    this.reset();
});

// Simple helper functions
function showError(elementId, message) {
    document.getElementById(elementId).textContent = message;
}

function showSuccess(elementId) {
    document.getElementById(elementId).style.display = 'block';
    setTimeout(() => {
        document.getElementById(elementId).style.display = 'none';
    }, 3000);
}


// Add animations to elements
function addAnimations() {
    const cards = document.querySelectorAll('.card');
    cards.forEach((card, index) => {
        setTimeout(() => {
            card.classList.add('fade-in');
        }, index * 200);
    });
}

// Simplified dark mode toggle
function toggleDarkMode() {
    document.body.classList.toggle('dark-mode');
}

// Show/hide sections (interactive feature)
function toggleSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section.style.display === 'none') {
        section.style.display = 'block';
        section.classList.add('fade-in');
    } else {
        section.style.display = 'none';
    }
}

// Initialize app
window.onload = function() {
    checkLogin();
    loadSavedFlashcards();
    loadSavedNotes();
    addAnimations();
    
    // Add keyboard accessibility
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' && e.target.tagName === 'BUTTON') {
            e.target.click();
        }
    });
};




async function loadQuote() {
  try {
    const quoteElement = document.getElementById('api-quote');
    quoteElement.textContent = 'Loading...';
    
    const res = await fetch('https://api.quotable.io/random?tags=education');
    const data = await res.json();
    
    quoteElement.textContent = `"${data.content}" — ${data.author}`;
  } catch (err) {
    document.getElementById('api-quote').textContent = 'Failed to load quote.';
  }
}
