// Skills Page JavaScript

requireLogin();

let allSkills = [];

async function loadSkills(searchTerm = '') {
  try {
    let endpoint = '/api/skills';
    if (searchTerm) {
      endpoint += `?search=${encodeURIComponent(searchTerm)}`;
    }

    const response = await apiCall(endpoint);

    if (response.success) {
      allSkills = response.skills;
      displaySkills();
    }
  } catch (error) {
    console.error('Failed to load skills:', error);
    showAlert('Failed to load skills', 'danger');
  }
}

function displaySkills() {
  const skillsList = document.getElementById('skillsList');
  const currentUser = getCurrentUser();

  if (allSkills.length === 0) {
    skillsList.innerHTML = '<div class="alert alert-info">No skills found. Try a different search.</div>';
    return;
  }

  skillsList.innerHTML = allSkills.map(skill => `
    <div class="card mb-20">
      <div class="card-body">
        <div style="display: flex; justify-content: space-between; align-items: start; gap: 20px;">
          <div style="flex: 1;">
            <h5 style="color: var(--primary-color);">${skill.skillName}</h5>
            <p><strong>Offered by:</strong> ${skill.userName}</p>
            <p><strong>Department:</strong> ${skill.userDepartment} | <strong>Year:</strong> ${skill.userYear}</p>
            <p class="text-muted">${skill.description}</p>
            <small class="text-muted">Added: ${formatDate(skill.createdAt)}</small>
          </div>
          <div style="display: flex; gap: 10px;">
            ${skill.userId !== currentUser.userId 
              ? `<button class="btn btn-success btn-sm" onclick="sendRequest('${skill.skillId}', '${skill.skillName}', '${skill.userId}')">Request to Learn</button>` 
              : `<span class="badge badge-primary">Your Skill</span>`
            }
          </div>
        </div>
      </div>
    </div>
  `).join('');
}

async function sendRequest(skillId, skillName, receiverId) {
  try {
    const currentUser = getCurrentUser();

    if (currentUser.userId === receiverId) {
      showAlert('You cannot send a request to yourself', 'warning');
      return;
    }

    const response = await apiCall('/api/requests', 'POST', {
      senderId: currentUser.userId,
      receiverId,
      skillId,
      skillName
    });

    if (response.success) {
      showAlert(`Request to learn "${skillName}" sent successfully!`, 'success');
      loadSkills(document.getElementById('searchInput').value);
    }
  } catch (error) {
    showAlert(error.message || 'Failed to send request', 'danger');
  }
}

// Search functionality
document.getElementById('searchInput').addEventListener('keyup', (e) => {
  const searchTerm = e.target.value.trim();
  loadSkills(searchTerm);
});

document.addEventListener('DOMContentLoaded', () => {
  loadSkills();
});
