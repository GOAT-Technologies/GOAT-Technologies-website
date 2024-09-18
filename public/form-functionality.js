document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM fully loaded and parsed');
    
    const form = document.getElementById('wf-form-Contact-Form');
    const submitButton = document.getElementById('submit-button');
    const successMessage = document.querySelector('.w-form-done');
    const errorMessage = document.querySelector('.w-form-fail');

    console.log('Form element:', form);

    if (form) {
        console.log('Adding submit event listener to form');
        form.addEventListener('submit', function(event) {
            event.preventDefault();
            console.log('Form submit event triggered');
            console.log('Default form submission prevented');
            if (validateForm()) {
                submitForm();
            }
        });
    } else {
        console.error('Form element not found');
    }

    function validateForm() {
        console.log('Validating form');
        let isValid = true;
        const requiredFields = form.querySelectorAll('[required]');

        requiredFields.forEach(function(field) {
            if (!field.value.trim()) {
                isValid = false;
                field.classList.add('error');
                console.error(`Validation error: ${field.name} is required`);
            } else {
                field.classList.remove('error');
            }
        });

        if (!isValid) {
            showError('Please fill in all required fields.');
        }

        return isValid;
    }

    function submitForm() {
        console.log('Submitting form via AJAX');
        const formData = new FormData(form);
        const formDataObject = Object.fromEntries(formData.entries());

        submitButton.value = 'Submitting...';
        submitButton.disabled = true;

        // Update the URL to use the current origin (same as the page)
        const submitUrl = `${window.location.origin}/submit-form`;
        console.log('Submitting to:', submitUrl);

        fetch(submitUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formDataObject)
        })
        .then(response => {
            console.log('Response received:', response);
            if (!response.ok) {
                return response.text().then(text => {
                    throw new Error(text || `HTTP error! status: ${response.status}`);
                });
            }
            return response.json();
        })
        .then(data => {
            console.log('Success:', data);
            showSuccess();
            form.reset();
        })
        .catch(error => {
            console.error('Error details:', error);
            showError(`An error occurred. Please try again later. ${error.message}`);
        })
        .finally(() => {
            submitButton.value = 'Submit';
            submitButton.disabled = false;
        });
    }

    function showSuccess() {
        console.log('Showing success message');
        successMessage.style.display = 'block';
        errorMessage.style.display = 'none';
        successMessage.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    function showError(message) {
        console.log('Showing error message:', message);
        errorMessage.textContent = message;
        errorMessage.style.display = 'block';
        successMessage.style.display = 'none';
        errorMessage.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
});