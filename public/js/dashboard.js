// Dashboard Page JavaScript

requireLogin();

async function loadDashboard() {
  try {
    const currentUser = getCurrentUser();
    
    // Update welcome message
    document.getElementById('welcomeMessage').textContent = `Welcome, ${currentUser.name}!`;
    document.getElementById('subMessage').textContent = `${currentUser.department} | ${currentUser.year} Year`;

    // Load dashboard stats
    const response = await apiCall(`/api/dashboard/${currentUser.userId}`);

    if (response.success) {
      document.getElementById('skillCount').textContent = response.stats.skillCount;
      document.getElementById('pendingCount').textContent = response.stats.pendingRequests;
      document.getElementById('acceptedCount').textContent = response.stats.acceptedRequests;
      document.getElementById('materialCount').textContent = response.stats.materialCount;

      // Update profile summary
      document.getElementById('userEmail').textContent = currentUser.email;
      document.getElementById('userDept').textContent = currentUser.department;
      document.getElementById('userYear').textContent = currentUser.year;
      document.getElementById('userBio').textContent = currentUser.bio || 'Not set';
    }
  } catch (error) {
    console.error('Failed to load dashboard:', error);
    showAlert('Failed to load dashboard data', 'danger');
  }
}

document.addEventListener('DOMContentLoaded', loadDashboard);
