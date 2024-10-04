// Create a switch for dark mode
const createDarkModeToggle = () => {
    const toggleContainer = document.createElement('div');
    toggleContainer.style.position = 'fixed';
    toggleContainer.style.top = '20px';
    toggleContainer.style.right = '20px';
    toggleContainer.style.zIndex = '1000';

    const toggleLabel = document.createElement('label');
    toggleLabel.style.display = 'flex';
    toggleLabel.style.alignItems = 'center';
    toggleLabel.style.cursor = 'pointer';

    const toggleInput = document.createElement('input');
    toggleInput.type = 'checkbox';
    toggleInput.style.display = 'none'; // Hide the default checkbox

    // Create a slider for the switch
    const toggleSlider = document.createElement('span');
    toggleSlider.style.width = '40px';
    toggleSlider.style.height = '20px';
    toggleSlider.style.backgroundColor = '#72a1e5'; // Light color
    toggleSlider.style.borderRadius = '20px';
    toggleSlider.style.position = 'relative';
    toggleSlider.style.transition = 'background-color 0.3s ease';

    // Create the circle inside the slider
    const toggleCircle = document.createElement('span');
    toggleCircle.style.width = '16px';
    toggleCircle.style.height = '16px';
    toggleCircle.style.backgroundColor = '#fcf7ff'; // Light color for the circle
    toggleCircle.style.borderRadius = '50%';
    toggleCircle.style.position = 'absolute';
    toggleCircle.style.top = '2px';
    toggleCircle.style.left = '2px';
    toggleCircle.style.transition = 'transform 0.3s ease'; // Transition for the circle

    // Create text for the label
    const darkModeText = document.createElement('span');
    darkModeText.innerText = 'Dark Mode';
    darkModeText.style.marginLeft = '10px'; // Add space between the switch and text

    // Check local storage for dark mode preference
    if (localStorage.getItem('darkMode') === 'enabled') {
        document.body.classList.add('dark-mode');
        toggleInput.checked = true;
        toggleSlider.style.backgroundColor = '#1e0a74'; // Dark color for the slider
        toggleCircle.style.transform = 'translateX(20px)'; // Move circle to the right
    }

    toggleInput.addEventListener('change', () => {
        if (toggleInput.checked) {
            document.body.classList.add('dark-mode');
            localStorage.setItem('darkMode', 'enabled');
            toggleSlider.style.backgroundColor = '#1e0a74'; // Dark color for the slider
            toggleCircle.style.transform = 'translateX(20px)'; // Move circle to the right
        } else {
            document.body.classList.remove('dark-mode');
            localStorage.setItem('darkMode', 'disabled');
            toggleSlider.style.backgroundColor = '#72a1e5'; // Light color for the slider
            toggleCircle.style.transform = 'translateX(0)'; // Move circle back to the left
        }
    });

    toggleSlider.appendChild(toggleCircle);
    toggleLabel.appendChild(toggleInput);
    toggleLabel.appendChild(toggleSlider);
    toggleLabel.appendChild(darkModeText); // Append text to the label
    toggleContainer.appendChild(toggleLabel);
    document.body.appendChild(toggleContainer);
};

// Initialize dark mode toggle on page load
createDarkModeToggle();
