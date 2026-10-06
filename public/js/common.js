// Common JavaScript Functions

// Get current user from localStorage
function getCurrentUser() {
  const userJson = localStorage.getItem('currentUser');
  return userJson ? JSON.parse(userJson) : null;
}

// Set current user in localStorage
function setCurrentUser(user) {
  localStorage.setItem('currentUser', JSON.stringify(user));
}

// Clear current user
function clearCurrentUser() {
  localStorage.removeItem('currentUser');
}

// Check if user is logged in
function isLoggedIn() {
  return getCurrentUser() !== null;
}

// Redirect to login if not logged in
function requireLogin() {
  if (!isLoggedIn()) {
    window.location.href = '/login.html';
  }
}

// Logout
function logout() {
  clearCurrentUser();
  window.location.href = '/index.html';
}

// Show alert
function showAlert(message, type = 'info') {
  const alertDiv = document.getElementById('alert');
  if (!alertDiv) {
    const div = document.createElement('div');
    div.id = 'alert';
    div.className = `alert alert-${type} show`;
    div.textContent = message;
    document.body.insertBefore(div, document.body.firstChild);
    setTimeout(() => {
      div.classList.remove('show');
      setTimeout(() => div.remove(), 300);
    }, 4000);
  } else {
    alertDiv.textContent = message;
    alertDiv.className = `alert alert-${type} show`;
    setTimeout(() => {
      alertDiv.classList.remove('show');
    }, 4000);
  }
}

// API call wrapper
async function apiCall(endpoint, method = 'GET', data = null) {
  try {
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    if (data) {
      options.body = JSON.stringify(data);
    }

    const response = await fetch(endpoint, options);
    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || 'API call failed');
    }

    return result;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}

// Format date
function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

// Get initials for avatar
function getInitials(name) {
  return name
    .split(' ')
    .map(part => part.charAt(0))
    .join('')
    .toUpperCase();
}

// Update navigation based on login status
function updateNavigation() {
  const currentUser = getCurrentUser();
  const navBar = document.querySelector('.navbar-nav');
  
  if (!navBar) return;

  if (currentUser) {
    // Show logged-in navigation
    const dashboardLink = document.getElementById('nav-dashboard');
    const profileLink = document.getElementById('nav-profile');
    const skillsLink = document.getElementById('nav-skills');
    const requestsLink = document.getElementById('nav-requests');
    const materialsLink = document.getElementById('nav-materials');
    const logoutLink = document.getElementById('nav-logout');

    if (dashboardLink) dashboardLink.classList.remove('hidden');
    if (profileLink) profileLink.classList.remove('hidden');
    if (skillsLink) skillsLink.classList.remove('hidden');
    if (requestsLink) requestsLink.classList.remove('hidden');
    if (materialsLink) materialsLink.classList.remove('hidden');
    if (logoutLink) logoutLink.classList.remove('hidden');

    const loginLink = document.getElementById('nav-login');
    const registerLink = document.getElementById('nav-register');
    if (loginLink) loginLink.classList.add('hidden');
    if (registerLink) registerLink.classList.add('hidden');
  } else {
    // Show public navigation
    const dashboardLink = document.getElementById('nav-dashboard');
    const profileLink = document.getElementById('nav-profile');
    const skillsLink = document.getElementById('nav-skills');
    const requestsLink = document.getElementById('nav-requests');
    const materialsLink = document.getElementById('nav-materials');
    const logoutLink = document.getElementById('nav-logout');

    if (dashboardLink) dashboardLink.classList.add('hidden');
    if (profileLink) profileLink.classList.add('hidden');
    if (skillsLink) skillsLink.classList.add('hidden');
    if (requestsLink) requestsLink.classList.add('hidden');
    if (materialsLink) materialsLink.classList.add('hidden');
    if (logoutLink) logoutLink.classList.add('hidden');

    const loginLink = document.getElementById('nav-login');
    const registerLink = document.getElementById('nav-register');
    if (loginLink) loginLink.classList.remove('hidden');
    if (registerLink) registerLink.classList.remove('hidden');
  }
}

// Initialize page
document.addEventListener('DOMContentLoaded', updateNavigation);

// Also run immediately in case DOM is already loaded
updateNavigation();
