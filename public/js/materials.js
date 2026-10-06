// Materials Page JavaScript

requireLogin();

async function loadMaterials() {
  try {
    const currentUser = getCurrentUser();

    // Load user's materials
    const userResponse = await apiCall(`/api/materials?userId=${currentUser.userId}`);
    if (userResponse.success) {
      displayUserMaterials(userResponse.materials);
    }

    // Load all materials
    const allResponse = await apiCall('/api/materials');
    if (allResponse.success) {
      displayAllMaterials(allResponse.materials);
    }
  } catch (error) {
    console.error('Failed to load materials:', error);
    showAlert('Failed to load materials', 'danger');
  }
}

function displayUserMaterials(materials) {
  const container = document.getElementById('materialsList');

  if (materials.length === 0) {
    container.innerHTML = '<div class="alert alert-info">You haven\'t uploaded any materials yet.</div>';
    return;
  }

  container.innerHTML = materials.map(material => `
    <div class="card mb-20">
      <div class="card-body">
        <div style="display: flex; justify-content: space-between; align-items: start; gap: 20px;">
          <div style="flex: 1;">
            <h5>📄 ${material.title}</h5>
            <p class="text-muted">${material.description}</p>
            <p><strong>File:</strong> ${material.fileName}</p>
            <small class="text-muted">Uploaded: ${formatDate(material.createdAt)}</small>
          </div>
          <div style="display: flex; gap: 10px; flex-direction: column;">
            <button class="btn btn-primary btn-sm" onclick="downloadMaterial('${material.materialId}', '${material.fileName}')">Download</button>
            <button class="btn btn-danger btn-sm" onclick="deleteMaterial('${material.materialId}')">Delete</button>
          </div>
        </div>
      </div>
    </div>
  `).join('');
}

function displayAllMaterials(materials) {
  const container = document.getElementById('allMaterialsList');
  const currentUser = getCurrentUser();

  if (materials.length === 0) {
    container.innerHTML = '<div class="alert alert-info">No materials available yet.</div>';
    return;
  }

  container.innerHTML = materials.map(material => {
    const isOwner = material.userId === currentUser.userId;
    return `
      <div class="card mb-20">
        <div class="card-body">
          <div style="display: flex; justify-content: space-between; align-items: start; gap: 20px;">
            <div style="flex: 1;">
              <h5>📄 ${material.title}</h5>
              <p><strong>By:</strong> ${material.userName}</p>
              <p class="text-muted">${material.description}</p>
              <p><strong>File:</strong> ${material.fileName}</p>
              <small class="text-muted">Uploaded: ${formatDate(material.createdAt)}</small>
            </div>
            <div>
              ${!isOwner 
                ? `<button class="btn btn-primary btn-sm" onclick="downloadMaterial('${material.materialId}', '${material.fileName}')">Download</button>`
                : `<span class="badge badge-primary">Your Material</span>`
              }
            </div>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

function downloadMaterial(materialId, fileName) {
  try {
    // Trigger download from server
    window.location.href = `/download/${materialId}`;
  } catch (error) {
    showAlert('Failed to download material', 'danger');
  }
}

async function deleteMaterial(materialId) {
  if (!confirm('Are you sure you want to delete this material?')) {
    return;
  }

  try {
    const response = await apiCall(`/api/materials/${materialId}`, 'DELETE');

    if (response.success) {
      showAlert('Material deleted successfully', 'success');
      loadMaterials();
    }
  } catch (error) {
    showAlert(error.message || 'Failed to delete material', 'danger');
  }
}

document.getElementById('uploadMaterialForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  try {
    const currentUser = getCurrentUser();
    const title = document.getElementById('materialTitle').value.trim();
    const description = document.getElementById('materialDescription').value.trim();
    const fileInput = document.getElementById('materialFile');
    const file = fileInput.files[0];

    if (!title || !description || !file) {
      showAlert('Please fill in all fields and select a file', 'danger');
      return;
    }

    // Validate file type
    const allowedExtensions = ['pdf', 'doc', 'docx', 'ppt', 'pptx', 'png', 'jpg', 'jpeg'];
    const fileName = file.name.toLowerCase();
    const fileExtension = fileName.split('.').pop();

    if (!allowedExtensions.includes(fileExtension)) {
      showAlert('File type not allowed. Only PDF, DOC, DOCX, PPT, PPTX, PNG, JPG, JPEG are allowed.', 'danger');
      return;
    }

    // In a real implementation, file would be uploaded to S3
    // For now, we just send file metadata
    const response = await apiCall('/api/materials', 'POST', {
      userId: currentUser.userId,
      title,
      description,
      fileName: file.name
    });

    if (response.success) {
      showAlert('Material uploaded successfully!', 'success');
      document.getElementById('uploadMaterialForm').reset();
      loadMaterials();
    }
  } catch (error) {
    showAlert(error.message || 'Failed to upload material', 'danger');
  }
});

document.addEventListener('DOMContentLoaded', loadMaterials);
