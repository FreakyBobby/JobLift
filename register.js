document.addEventListener('DOMContentLoaded', () => {
    // Get form elements
    const registerForm = document.getElementById('register-form');
    const fullnameInput = document.getElementById('fullname');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirm-password');
    const roleSelect = document.getElementById('role');
    const phoneInput = document.getElementById('phone');
    const termsCheckbox = document.getElementById('terms');
    const togglePassword = document.getElementById('toggle-password');
    
    // Get error message elements
    const fullnameError = document.getElementById('fullname-error');
    const emailError = document.getElementById('email-error');
    const passwordError = document.getElementById('password-error');
    const confirmPasswordError = document.getElementById('confirm-password-error');
    const roleError = document.getElementById('role-error');
    const phoneError = document.getElementById('phone-error');
    const termsError = document.getElementById('terms-error');
    
    // Get password requirement elements
    const lengthCheck = document.getElementById('length-check');
    const uppercaseCheck = document.getElementById('uppercase-check');
    const lowercaseCheck = document.getElementById('lowercase-check');
    const numberCheck = document.getElementById('number-check');
    const specialCheck = document.getElementById('special-check');
    
    // Toggle password visibility
    togglePassword.addEventListener('click', () => {
        const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordInput.setAttribute('type', type);
        
        // Toggle eye icon
        togglePassword.classList.toggle('fa-eye');
        togglePassword.classList.toggle('fa-eye-slash');
    });
    
    // Password validation functions
    function validatePasswordLength(password) {
        return password.length >= 8;
    }
    
    function validateUppercase(password) {
        return /[A-Z]/.test(password);
    }
    
    function validateLowercase(password) {
        return /[a-z]/.test(password);
    }
    
    function validateNumber(password) {
        return /[0-9]/.test(password);
    }
    
    function validateSpecialChar(password) {
        return /[!@#$%^&*(),.?":{}|<>]/.test(password);
    }
    
    // Update password requirement indicators
    function updatePasswordRequirements(password) {
        if (validatePasswordLength(password)) {
            lengthCheck.classList.add('valid');
        } else {
            lengthCheck.classList.remove('valid');
        }
        
        if (validateUppercase(password)) {
            uppercaseCheck.classList.add('valid');
        } else {
            uppercaseCheck.classList.remove('valid');
        }
        
        if (validateLowercase(password)) {
            lowercaseCheck.classList.add('valid');
        } else {
            lowercaseCheck.classList.remove('valid');
        }
        
        if (validateNumber(password)) {
            numberCheck.classList.add('valid');
        } else {
            numberCheck.classList.remove('valid');
        }
        
        if (validateSpecialChar(password)) {
            specialCheck.classList.add('valid');
        } else {
            specialCheck.classList.remove('valid');
        }
    }
    
    // Password input event listener
    passwordInput.addEventListener('input', () => {
        updatePasswordRequirements(passwordInput.value);
    });
    
    // Form validation
    function validateEmail(email) {
        const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        return re.test(String(email).toLowerCase());
    }
    
    function validateFullName(name) {
        return name.trim().length >= 2;
    }
    
    function validatePassword(password) {
        return (
            validatePasswordLength(password) &&
            validateUppercase(password) &&
            validateLowercase(password) &&
            validateNumber(password) &&
            validateSpecialChar(password)
        );
    }
    
    function validatePhone(phone) {
        return /^\+?[\d\s-]{10,}$/.test(phone);
    }
    
    // Clear error messages
    function clearErrors() {
        fullnameError.textContent = '';
        emailError.textContent = '';
        passwordError.textContent = '';
        confirmPasswordError.textContent = '';
        roleError.textContent = '';
        phoneError.textContent = '';
        termsError.textContent = '';
        
        fullnameInput.classList.remove('error');
        emailInput.classList.remove('error');
        passwordInput.classList.remove('error');
        confirmPasswordInput.classList.remove('error');
        roleSelect.classList.remove('error');
        phoneInput.classList.remove('error');
    }
    
    // Show error message
    function showError(element, message) {
        element.textContent = message;
        element.parentElement.querySelector('input, select').classList.add('error');
    }
    
    // Handle form submission
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // Clear previous errors
        clearErrors();
        
        // Get form values
        const fullname = fullnameInput.value.trim();
        const email = emailInput.value.trim();
        const password = passwordInput.value;
        const confirmPassword = confirmPasswordInput.value;
        const role = roleSelect.value;
        const phone = phoneInput.value.trim();
        const terms = termsCheckbox.checked;
        
        // Validate full name
        if (!fullname) {
            showError(fullnameError, 'Full name is required');
            return;
        }
        
        if (!validateFullName(fullname)) {
            showError(fullnameError, 'Please enter a valid full name');
            return;
        }
        
        // Validate email
        if (!email) {
            showError(emailError, 'Email is required');
            return;
        }
        
        if (!validateEmail(email)) {
            showError(emailError, 'Please enter a valid email address');
            return;
        }
        
        // Validate password
        if (!password) {
            showError(passwordError, 'Password is required');
            return;
        }
        
        if (!validatePassword(password)) {
            showError(passwordError, 'Password does not meet requirements');
            return;
        }
        
        // Validate confirm password
        if (!confirmPassword) {
            showError(confirmPasswordError, 'Please confirm your password');
            return;
        }
        
        if (password !== confirmPassword) {
            showError(confirmPasswordError, 'Passwords do not match');
            return;
        }
        
        // Validate role
        if (!role) {
            showError(roleError, 'Please select a role');
            return;
        }
        
        // Validate phone
        if (phone && !validatePhone(phone)) {
            showError(phoneError, 'Please enter a valid phone number');
            return;
        }
        
        // Validate terms
        if (!terms) {
            showError(termsError, 'You must agree to the terms and conditions');
            return;
        }
        
        try {
            // Disable submit button and show loading state
            const submitButton = registerForm.querySelector('button[type="submit"]');
            const originalButtonText = submitButton.innerHTML;
            submitButton.disabled = true;
            submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Registering...';

            // Send registration request to backend
            const response = await fetch('/api/users/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    name: fullname,
                    email,
                    password,
                    role,
                    phone
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Registration failed');
            }

            // Store user data and token in localStorage
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));

            // Show success message
            showSuccessMessage();
            
            // Redirect to appropriate dashboard after a short delay
            setTimeout(() => {
                if (data.user.role === 'employer') {
                    window.location.href = '/employer-dashboard.html';
                } else {
                    window.location.href = '/student-dashboard.html';
                }
            }, 2000);

        } catch (error) {
            // Reset button state
            const submitButton = registerForm.querySelector('button[type="submit"]');
            submitButton.disabled = false;
            submitButton.innerHTML = 'Register';
            
            // Show error message
            showError(emailError, error.message);
        }
    });
    
    // Show success message
    function showSuccessMessage() {
        // Create success message element
        const successMessage = document.createElement('div');
        successMessage.className = 'success-message';
        successMessage.innerHTML = `
            <i class="fas fa-check-circle"></i>
            <p>Registration successful! Redirecting to dashboard...</p>
            <p class="login-link">Or <a href="/login.html">click here</a> to login</p>
        `;
        
        // Add success message to the form
        registerForm.appendChild(successMessage);
        
        // Disable form inputs
        fullnameInput.disabled = true;
        emailInput.disabled = true;
        passwordInput.disabled = true;
        confirmPasswordInput.disabled = true;
        roleSelect.disabled = true;
        phoneInput.disabled = true;
        termsCheckbox.disabled = true;
        document.querySelector('.form-actions button').disabled = true;
    }
}); 