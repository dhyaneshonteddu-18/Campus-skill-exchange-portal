// Requests Page JavaScript

requireLogin();

async function loadRequests() {
  try {
    const currentUser = getCurrentUser();

    const response = await apiCall(`/api/requests/${currentUser.userId}`);

    if (response.success) {
      displayReceivedRequests(response.receivedRequests);
      displaySentRequests(response.sentRequests);
    }
  } catch (error) {
    console.error('Failed to load requests:', error);
    showAlert('Failed to load requests', 'danger');
  }
}

function getStatusBadgeClass(status) {
  if (status === 'Pending') return 'badge-pending';
  if (status === 'Accepted') return 'badge-accepted';
  if (status === 'Rejected') return 'badge-rejected';
  return 'badge-primary';
}

function displayReceivedRequests(requests) {
  const container = document.getElementById('receivedRequests');

  if (requests.length === 0) {
    container.innerHTML = '<p class="text-muted">No received requests yet.</p>';
    return;
  }

  container.innerHTML = requests.map(req => `
    <div class="card mb-20">
      <div class="card-body">
        <div style="display: flex; justify-content: space-between; align-items: start; gap: 20px;">
          <div style="flex: 1;">
            <h5>${req.senderName}</h5>
            <p><strong>Wants to learn:</strong> ${req.skillName}</p>
            <p><strong>Department:</strong> ${req.senderDepartment}</p>
            <p><strong>Date:</strong> ${formatDate(req.createdAt)}</p>
            <p>
              <span class="badge ${getStatusBadgeClass(req.status)}">${req.status}</span>
            </p>
          </div>
          <div style="display: flex; gap: 10px; flex-direction: column;">
            ${req.status === 'Pending' 
              ? `
                <button class="btn btn-success btn-sm" onclick="acceptRequest('${req.requestId}')">Accept</button>
                <button class="btn btn-danger btn-sm" onclick="rejectRequest('${req.requestId}')">Reject</button>
              ` 
              : `<button class="btn btn-secondary btn-sm" disabled>${req.status}</button>`
            }
          </div>
        </div>
      </div>
    </div>
  `).join('');
}

function displaySentRequests(requests) {
  const container = document.getElementById('sentRequests');

  if (requests.length === 0) {
    container.innerHTML = '<p class="text-muted">No sent requests yet.</p>';
    return;
  }

  container.innerHTML = requests.map(req => `
    <div class="card mb-20">
      <div class="card-body">
        <div style="display: flex; justify-content: space-between; align-items: start; gap: 20px;">
          <div style="flex: 1;">
            <h5>${req.receiverName}</h5>
            <p><strong>Skill requested:</strong> ${req.skillName}</p>
            <p><strong>Department:</strong> ${req.receiverDepartment}</p>
            <p><strong>Date:</strong> ${formatDate(req.createdAt)}</p>
            <p>
              <span class="badge ${getStatusBadgeClass(req.status)}">${req.status}</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  `).join('');
}

async function acceptRequest(requestId) {
  if (!confirm('Accept this learning request?')) {
    return;
  }

  try {
    const response = await apiCall(`/api/requests/${requestId}/accept`, 'PUT');

    if (response.success) {
      showAlert('Request accepted!', 'success');
      loadRequests();
    }
  } catch (error) {
    showAlert(error.message || 'Failed to accept request', 'danger');
  }
}

async function rejectRequest(requestId) {
  if (!confirm('Reject this learning request?')) {
    return;
  }

  try {
    const response = await apiCall(`/api/requests/${requestId}/reject`, 'PUT');

    if (response.success) {
      showAlert('Request rejected', 'info');
      loadRequests();
    }
  } catch (error) {
    showAlert(error.message || 'Failed to reject request', 'danger');
  }
}

document.addEventListener('DOMContentLoaded', loadRequests);
