document.addEventListener('DOMContentLoaded', () => {
    // Get DOM elements
    const loginForm = document.getElementById('login-form');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const togglePassword = document.querySelector('.toggle-password');
    const rememberMe = document.getElementById('remember');
    const submitButton = loginForm.querySelector('button[type="submit"]');

    // Form validation state
    let isEmailValid = false;
    let isPasswordValid = false;

    // Load saved email if "Remember me" was checked
    if (localStorage.getItem('rememberedEmail')) {
        emailInput.value = localStorage.getItem('rememberedEmail');
        rememberMe.checked = true;
    }

    // Toggle password visibility
    togglePassword.addEventListener('click', () => {
        const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordInput.setAttribute('type', type);
        togglePassword.classList.toggle('fa-eye');
        togglePassword.classList.toggle('fa-eye-slash');
        
        // Update aria-label for accessibility
        togglePassword.setAttribute('aria-label', 
            type === 'password' ? 'Show password' : 'Hide password');
    });

    // Email validation with debounce
    let emailTimeout;
    emailInput.addEventListener('input', () => {
        clearTimeout(emailTimeout);
        emailTimeout = setTimeout(() => {
            validateEmail();
        }, 300);
    });

    // Password validation with debounce
    let passwordTimeout;
    passwordInput.addEventListener('input', () => {
        clearTimeout(passwordTimeout);
        passwordTimeout = setTimeout(() => {
            validatePassword();
        }, 300);
    });

    // Validate email format
    const validateEmail = () => {
        const emailError = document.getElementById('email-error');
        const email = emailInput.value.trim();
        
        if (!email) {
            emailError.textContent = 'Email is required';
            isEmailValid = false;
        } else if (!isValidEmail(email)) {
            emailError.textContent = 'Please enter a valid email address';
            isEmailValid = false;
        } else {
            emailError.textContent = '';
            isEmailValid = true;
        }
        
        updateSubmitButton();
        return isEmailValid;
    };

    // Validate password
    const validatePassword = () => {
        const passwordError = document.getElementById('password-error');
        const password = passwordInput.value;
        
        if (!password) {
            passwordError.textContent = 'Password is required';
            isPasswordValid = false;
        } else if (password.length < 8) {
            passwordError.textContent = 'Password must be at least 8 characters';
            isPasswordValid = false;
        } else {
            passwordError.textContent = '';
            isPasswordValid = true;
        }
        
        updateSubmitButton();
        return isPasswordValid;
    };

    // Email format validation
    const isValidEmail = (email) => {
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        return emailRegex.test(email);
    };

    // Update submit button state
    const updateSubmitButton = () => {
        submitButton.disabled = !(isEmailValid && isPasswordValid);
        submitButton.classList.toggle('disabled', !(isEmailValid && isPasswordValid));
    };

    // Handle form submission
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        if (!isEmailValid || !isPasswordValid) {
            showNotification('Please fix the errors in the form', 'error');
            return;
        }

        try {
            submitButton.disabled = true;
            submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Logging in...';

            const response = await fetch('/api/users/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email: emailInput.value,
                    password: passwordInput.value
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Login failed');
            }

            // Store the token
            localStorage.setItem('token', data.token);
            
            // Handle "Remember me"
            if (rememberMe.checked) {
                localStorage.setItem('rememberedEmail', emailInput.value);
            } else {
                localStorage.removeItem('rememberedEmail');
            }

            showNotification('Login successful!', 'success');
            
            // Redirect based on user role
            setTimeout(() => {
                if (data.user.role === 'employer') {
                    window.location.href = '/employer-dashboard.html';
                } else {
                    window.location.href = '/student-dashboard.html';
                }
            }, 1500);

        } catch (error) {
            showNotification(error.message, 'error');
            submitButton.disabled = false;
            submitButton.innerHTML = 'Login';
        }
    });

    // Show notification
    const showNotification = (message, type = 'success') => {
        // Remove any existing notifications
        const existingNotifications = document.querySelectorAll('.notification');
        existingNotifications.forEach(notification => notification.remove());

        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        
        // Add icon based on notification type
        const icon = type === 'success' ? 'check-circle' : 'exclamation-circle';
        notification.innerHTML = `<i class="fas fa-${icon}"></i> ${message}`;
        
        document.body.appendChild(notification);

        // Add animation class
        setTimeout(() => {
            notification.classList.add('show');
        }, 10);

        // Remove notification after 3 seconds
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, 3000);
    };

    // Add keyboard navigation for accessibility
    loginForm.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !submitButton.disabled) {
            submitButton.click();
        }
    });

    // Initialize form validation
    validateEmail();
    validatePassword();
}); 