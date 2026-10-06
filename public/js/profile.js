// Profile Page JavaScript

requireLogin();

let userSkills = [];

async function loadProfile() {
  try {
    const currentUser = getCurrentUser();

    // Display profile info
    document.getElementById('profileAvatar').textContent = getInitials(currentUser.name);
    document.getElementById('userName').textContent = currentUser.name;
    document.getElementById('userEmail').textContent = currentUser.email;
    document.getElementById('userDept').textContent = `Department: ${currentUser.department}`;
    document.getElementById('userYear').textContent = `Year: ${currentUser.year}`;

    // Fill edit form
    document.getElementById('editName').value = currentUser.name;
    document.getElementById('editDepartment').value = currentUser.department;
    document.getElementById('editYear').value = currentUser.year;
    document.getElementById('editBio').value = currentUser.bio || '';

    // Load skills
    const response = await apiCall(`/api/profile/${currentUser.userId}`);
    if (response.success) {
      userSkills = response.skills;
      displaySkills();
    }
  } catch (error) {
    console.error('Failed to load profile:', error);
    showAlert('Failed to load profile', 'danger');
  }
}

function displaySkills() {
  const skillsList = document.getElementById('skillsList');
  
  if (userSkills.length === 0) {
    skillsList.innerHTML = '<p class="text-muted">No skills added yet. Start by adding your first skill!</p>';
    return;
  }

  skillsList.innerHTML = userSkills.map(skill => `
    <div class="card mb-20">
      <div class="card-body">
        <div style="display: flex; justify-content: space-between; align-items: start;">
          <div>
            <h5>${skill.skillName}</h5>
            <p class="text-muted mb-0">${skill.description}</p>
            <small class="text-muted">Added: ${formatDate(skill.createdAt)}</small>
          </div>
          <button class="btn btn-danger btn-sm" onclick="deleteSkill('${skill.skillId}')">Delete</button>
        </div>
      </div>
    </div>
  `).join('');
}

async function deleteSkill(skillId) {
  if (!confirm('Are you sure you want to delete this skill?')) {
    return;
  }

  try {
    await apiCall(`/api/skills/${skillId}`, 'DELETE');
    showAlert('Skill deleted successfully', 'success');
    userSkills = userSkills.filter(s => s.skillId !== skillId);
    displaySkills();
  } catch (error) {
    showAlert('Failed to delete skill', 'danger');
  }
}

async function submitAddSkill() {
  try {
    const currentUser = getCurrentUser();
    const skillName = document.getElementById('skillName').value.trim();
    const description = document.getElementById('skillDescription').value.trim();

    if (!skillName || !description) {
      showAlert('Please fill in all fields', 'danger');
      return;
    }

    const response = await apiCall('/api/skills', 'POST', {
      userId: currentUser.userId,
      skillName,
      description
    });

    if (response.success) {
      showAlert('Skill added successfully', 'success');
      userSkills.push(response.skill);
      displaySkills();

      // Clear form and close modal
      document.getElementById('addSkillForm').reset();
      bootstrap.Modal.getInstance(document.getElementById('addSkillModal')).hide();
    }
  } catch (error) {
    showAlert(error.message || 'Failed to add skill', 'danger');
  }
}

document.getElementById('editProfileForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  try {
    const currentUser = getCurrentUser();
    const name = document.getElementById('editName').value.trim();
    const department = document.getElementById('editDepartment').value;
    const year = document.getElementById('editYear').value;
    const bio = document.getElementById('editBio').value.trim();

    const response = await apiCall(`/api/profile/${currentUser.userId}`, 'PUT', {
      name,
      department,
      year,
      bio
    });

    if (response.success) {
      // Update localStorage
      setCurrentUser(response.user);
      showAlert('Profile updated successfully', 'success');
      loadProfile();
    }
  } catch (error) {
    showAlert(error.message || 'Failed to update profile', 'danger');
  }
});

document.addEventListener('DOMContentLoaded', loadProfile);
