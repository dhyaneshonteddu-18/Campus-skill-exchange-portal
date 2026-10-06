// Login Page JavaScript

document.getElementById('loginForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;

  if (!email || !password) {
    showAlert('Email and password are required', 'danger');
    return;
  }

  try {
    const response = await apiCall('/api/login', 'POST', {
      email,
      password
    });

    if (response.success) {
      setCurrentUser(response.user);
      showAlert('Login successful! Redirecting...', 'success');
      setTimeout(() => {
        window.location.href = '/dashboard.html';
      }, 1500);
    }
  } catch (error) {
    showAlert(error.message || 'Login failed', 'danger');
  }
});
