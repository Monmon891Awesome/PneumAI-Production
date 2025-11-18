import React, { useState, useEffect } from 'react';
import { MessageCircle, Reply, Edit, Trash2, User } from 'lucide-react';
import { getThreadedComments, deleteScanComment } from '../utils/unifiedDataManager';
import './ScanCommentThread.css';

const ScanCommentThread = ({ scanId, currentUser, onReply, onEdit, onDelete, refreshTrigger }) => {
  const [comments, setComments] = useState([]);
  const [expandedReplies, setExpandedReplies] = useState(new Set());

  useEffect(() => {
    loadComments();
  }, [scanId, refreshTrigger]);

  const loadComments = () => {
    const threadedComments = getThreadedComments(scanId);
    setComments(threadedComments);
  };

  const toggleReplies = (commentId) => {
    const newExpanded = new Set(expandedReplies);
    if (newExpanded.has(commentId)) {
      newExpanded.delete(commentId);
    } else {
      newExpanded.add(commentId);
    }
    setExpandedReplies(newExpanded);
  };

  const handleDelete = (commentId) => {
    if (window.confirm('Are you sure you want to delete this comment?')) {
      const success = deleteScanComment(commentId);
      if (success) {
        loadComments();
        if (onDelete) onDelete();
      }
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'doctor':
        return '#3b82f6'; // Blue
      case 'admin':
        return '#8b5cf6'; // Purple
      case 'patient':
        return '#10b981'; // Green
      default:
        return '#6b7280'; // Gray
    }
  };

  const getRoleBadge = (role) => {
    const labels = {
      doctor: 'Doctor',
      admin: 'Admin',
      patient: 'Patient'
    };
    return labels[role] || role;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    return date.toLocaleDateString();
  };

  const CommentItem = ({ comment, isReply = false }) => {
    const isOwner = currentUser && currentUser.id === comment.userId;
    const canModerate = currentUser && currentUser.role === 'admin';

    return (
      <div className={`comment-item ${isReply ? 'comment-reply' : ''}`}>
        <div className="comment-header">
          <div className="comment-author">
            <div
              className="author-avatar"
              style={{ backgroundColor: getRoleColor(comment.userRole) }}
            >
              <User size={16} />
            </div>
            <div className="author-info">
              <span className="author-name">{comment.userName}</span>
              <span
                className="author-role-badge"
                style={{ backgroundColor: getRoleColor(comment.userRole) }}
              >
                {getRoleBadge(comment.userRole)}
              </span>
            </div>
          </div>
          <span className="comment-date">{formatDate(comment.createdAt)}</span>
        </div>

        <div className="comment-body">
          <p className="comment-text">{comment.commentText}</p>
        </div>

        <div className="comment-actions">
          {!isReply && (
            <button
              className="comment-action-btn"
              onClick={() => onReply && onReply(comment)}
            >
              <Reply size={14} />
              <span>Reply</span>
            </button>
          )}

          {comment.replies && comment.replies.length > 0 && (
            <button
              className="comment-action-btn"
              onClick={() => toggleReplies(comment.id)}
            >
              <MessageCircle size={14} />
              <span>
                {expandedReplies.has(comment.id) ? 'Hide' : 'View'} {comment.replies.length} {comment.replies.length === 1 ? 'reply' : 'replies'}
              </span>
            </button>
          )}

          {(isOwner || canModerate) && (
            <>
              {isOwner && onEdit && (
                <button
                  className="comment-action-btn"
                  onClick={() => onEdit(comment)}
                >
                  <Edit size={14} />
                  <span>Edit</span>
                </button>
              )}
              <button
                className="comment-action-btn delete-btn"
                onClick={() => handleDelete(comment.id)}
              >
                <Trash2 size={14} />
                <span>Delete</span>
              </button>
            </>
          )}
        </div>

        {comment.replies && comment.replies.length > 0 && expandedReplies.has(comment.id) && (
          <div className="comment-replies">
            {comment.replies.map(reply => (
              <CommentItem key={reply.id} comment={reply} isReply={true} />
            ))}
          </div>
        )}
      </div>
    );
  };

  if (comments.length === 0) {
    return (
      <div className="no-comments">
        <MessageCircle size={48} className="no-comments-icon" />
        <p>No comments yet</p>
        <p className="no-comments-subtitle">Be the first to add feedback on this scan</p>
      </div>
    );
  }

  return (
    <div className="comment-thread">
      <div className="comment-thread-header">
        <MessageCircle size={20} />
        <h3>Comments ({comments.reduce((acc, c) => acc + 1 + (c.replies?.length || 0), 0)})</h3>
      </div>

      <div className="comment-list">
        {comments.map(comment => (
          <CommentItem key={comment.id} comment={comment} />
        ))}
      </div>
    </div>
  );
};

export default ScanCommentThread;
