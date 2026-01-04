import React from 'react';
import { Modal, Button } from 'react-bootstrap';

const GroupMembersModal = ({
  show,
  onHide,
  members = [],
  admin = "",
  groupName = "",
  currentUser = "",
  onRemoveMember,
  isCurrentUserAdmin = false
}) => {
  // Sort members: admin first, then current user, then others
  const sortedMembers = [...members].sort((a, b) => {
    if (a === admin) return -1;
    if (b === admin) return 1;
    if (a === currentUser) return -1;
    if (b === currentUser) return 1;
    return a.localeCompare(b);
  });

  return (
    <Modal
      show={show}
      onHide={onHide}
      centered
      size="md"
      backdrop="static"
      className="group-members-modal"
      dialogClassName="modal-dialog-scrollable" // Add this for Bootstrap scrollable
    >
      <Modal.Header closeButton className="bg-info-subtle">
        <Modal.Title>
          <i className="bi bi-people-fill me-2"></i>
          {groupName} - Members ({members.length})
        </Modal.Title>
      </Modal.Header>
      
      <Modal.Body className="p-0" style={{ maxHeight: '60vh', overflowY: 'auto' }}>
        {/* Member Count Summary - Fixed at top */}
        <div className="member-summary p-3 border-bottom bg-light sticky-top">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h6 className="mb-0">Group Members</h6>
              <small className="text-muted">
                {members.length} member{members.length !== 1 ? 's' : ''} • Admin: {admin}
              </small>
            </div>
            <div className="badge bg-primary rounded-pill fs-6">
              {members.length}
            </div>
          </div>
        </div>

        {/* Members List - Scrollable */}
        <div className="members-list">
          {sortedMembers.map((member, index) => (
            <div
              key={member}
              className={`member-item p-3 border-bottom ${
                member === currentUser ? 'bg-info bg-opacity-10' : ''
              } ${member === admin ? 'border-start border-3 border-warning' : ''}`}
            >
              <div className="d-flex align-items-center justify-content-between">
                <div className="d-flex align-items-center flex-grow-1">
                  {/* Member Avatar */}
                  <div 
                    className="member-avatar me-3 flex-shrink-0"
                    style={{
                      width: '42px',
                      height: '42px',
                      borderRadius: '50%',
                      background: member === admin 
                        ? 'linear-gradient(135deg, #FFD700, #FFA500)'
                        : member === currentUser
                          ? 'linear-gradient(135deg, #667eea, #764ba2)'
                          : '#e9ecef',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: member === admin ? '#000' : '#fff',
                      fontWeight: 'bold',
                      fontSize: '16px',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                    }}
                  >
                    {member.charAt(0).toUpperCase()}
                    {member === admin && (
                      <span className="admin-badge">
                        <i className="bi bi-star-fill"></i>
                      </span>
                    )}
                  </div>
                  
                  {/* Member Info */}
                  <div className="flex-grow-1">
                    <div className="d-flex align-items-center">
                      <h6 className="mb-0 me-2 text-truncate" style={{ maxWidth: '150px' }}>
                        {member}
                      </h6>
                      {member === currentUser && (
                        <span className="badge bg-info ms-1">You</span>
                      )}
                    </div>
                    <div className="member-role">
                      {member === admin ? (
                        <span className="badge bg-warning text-dark">
                          <i className="bi bi-star-fill me-1"></i>Admin
                        </span>
                      ) : (
                        <span className="text-muted small">
                          <i className="bi bi-person-fill me-1"></i>Member
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Admin Controls */}
                {isCurrentUserAdmin && member !== currentUser && (
                  <Button
                    variant="outline-danger"
                    size="sm"
                    onClick={() => onRemoveMember && onRemoveMember(member)}
                    title={`Remove ${member} from group`}
                    className="flex-shrink-0 ms-2"
                  >
                    <i className="bi bi-person-dash"></i>
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </Modal.Body>
      
      <Modal.Footer className="bg-light border-top">
        <div className="w-100 d-flex justify-content-between align-items-center">
          <Button variant="secondary" onClick={onHide}>
            <i className="bi bi-x-circle me-1"></i>
            Close
          </Button>
          
          {isCurrentUserAdmin && (
            <div className="d-flex gap-2">
              <Button variant="outline-primary" size="sm">
                <i className="bi bi-person-plus me-1"></i>
                Invite
              </Button>
              <Button variant="outline-primary" size="sm">
                <i className="bi bi-link-45deg me-1"></i>
                Share Link
              </Button>
            </div>
          )}
        </div>
      </Modal.Footer>
    </Modal>
  );
};

export default GroupMembersModal;