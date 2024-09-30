let quizData; // To store the loaded quiz data

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
            renderQuiz();
        })
        .catch(error => {
            document.getElementById('quiz-container').innerText = 'Failed to load quiz.';
            console.error('Error loading quiz:', error);
        });
}



// Render the quiz
function renderQuiz() {
    const quizContainer = document.getElementById("quiz-container");
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

            optionLabel.appendChild(optionInput);
            optionLabel.append(option);

            questionDiv.appendChild(optionLabel);
            questionDiv.appendChild(document.createElement("br"));
        });

        quizContainer.appendChild(questionDiv);
    });
}

// Submit the quiz and calculate score
function submitQuiz() {
    const resultDiv = document.getElementById("result");
    let score = 0;

    quizData.questions.forEach((item, index) => {
        if (item.multi_select) {
            // Handle multi-select (checkbox) questions
            const selectedOptions = document.querySelectorAll(`input[type="checkbox"]:checked`);
            const selectedIndices = Array.from(selectedOptions).map(option => parseInt(option.value));
            const correctAnswers = item.correct_options;

            // Compare selected checkboxes with correct options
            if (selectedIndices.length === correctAnswers.length && selectedIndices.every(val => correctAnswers.includes(val))) {
                score++;
            }

        } else {
            // Handle single-select (radio) questions
            const selectedOption = document.querySelector(`input[name="question${index}"]:checked`);

            if (selectedOption && parseInt(selectedOption.value) === item.answer) {
                score++;
            }
        }

        // Reveal the correct answer
        const questionDiv = document.querySelectorAll(".question")[index];
        const correctAnswer = document.createElement("p");

        if (item.multi_select) {
            const correctAnswers = item.correct_options.map(i => item.options[i]).join(", ");
            correctAnswer.innerHTML = `<strong>Correct Answers:</strong> ${correctAnswers}`;
        } else {
            correctAnswer.innerHTML = `<strong>Correct Answer:</strong> ${item.options[item.answer]}`;
        }

        questionDiv.appendChild(correctAnswer);
    });

    resultDiv.innerText = `You scored ${score} out of ${quizData.questions.length}.`;
    document.getElementById("submit-btn").disabled = true;
}

// Initialize the quiz on page load
window.onload = loadQuizData;
