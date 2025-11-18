import React, { useState } from 'react';
import { Send, X } from 'lucide-react';
import { addScanComment } from '../utils/unifiedDataManager';
import './ScanCommentForm.css';

const ScanCommentForm = ({
  scanId,
  currentUser,
  parentComment = null,
  onSuccess,
  onCancel
}) => {
  const [commentText, setCommentText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!commentText.trim()) {
      alert('Please enter a comment');
      return;
    }

    if (!currentUser) {
      alert('You must be logged in to comment');
      return;
    }

    setIsSubmitting(true);

    try {
      const commentData = {
        userId: currentUser.id,
        userRole: currentUser.role,
        userName: currentUser.name,
        commentText: commentText.trim(),
        parentCommentId: parentComment?.id || null
      };

      const newComment = addScanComment(scanId, commentData);

      if (newComment) {
        setCommentText('');
        if (onSuccess) {
          onSuccess(newComment);
        }
      } else {
        alert('Failed to add comment. Please try again.');
      }
    } catch (error) {
      console.error('Error adding comment:', error);
      alert('Error adding comment. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setCommentText('');
    if (onCancel) {
      onCancel();
    }
  };

  return (
    <div className={`scan-comment-form ${parentComment ? 'reply-form' : ''}`}>
      {parentComment && (
        <div className="reply-to-indicator">
          <span>Replying to {parentComment.userName}</span>
          <button className="cancel-reply-btn" onClick={handleCancel}>
            <X size={16} />
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="comment-input-container">
          <textarea
            className="comment-input"
            placeholder={parentComment ? "Write your reply..." : "Add your feedback or comment..."}
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            rows={parentComment ? 3 : 4}
            disabled={isSubmitting}
          />
        </div>

        <div className="comment-form-actions">
          <div className="character-count">
            {commentText.length} characters
          </div>

          <div className="form-buttons">
            {!parentComment && commentText.length > 0 && (
              <button
                type="button"
                className="cancel-btn"
                onClick={() => setCommentText('')}
                disabled={isSubmitting}
              >
                Clear
              </button>
            )}

            <button
              type="submit"
              className="submit-btn"
              disabled={isSubmitting || !commentText.trim()}
            >
              {isSubmitting ? (
                <>
                  <span className="spinner"></span>
                  <span>Posting...</span>
                </>
              ) : (
                <>
                  <Send size={16} />
                  <span>{parentComment ? 'Reply' : 'Post Comment'}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default ScanCommentForm;
