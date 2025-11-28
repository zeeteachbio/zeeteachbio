import './style.css';

// Chapter data (same as admin.js)
const chapters = {
    'STB Class 9': [
        "1. Introduction to Biology", "2. Solving a Biological Problem", "3. Biodiversity",
        "4. Cells and Tissues", "5. Cell Cycle", "6. Enzymes",
        "7. Bioenergetics", "8. Nutrition", "9. Transport"
    ],
    'STB Class 10': [
        "1. Gaseous Exchange", "2. Homeostasis", "3. Coordination and Control",
        "4. Support and Movement", "5. Reproduction", "6. Inheritance",
        "7. Man and His Environment", "8. Biotechnology", "9. Pharmacology"
    ],
    'STB Class 11': [
        "1. Biological Molecules", "2. Enzymes", "3. Cell Structure and Function",
        "4. Bioenergetics", "5. Acellular Life", "6. Prokaryotes",
        "7. Protoctists and Fungi", "8. Diversity Among Plants", "9. Diversity Among Animals",
        "10. Forms and Functions in Plant", "11. Holozoic Nutrition", "12. Circulation",
        "13. Immunity", "14. Gaseous Exchange"
    ],
    'STB Class 12': [
        "15. Homeostasis", "16. Support and Movement", "17. Coordination and Control",
        "18. Reproduction", "19. Growth and Development", "20. Chromosomes and DNA",
        "21. Cell Cycle", "22. Variation and Genetics", "23. Biotechnology",
        "24. Evolution", "25. Ecosystem", "26. Some Major Ecosystems",
        "27. Man and His Environment"
    ],
    'AKUEB Class 9': [
        "1. Introduction to Biology", "2. Biodiversity", "3. Biological Molecules",
        "4. Cells and Tissues", "5. Cell Cycle", "6. Enzymes",
        "7. Bioenergetics", "8. Nutrition", "9. Transport"
    ],
    'AKUEB Class 10': [
        "1. Gaseous Exchange", "2. Homeostasis", "3. Support and Movement",
        "4. Coordination and Control", "5. Reproduction", "6. Inheritance",
        "7. Evolution and Genetics", "8. Biotechnology", "9. Pharmacology"
    ],
    'AKUEB Class 11': [
        "1. Biological Molecules", "2. Enzymes", "3. Bioenergetics",
        "4. Cell Structure and Function", "5. Variety of Life", "6. Kingdom Prokaryotae (Bacteria)",
        "7. Kingdom Protoctista", "8. Kingdom Fungi", "9. Kingdom Plantae",
        "10. Kingdom Animalia", "11. Bioenergetics"
    ],
    'AKUEB Class 12': [
        "1. Homeostasis", "2. Support and Movement", "3. Coordination and Control",
        "4. Reproduction", "5. Growth and Development", "6. Chromosomes and DNA",
        "7. Cell Cycle", "8. Variation and Genetics", "9. Biotechnology",
        "10. Evolution", "11. Ecosystems"
    ]
};

// State
let currentTest = null;
let timerInterval = null;
let startTime = null;
let timeLimit = 20 * 60; // 20 minutes in seconds

// DOM Elements
const testClassSelect = document.getElementById('test-class');
const testChapterSelect = document.getElementById('test-chapter');
const chapterGroup = document.getElementById('chapter-group');
const startTestBtn = document.getElementById('start-test-btn');
const testSelection = document.getElementById('test-selection');
const testLoading = document.getElementById('test-loading');
const testScreen = document.getElementById('test-screen');
const resultsScreen = document.getElementById('results-screen');
const questionsContainer = document.getElementById('questions-container');
const submitTestBtn = document.getElementById('submit-test-btn');
const retakeTestBtn = document.getElementById('retake-test-btn');
const timerDisplay = document.getElementById('timer');
const testTitle = document.getElementById('test-title');

// Initialize
const initTest = () => {
    // Class selection change
    testClassSelect.addEventListener('change', (e) => {
        const selectedClass = e.target.value;
        if (selectedClass && chapters[selectedClass]) {
            chapterGroup.style.display = 'block';
            testChapterSelect.innerHTML = '<option value="">Choose a chapter...</option>';
            chapters[selectedClass].forEach(chapter => {
                const option = document.createElement('option');
                option.value = chapter;
                option.textContent = chapter;
                testChapterSelect.appendChild(option);
            });
            startTestBtn.disabled = true;
        } else {
            chapterGroup.style.display = 'none';
            startTestBtn.disabled = true;
        }
    });

    // Chapter selection change
    testChapterSelect.addEventListener('change', (e) => {
        startTestBtn.disabled = !e.target.value;
    });

    // Start test button
    startTestBtn.addEventListener('click', generateTest);

    // Submit test button
    submitTestBtn.addEventListener('click', submitTest);

    // Retake test button
    retakeTestBtn.addEventListener('click', () => {
        showScreen('selection');
        testClassSelect.value = '';
        testChapterSelect.value = '';
        chapterGroup.style.display = 'none';
        startTestBtn.disabled = true;
    });

    // Initialize dark mode and mobile menu
    initDarkMode();
    initMobileMenu();
};

// Show screen
const showScreen = (screen) => {
    testSelection.style.display = screen === 'selection' ? 'block' : 'none';
    testLoading.style.display = screen === 'loading' ? 'block' : 'none';
    testScreen.style.display = screen === 'test' ? 'block' : 'none';
    resultsScreen.style.display = screen === 'results' ? 'block' : 'none';
};

// Generate test using DeepSeek AI
const generateTest = async () => {
    const selectedClass = testClassSelect.value;
    const selectedChapter = testChapterSelect.value;

    if (!selectedClass || !selectedChapter) {
        alert('Please select both class and chapter');
        return;
    }

    showScreen('loading');

    try {
        const mcqs = await generateMCQsWithAI(selectedClass, selectedChapter);

        currentTest = {
            class: selectedClass,
            chapter: selectedChapter,
            questions: mcqs,
            answers: new Array(20).fill(null),
            startTime: Date.now()
        };

        renderTest();
        showScreen('test');
        startTimer();
    } catch (error) {
        console.error('Error generating test:', error);
        alert(`Failed to generate test: ${error.message}`);
        showScreen('selection');
    }
};

// Generate MCQs using DeepSeek AI
const generateMCQsWithAI = async (className, chapterName) => {
    let apiKey = localStorage.getItem('deepseek_api_key');

    if (!apiKey) {
        apiKey = prompt(
            '🔑 DeepSeek API Key Required\n\n' +
            'To generate AI-powered test questions, please enter your DeepSeek API key.\n\n' +
            'Your key will be stored securely in your browser and never shared.\n\n' +
            'Get your key at: https://platform.deepseek.com\n\n' +
            'Enter your API key:'
        );

        if (!apiKey || apiKey.trim() === '') {
            throw new Error('API key is required to generate tests');
        }

        if (!apiKey.startsWith('sk-')) {
            throw new Error('Invalid API key format. DeepSeek keys start with "sk-"');
        }

        localStorage.setItem('deepseek_api_key', apiKey.trim());
    }

    const prompt = `Generate 20 multiple choice questions (MCQs) for ${className} Biology, Chapter: ${chapterName}.

Requirements:
- Each question should have 4 options (A, B, C, D)
- Only one correct answer per question
- Questions should cover different topics within the chapter
- Mix of easy, medium, and hard difficulty
- Include conceptual, application, and analytical questions

Format your response as a JSON array with this structure:
[
  {
    "question": "Question text here?",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correct": 0
  }
]

Where "correct" is the index (0-3) of the correct answer.

Generate exactly 20 questions now:`;

    try {
        const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: 'deepseek-chat',
                messages: [{ role: 'user', content: prompt }],
                temperature: 0.8,
                max_tokens: 4000
            })
        });

        if (!response.ok) {
            if (response.status === 401) {
                localStorage.removeItem('deepseek_api_key');
                throw new Error('Invalid API key. Please check your key and try again.');
            }
            throw new Error(`API request failed: ${response.statusText}`);
        }

        const data = await response.json();
        const content = data.choices[0].message.content;

        const jsonMatch = content.match(/\[[\s\S]*\]/);
        if (!jsonMatch) {
            throw new Error('Invalid response format from AI');
        }

        const questions = JSON.parse(jsonMatch[0]);

        if (!Array.isArray(questions) || questions.length !== 20) {
            throw new Error('Invalid number of questions generated');
        }

        return questions;
    } catch (error) {
        if (error.message.includes('Invalid API key')) {
            throw error;
        }
        throw new Error(`Failed to generate questions: ${error.message}`);
    }
};

// Render test
const renderTest = () => {
    testTitle.textContent = `${currentTest.class} - ${currentTest.chapter}`;

    questionsContainer.innerHTML = currentTest.questions.map((q, index) => `
        <div class="question-card">
            <div class="question-number">Question ${index + 1}</div>
            <div class="question-text">${q.question}</div>
            <div class="options-container">
                ${q.options.map((option, optIndex) => `
                    <label class="option-label">
                        <input type="radio" name="q${index}" value="${optIndex}" 
                               onchange="window.updateAnswer(${index}, ${optIndex})">
                        <span class="option-text">${String.fromCharCode(65 + optIndex)}. ${option}</span>
                    </label>
                `).join('')}
            </div>
        </div>
    `).join('');
};

// Update answer
window.updateAnswer = (questionIndex, answerIndex) => {
    if (currentTest) {
        currentTest.answers[questionIndex] = answerIndex;
    }
};

// Start timer
const startTimer = () => {
    startTime = Date.now();
    let remainingTime = timeLimit;

    timerInterval = setInterval(() => {
        remainingTime--;

        const minutes = Math.floor(remainingTime / 60);
        const seconds = remainingTime % 60;
        timerDisplay.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;

        if (remainingTime <= 0) {
            clearInterval(timerInterval);
            submitTest(true);
        }
    }, 1000);
};

// Submit test
const submitTest = (autoSubmit = false) => {
    if (!autoSubmit) {
        const unanswered = currentTest.answers.filter(a => a === null).length;
        if (unanswered > 0) {
            if (!confirm(`You have ${unanswered} unanswered questions. Submit anyway?`)) {
                return;
            }
        }
    }

    clearInterval(timerInterval);

    const endTime = Date.now();
    const timeTaken = Math.floor((endTime - startTime) / 1000);

    let correct = 0;
    currentTest.questions.forEach((q, index) => {
        if (currentTest.answers[index] === q.correct) {
            correct++;
        }
    });

    const percentage = Math.round((correct / 20) * 100);

    document.getElementById('score-display').textContent = `${correct}/20`;
    document.getElementById('percentage-display').textContent = `${percentage}%`;
    document.getElementById('time-display').textContent = formatTime(timeTaken);

    renderAnswerReview(correct);
    showScreen('results');
};

// Render answer review
const renderAnswerReview = (correctCount) => {
    const answersReview = document.getElementById('answers-review');

    answersReview.innerHTML = `
        <h2 style="margin-top: 2rem; margin-bottom: 1rem;">Review Your Answers</h2>
        ${currentTest.questions.map((q, index) => {
        const userAnswer = currentTest.answers[index];
        const isCorrect = userAnswer === q.correct;

        return `
                <div class="answer-review-card ${isCorrect ? 'correct' : 'incorrect'}">
                    <div class="question-number">Question ${index + 1}</div>
                    <div class="question-text">${q.question}</div>
                    <div class="answer-info">
                        <div>
                            <strong>Your Answer:</strong> 
                            ${userAnswer !== null ? `${String.fromCharCode(65 + userAnswer)}. ${q.options[userAnswer]}` : 'Not answered'}
                        </div>
                        ${!isCorrect ? `
                            <div style="color: var(--color-primary); margin-top: 0.5rem;">
                                <strong>Correct Answer:</strong> 
                                ${String.fromCharCode(65 + q.correct)}. ${q.options[q.correct]}
                            </div>
                        ` : ''}
                    </div>
                </div>
            `;
    }).join('')}
    `;
};

// Format time
const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
};

// Dark mode
const initDarkMode = () => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-mode');
    }
};

// Mobile menu
const initMobileMenu = () => {
    const headerContent = document.querySelector('.header-content');
    const nav = document.querySelector('.nav');

    if (headerContent && nav && !headerContent.querySelector('.menu-toggle')) {
        const menuToggle = document.createElement('button');
        menuToggle.className = 'menu-toggle';
        menuToggle.innerHTML = '☰';
        menuToggle.setAttribute('aria-label', 'Toggle navigation');

        const logo = headerContent.querySelector('.logo');
        if (logo) {
            logo.after(menuToggle);
        }

        menuToggle.addEventListener('click', () => {
            nav.classList.toggle('active');
            menuToggle.innerHTML = nav.classList.contains('active') ? '✕' : '☰';
        });
    }
};

// Initialize on load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initTest);
} else {
    initTest();
}
