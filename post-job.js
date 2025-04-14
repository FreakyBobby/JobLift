document.addEventListener('DOMContentLoaded', () => {
    // Initialize variables
    const form = document.getElementById('postJobForm');
    const saveDraftBtn = document.getElementById('saveDraft');
    const submitBtn = document.getElementById('submitJob');
    const successMessage = document.querySelector('.success-message');
    const fileUpload = document.querySelector('.file-upload');
    const fileLabel = fileUpload.querySelector('label span');

    // Form validation
    function validateForm() {
        let isValid = true;
        const requiredFields = form.querySelectorAll('[required]');
        
        requiredFields.forEach(field => {
            const formGroup = field.closest('.form-group');
            if (!field.value.trim()) {
                formGroup.classList.add('error');
                isValid = false;
            } else {
                formGroup.classList.remove('error');
            }
        });

        // Validate salary range
        const salaryMin = document.getElementById('salaryMin');
        const salaryMax = document.getElementById('salaryMax');
        if (parseInt(salaryMin.value) > parseInt(salaryMax.value)) {
            salaryMin.closest('.form-group').classList.add('error');
            salaryMax.closest('.form-group').classList.add('error');
            isValid = false;
        }

        // Validate terms checkbox
        const terms = document.getElementById('terms');
        if (!terms.checked) {
            terms.closest('.form-group').classList.add('error');
            isValid = false;
        }

        return isValid;
    }

    // Handle file upload
    fileUpload.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            fileLabel.textContent = file.name;
            
            // Validate file type
            if (!file.type.startsWith('image/')) {
                showNotification('Please upload an image file', 'error');
                fileUpload.value = '';
                fileLabel.textContent = 'Choose a file or drag it here';
            }
        }
    });

    // Handle drag and drop
    fileUpload.addEventListener('dragover', (e) => {
        e.preventDefault();
        fileUpload.classList.add('dragover');
    });

    fileUpload.addEventListener('dragleave', () => {
        fileUpload.classList.remove('dragover');
    });

    fileUpload.addEventListener('drop', (e) => {
        e.preventDefault();
        fileUpload.classList.remove('dragover');
        
        const file = e.dataTransfer.files[0];
        if (file) {
            if (file.type.startsWith('image/')) {
                fileUpload.files = e.dataTransfer.files;
                fileLabel.textContent = file.name;
            } else {
                showNotification('Please upload an image file', 'error');
            }
        }
    });

    // Save form data as draft
    function saveDraft() {
        const formData = new FormData(form);
        const draftData = {};
        
        formData.forEach((value, key) => {
            draftData[key] = value;
        });

        localStorage.setItem('jobDraft', JSON.stringify(draftData));
        showNotification('Draft saved successfully!');
    }

    // Load draft data
    function loadDraft() {
        const draftData = JSON.parse(localStorage.getItem('jobDraft'));
        if (draftData) {
            Object.keys(draftData).forEach(key => {
                const field = form.querySelector(`[name="${key}"]`);
                if (field) {
                    field.value = draftData[key];
                }
            });
            showNotification('Draft loaded successfully!');
        }
    }

    // Submit form
    async function submitForm(formData) {
        try {
            submitBtn.classList.add('loading');
            
            // Get user data from session storage
            const userData = JSON.parse(sessionStorage.getItem('user'));
            if (!userData) {
                throw new Error('Please login to post a job');
            }

            // Prepare job data
            const jobData = {
                title: formData.get('title'),
                company: formData.get('company'),
                location: formData.get('location'),
                jobType: formData.get('jobType'),
                industry: formData.get('industry'),
                salaryRange: `${formData.get('salaryMin')} - ${formData.get('salaryMax')}`,
                description: formData.get('description'),
                qualifications: formData.get('qualifications'),
                contactEmail: formData.get('contactEmail'),
                postedBy: userData.id
            };

            // Send job posting request to backend
            const response = await fetch('/api/jobs', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${userData.token}`
                },
                body: JSON.stringify(jobData)
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to post job');
            }

            // Clear form and show success message
            form.reset();
            form.style.display = 'none';
            successMessage.classList.add('show');
            
            // Clear draft
            localStorage.removeItem('jobDraft');
            
            showNotification('Job posted successfully!');
            
            // Redirect to employer dashboard after a delay
            setTimeout(() => {
                window.location.href = 'employer-dashboard.html';
            }, 2000);
        } catch (error) {
            showNotification(error.message, 'error');
        } finally {
            submitBtn.classList.remove('loading');
        }
    }

    // Show notification
    function showNotification(message, type = 'success') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    // Event listeners
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        if (validateForm()) {
            const formData = new FormData(form);
            await submitForm(formData);
        }
    });

    saveDraftBtn.addEventListener('click', saveDraft);

    // Load draft on page load
    loadDraft();

    // Add input event listeners for real-time validation
    form.querySelectorAll('input, select, textarea').forEach(field => {
        field.addEventListener('input', () => {
            const formGroup = field.closest('.form-group');
            if (field.hasAttribute('required') && !field.value.trim()) {
                formGroup.classList.add('error');
            } else {
                formGroup.classList.remove('error');
            }
        });
    });

    // Handle salary range validation
    const salaryInputs = document.querySelectorAll('#salaryMin, #salaryMax');
    salaryInputs.forEach(input => {
        input.addEventListener('input', () => {
            const min = parseInt(document.getElementById('salaryMin').value);
            const max = parseInt(document.getElementById('salaryMax').value);
            
            if (min > max) {
                input.closest('.form-group').classList.add('error');
            } else {
                document.getElementById('salaryMin').closest('.form-group').classList.remove('error');
                document.getElementById('salaryMax').closest('.form-group').classList.remove('error');
            }
        });
    });
}); 