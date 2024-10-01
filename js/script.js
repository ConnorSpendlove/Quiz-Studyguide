let quizData; // To store the loaded quiz data
let userSelections = {}; // To store user selections for local storage

// Load quiz data from a JSON file based on the URL parameter
function loadQuizData() {
    const urlParams = new URLSearchParams(window.location.search);
    let quizUrl = urlParams.get('quizUrl');

    // Check if running locally or on GitHub Pages
    if (window.location.hostname === '127.0.0.1' || window.location.hostname === 'localhost') {
        // Local environment
        quizUrl = quizUrl;  // Leave the quiz URL as it is for local development
    } else {
        // GitHub Pages environment
        quizUrl = quizUrl.replace('..', '/Quiz-Studyguide');  // Adjust the path for GitHub Pages
    }

    fetch(quizUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error("Quiz not found");
            }
            return response.json();
        })
        .then(data => {
            quizData = data;  // Store the quiz data globally
            loadUserSelections(); // Load user selections from local storage
            renderQuiz();     // Render the quiz after loading selections
        })
        .catch(error => {
            document.getElementById('quiz-container').innerText = 'Failed to load quiz.';
            console.error('Error loading quiz:', error);
        });
}

// Shuffle the questions
function shuffleQuestions() {
    quizData.questions.sort(() => Math.random() - 0.5); // Shuffle questions randomly
    renderQuiz(); // Re-render the quiz with shuffled questions
}

// Render the quiz
function renderQuiz() {
    const quizContainer = document.getElementById("quiz-container");
    quizContainer.innerHTML = ""; // Clear previous questions
    document.getElementById("quiz-title").innerText = quizData.title;

    quizData.questions.forEach((item, index) => {
        const questionDiv = document.createElement("div");
        questionDiv.className = "question";

        const questionTitle = document.createElement("h3");
        questionTitle.innerText = `${index + 1}. ${item.question}`;
        questionDiv.appendChild(questionTitle);

        item.options.forEach((option, i) => {
            const optionLabel = document.createElement("label");
            const optionInput = document.createElement("input");

            if (item.multi_select) {
                optionInput.type = "checkbox";  // Multi-select uses checkboxes
            } else {
                optionInput.type = "radio";     // Single-select uses radio buttons
                optionInput.name = `question${index}`;  // Group radio buttons by question
            }
            optionInput.value = i;

            // Check if the user has previously selected this option
            if (userSelections[index] && userSelections[index].includes(i)) {
                optionInput.checked = true; // Pre-check the option
            }

            // Save user selection in local storage when checked/unchecked
            optionInput.addEventListener('change', function() {
                if (item.multi_select) {
                    if (!userSelections[index]) {
                        userSelections[index] = [];
                    }
                    if (this.checked) {
                        userSelections[index].push(i);
                    } else {
                        userSelections[index] = userSelections[index].filter(option => option !== i);
                    }
                } else {
                    userSelections[index] = [i]; // For single-select, store only the selected option
                }
                saveUserSelections(); // Save selections to local storage
            });

            optionLabel.appendChild(optionInput);
            optionLabel.append(option);
            questionDiv.appendChild(optionLabel);
            questionDiv.appendChild(document.createElement("br"));
        });

        quizContainer.appendChild(questionDiv);
    });
}

// Save user selections to local storage
function saveUserSelections() {
    localStorage.setItem('userSelections', JSON.stringify(userSelections));
}

// Load user selections from local storage
function loadUserSelections() {
    const savedSelections = localStorage.getItem('userSelections');
    if (savedSelections) {
        userSelections = JSON.parse(savedSelections);
    }
}

// Function to reset the quiz
function resetQuiz() {
    document.getElementById("quiz-container").innerHTML = '';  // Clear quiz container
    document.getElementById("score-value").innerText = '0';  // Reset score display
    document.getElementById("total-questions").innerText = '0';  // Reset total questions display
    document.getElementById("result").innerHTML = '';  // Clear previous results
    document.getElementById("submit-btn").disabled = false;  // Re-enable submit button
    userSelections = {}; // Reset user selections
    localStorage.removeItem('userSelections'); // Clear local storage
    loadQuizData();  // Reload the quiz
}

// Function to submit the quiz
function submitQuiz() {
    const resultDiv = document.getElementById("result");
    let score = 0;

    quizData.questions.forEach((item, index) => {
        const questionDiv = document.querySelectorAll(".question")[index];

        if (item.multi_select) {
            // Handle multi-select (checkbox) questions
            const selectedOptions = Array.from(document.querySelectorAll(`input[name="question${index}"]:checked`)).map(option => parseInt(option.value));
            const correctAnswers = item.correct_options;

            // Store the user selection
            userSelections[index] = selectedOptions;

            // Compare selected checkboxes with correct options
            if (selectedOptions.length === correctAnswers.length && selectedOptions.every(val => correctAnswers.includes(val))) {
                score++;
                // Change background color to soft green for correct answers
                questionDiv.style.backgroundColor = '#d4edda'; // Soft green
            } else {
                // Change background color to soft red for incorrect answers
                questionDiv.style.backgroundColor = '#f8d7da'; // Soft red
            }
        } else {
            // Handle single-select (radio) questions
            const selectedOption = document.querySelector(`input[name="question${index}"]:checked`);

            // Store the user selection
            userSelections[index] = selectedOption ? [parseInt(selectedOption.value)] : [];

            if (selectedOption && parseInt(selectedOption.value) === item.answer) {
                score++;
                // Change background color to soft green for correct answers
                questionDiv.style.backgroundColor = '#d4edda'; // Soft green
            } else {
                // Change background color to soft red for incorrect answers
                questionDiv.style.backgroundColor = '#f8d7da'; // Soft red
            }
        }

        // Reveal the correct answer
        const correctAnswer = document.createElement("p");

        if (item.multi_select) {
            const correctAnswers = item.correct_options.map(i => item.options[i]).join(", ");
            correctAnswer.innerHTML = `<strong>Correct Answers:</strong> ${correctAnswers}`;
        } else {
            correctAnswer.innerHTML = `<strong>Correct Answer:</strong> ${item.options[item.answer]}`;
        }

        questionDiv.appendChild(correctAnswer);
    });

    // Update score display at the top
    document.getElementById("score-value").innerText = score;
    document.getElementById("total-questions").innerText = quizData.questions.length;

    // Update and show modal with score
    document.getElementById("modal-score-value").innerText = score;
    document.getElementById("modal-total").innerText = quizData.questions.length;
    document.getElementById("score-modal").style.display = "block";

    // Save selections to local storage
    saveUserSelections();

    // Disable submit button after submission
    document.getElementById("submit-btn").disabled = true;
}

// Function to close the modal
function closeModal() {
    document.getElementById("score-modal").style.display = "none";
}

// Initialize the quiz on page load
window.onload = loadQuizData;

// Add randomize button functionality
const randomizeButton = document.createElement("button");
randomizeButton.innerText = "Randomize?";
randomizeButton.onclick = shuffleQuestions; // Set the button click event
document.getElementById("quiz-container").insertAdjacentElement("beforebegin", randomizeButton); // Insert the button above the quiz

// Function to scroll to the top of the page
function scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Show or hide the "Back to Top" button based on scroll position
window.onscroll = function() {
    const backToTopButton = document.getElementById('back-to-top');
    if (document.body.scrollTop > 100 || document.documentElement.scrollTop > 100) {
        backToTopButton.classList.add('show');
    } else {
        backToTopButton.classList.remove('show');
    }
};
