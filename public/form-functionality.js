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
        console.log('Submitting form');
        const formData = new FormData(form);
        const formDataObject = Object.fromEntries(formData.entries());

        submitButton.value = 'Submitting...';
        submitButton.disabled = true;

        // Simulate server-side processing
        setTimeout(() => {
            processFormData(formDataObject)
                .then(response => {
                    console.log('Success:', response);
                    showSuccess();
                    form.reset();
                })
                .catch(error => {
                    console.error('Error:', error);
                    showError(`An error occurred. Please try again later. ${error.message}`);
                })
                .finally(() => {
                    submitButton.value = 'Submit';
                    submitButton.disabled = false;
                });
        }, 1000); // Simulate network delay
    }

    function processFormData(data) {
        // Simulate server-side processing and Google Sheets API interaction
        return new Promise((resolve, reject) => {
            console.log('Processing form data:', data);

            const requiredFields = ['name', 'Last-Name', 'Email-id', 'Select-Country', 'Enquiry-For'];
            for (let field of requiredFields) {
                if (!data[field]) {
                    reject(new Error(`Missing required field: ${field}`));
                    return;
                }
            }

            // Simulate appending data to Google Sheets
            const rowData = [
                data.name,
                data['Last-Name'],
                data['Email-id'],
                data.Company || '',
                data['Select-Country'],
                data['Phone-Number'] || '',
                data.City || '',
                data['Enquiry-For'],
                data['Contact-form-Message'] || '',
                new Date().toISOString() // Timestamp
            ];

            console.log('Data to be appended:', rowData);

            // Simulate successful submission
            resolve({ message: 'Form submitted successfully' });
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