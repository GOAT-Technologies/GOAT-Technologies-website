// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('wf-form-Newsletter-Form');
    const nameInput = document.getElementById('Name');
    const emailInput = document.getElementById('Email-4');
    const submitButton = form.querySelector('input[type="submit"]');
    const successMessage = document.querySelector('.success-text');
    const errorMessage = document.querySelector('.w-form-fail');
  
    form.addEventListener('submit', function(event) {
      event.preventDefault();
      
      // Reset messages
      successMessage.style.display = 'none';
      errorMessage.style.display = 'none';
  
      // Validate inputs
      if (!validateName(nameInput.value)) {
        showError('Please enter a valid name.');
        return;
      }
  
      if (!validateEmail(emailInput.value)) {
        showError('Please enter a valid email address.');
        return;
      }
  
      // Get the reCAPTCHA response
      const recaptchaResponse = grecaptcha.getResponse();
      if (!recaptchaResponse) {
        showError('Please complete the reCAPTCHA.');
        return;
      }
  
      // Disable submit button and show loading state
      submitButton.disabled = true;
      submitButton.value = 'Submitting...';
  
      // Simulate form submission (replace with actual API call)
      setTimeout(function() {
        // Reset form and show success message
        form.reset();
        successMessage.style.display = 'block';
        submitButton.disabled = false;
        submitButton.value = 'Submit';
        
        // Reset reCAPTCHA
        grecaptcha.reset();
      }, 1500);
    });
  
    function validateName(name) {
      return name.trim().length > 0;
    }
  
    function validateEmail(email) {
      const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return re.test(email);
    }
  
    function showError(message) {
      errorMessage.textContent = message;
      errorMessage.style.display = 'block';
    }
  );