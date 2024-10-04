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

        // Handle question types
        if (item.type === "short_answer") {
            const answerInput = document.createElement("textarea");
            answerInput.name = `question${index}`;
            answerInput.className = "short-answer-input";

            // Load previous user input if available
            if (userSelections[index]) {
                answerInput.value = userSelections[index];
            }

            // Save user input when changed
            answerInput.addEventListener('input', function() {
                userSelections[index] = this.value;
                saveUserSelections(); // Save to local storage
            });

            questionDiv.appendChild(answerInput); // Append textarea above the "Show Answer" button
        } else {
            // Create options for each question
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
        }

        // Add "Show Answer" button
        const showAnswerBtn = document.createElement("button");
        showAnswerBtn.innerText = "Show Answer";
        showAnswerBtn.className = "show-answer-btn";

        // Create a paragraph to display the correct answer
        const correctAnswer = document.createElement("p");
        correctAnswer.style.display = "none"; // Initially hidden

        if (item.multi_select) {
            const correctAnswersText = item.correct_options.map(i => item.options[i]).join(", ");
            correctAnswer.innerHTML = `<strong>Correct Answers:</strong> ${correctAnswersText}`;
        } else if (item.type !== "short_answer") {
            correctAnswer.innerHTML = `<strong>Correct Answer:</strong> ${item.options[item.answer]}`;
        } else {
            // Short answer questions don't need a correct answer displayed here
            correctAnswer.innerHTML = `<strong>Correct Answer:</strong> ${item.correct_answer}`;
        }

        // Function to show the correct answer
        function showCorrectAnswer() {
            correctAnswer.style.display = "block"; // Show the correct answer
        }

        // Function to hide the correct answer
        function hideCorrectAnswer() {
            correctAnswer.style.display = "none"; // Hide the correct answer
        }

        // Desktop: Show correct answer on mousedown, hide on mouseup or mouseleave
        showAnswerBtn.addEventListener("mousedown", showCorrectAnswer);
        showAnswerBtn.addEventListener("mouseup", hideCorrectAnswer);
        showAnswerBtn.addEventListener("mouseleave", hideCorrectAnswer);

        // Mobile: Show correct answer on touchstart, hide on touchend or touchcancel
        showAnswerBtn.addEventListener("touchstart", showCorrectAnswer);
        showAnswerBtn.addEventListener("touchend", hideCorrectAnswer);
        showAnswerBtn.addEventListener("touchcancel", hideCorrectAnswer);

        questionDiv.appendChild(showAnswerBtn); // Add the button to the question
        questionDiv.appendChild(correctAnswer); // Add the correct answer paragraph

        quizContainer.appendChild(questionDiv); // Add the question to the quiz container
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

function submitQuiz() {
    const resultDiv = document.getElementById("result");
    let score = 0;

    quizData.questions.forEach((item, index) => {
        const questionDiv = document.querySelectorAll(".question")[index];
        let isCorrect = false;
        let isPartiallyCorrect = false;

        if (item.type === "short_answer") {
            // Handle short answer questions
            const answerInput = document.querySelector(`textarea[name="question${index}"]`);
            const userAnswer = answerInput ? answerInput.value.trim() : "";

            // Show the correct answer for short answer questions
            const correctAnswer = document.createElement("p");
            correctAnswer.innerHTML = `<strong>Correct Answer:</strong> ${item.correct_answer}`;
            questionDiv.appendChild(correctAnswer);

            // Compare the user's answer to the correct answer for scoring
            if (userAnswer === item.correct_answer) {
                isCorrect = true;
            }

            // No color change for short answer questions
            questionDiv.classList.remove('correct', 'partially-correct', 'incorrect'); // Remove all classes

        } else if (item.multi_select) {
            // Handle multi-select (checkbox) questions
            const selectedOptions = Array.from(document.querySelectorAll(`.question:nth-child(${index + 1}) input[type="checkbox"]:checked`)).map(option => parseInt(option.value));
            const correctAnswers = item.correct_options;

            // Sort both arrays before comparison
            selectedOptions.sort((a, b) => a - b);
            correctAnswers.sort((a, b) => a - b);

            // Check if all selected answers are correct
            isCorrect = selectedOptions.length === correctAnswers.length && selectedOptions.every((val, i) => val === correctAnswers[i]);

            // Check if there are some correct answers but not all
            const correctSelections = selectedOptions.filter(val => correctAnswers.includes(val));
            if (!isCorrect && correctSelections.length > 0) {
                isPartiallyCorrect = true;
            }

            // Show the correct answers for multi-select questions
            const correctAnswer = document.createElement("p");
            const correctAnswersText = correctAnswers.map(i => item.options[i]).join(", ");
            correctAnswer.innerHTML = `<strong>Correct Answers:</strong> ${correctAnswersText}`;
            questionDiv.appendChild(correctAnswer);

        } else {
            // Handle single-select (radio) questions
            const selectedOption = document.querySelector(`input[name="question${index}"]:checked`);

            if (selectedOption && parseInt(selectedOption.value) === item.answer) {
                isCorrect = true;
            }

            // Show the correct answer for single-select questions
            const correctAnswer = document.createElement("p");
            correctAnswer.innerHTML = `<strong>Correct Answer:</strong> ${item.options[item.answer]}`;
            questionDiv.appendChild(correctAnswer);
        }

        // Mark the question's background color based on correctness, only for non-short answer questions
        if (item.type !== "short_answer") {
            if (isCorrect) {
                questionDiv.classList.add('correct'); // Add correct class
                score++;
            } else if (isPartiallyCorrect) {
                questionDiv.classList.add('partially-correct'); // Add partially correct class
            } else {
                questionDiv.classList.add('incorrect'); // Add incorrect class
            }
        }

        // Hide the "Show Answer" button after submission
        const showAnswerBtn = questionDiv.querySelector(".show-answer-btn");
        if (showAnswerBtn) {
            showAnswerBtn.style.display = 'none';
        }
    });

    // Calculate total questions excluding short answer for score
    const totalQuestions = quizData.questions.filter(q => q.type !== "short_answer").length;

    // Display score and total questions
    document.getElementById("score-value").innerText = score;
    document.getElementById("total-questions").innerText = totalQuestions;

    resultDiv.innerHTML = `You scored ${score} out of ${totalQuestions}.`;

    // Disable the submit button after submitting
    document.getElementById("submit-btn").disabled = true;
}

// Toggle dark mode function
const toggleDarkMode = () => {
    document.body.classList.toggle('dark-mode');
    const questions = document.querySelectorAll('.question');
    questions.forEach(question => {
        // Check the current class and apply the appropriate color class based on correctness
        if (question.classList.contains('correct')) {
            question.classList.toggle('correct'); // Remove correct class
            question.classList.add('correct'); // Re-add to ensure it takes the right color
        } else if (question.classList.contains('partially-correct')) {
            question.classList.toggle('partially-correct'); // Remove partially correct class
            question.classList.add('partially-correct'); // Re-add to ensure it takes the right color
        } else if (question.classList.contains('incorrect')) {
            question.classList.toggle('incorrect'); // Remove incorrect class
            question.classList.add('incorrect'); // Re-add to ensure it takes the right color
        }
    });
};

// Call the load function on window load
window.onload = loadQuizData;


// Attach event listener to reset button
document.getElementById("reset-btn").onclick = resetQuiz;

// Attach event listener to submit button
document.getElementById("submit-btn").onclick = submitQuiz;
