// Register Page JavaScript

document.getElementById('registerForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const fullName = document.getElementById('fullName').value.trim();
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;
  const confirmPassword = document.getElementById('confirmPassword').value;
  const department = document.getElementById('department').value;
  const year = document.getElementById('year').value;
  const bio = document.getElementById('bio').value.trim();

  // Validation
  if (!fullName || !email || !password || !confirmPassword || !department || !year) {
    showAlert('All required fields must be filled', 'danger');
    return;
  }

  if (password.length < 6) {
    showAlert('Password must be at least 6 characters long', 'danger');
    return;
  }

  if (password !== confirmPassword) {
    showAlert('Passwords do not match', 'danger');
    return;
  }

  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    showAlert('Please enter a valid email address', 'danger');
    return;
  }

  try {
    const response = await apiCall('/api/register', 'POST', {
      name: fullName,
      email,
      password,
      department,
      year,
      bio
    });

    if (response.success) {
      showAlert('Registration successful! Redirecting to login...', 'success');
      setTimeout(() => {
        window.location.href = '/login.html';
      }, 2000);
    }
  } catch (error) {
    showAlert(error.message || 'Registration failed', 'danger');
  }
});
