// Smooth scrolling for navigation links
// document.querySelectorAll('a[href^="#"]').forEach(anchor => {
//     anchor.addEventListener('click', function (e) {
//         e.preventDefault();
//         document.querySelector(this.getAttribute('href')).scrollIntoView({
//             behavior: 'smooth'
//         });
//     });
// });

// Form submission handling
const form = document.getElementById('contact-form');
const submitBtn = document.getElementById('submit-btn');
const confirmationMessage = document.getElementById('confirmation-message');
const errorMessage = document.getElementById('error-message');

form.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    // Show loading state
    submitBtn.classList.add('loading');
    submitBtn.textContent = 'Sending...';
    
    try {
        const formData = new FormData(this);
        const response = await fetch('https://formsubmit.co/ajax/backup4np1234@gmail.com', {
            method: 'POST',
            body: formData
        });

        if (response.ok) {
            // Show success message
            confirmationMessage.classList.remove('hidden');
            confirmationMessage.classList.add('visible');
            errorMessage.classList.add('hidden');
            
            // Reset form
            form.reset();
            
            // Hide success message after 5 seconds
            setTimeout(() => {
                confirmationMessage.classList.remove('visible');
                confirmationMessage.classList.add('hidden');
            }, 5000);
        } else {
            throw new Error('Form submission failed');
        }
    } catch (error) {
        // Show error message
        errorMessage.classList.remove('hidden');
        errorMessage.classList.add('visible');
        confirmationMessage.classList.add('hidden');
        
        // Hide error message after 5 seconds
        setTimeout(() => {
            errorMessage.classList.remove('visible');
            errorMessage.classList.add('hidden');
        }, 5000);
    } finally {
        // Reset button state
        submitBtn.classList.remove('loading');
        submitBtn.textContent = 'Send Message';
    }
});

// Check if form was just submitted (for redirect)
window.onload = function() {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('submitted') === 'true') {
        confirmationMessage.classList.remove('hidden');
        confirmationMessage.classList.add('visible');
        setTimeout(() => {
            confirmationMessage.classList.remove('visible');
            confirmationMessage.classList.add('hidden');
        }, 5000);
    }
};