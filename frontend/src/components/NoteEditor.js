import React, { useRef, useEffect } from 'react';
import './NoteEditor.css';

const NoteEditor = ({ 
  content, 
  onContentChange, 
  onSave, 
  saving, 
  title, 
  onTitleChange,
  hasUnsavedChanges,
  lastSaved,
  showSaveStatus
}) => {
  const textareaRef = useRef(null);
  const titleRef = useRef(null);
  const cursorPositionRef = useRef(null);
  const lastActiveElementRef = useRef(null);

  // Store cursor position before saving
  const storeCursorPosition = () => {
    if (document.activeElement === textareaRef.current) {
      cursorPositionRef.current = textareaRef.current.selectionStart;
      lastActiveElementRef.current = 'textarea';
    } else if (document.activeElement === titleRef.current) {
      cursorPositionRef.current = titleRef.current.selectionStart;
      lastActiveElementRef.current = 'title';
    }
  };

  // Restore cursor position after saving
  useEffect(() => {
    if (!saving && cursorPositionRef.current !== null && lastActiveElementRef.current) {
      const targetElement = lastActiveElementRef.current === 'textarea' ? textareaRef.current : titleRef.current;
      if (targetElement) {
        targetElement.focus();
        targetElement.setSelectionRange(cursorPositionRef.current, cursorPositionRef.current);
        cursorPositionRef.current = null;
        lastActiveElementRef.current = null;
      }
    }
  }, [saving]);

  // Store cursor position when saving starts
  useEffect(() => {
    if (saving) {
      storeCursorPosition();
    }
  }, [saving]);
  const formatLastSaved = (date) => {
    if (!date) return '';
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);
    
    if (minutes > 0) {
      return `${minutes}m ago`;
    } else {
      return `${seconds}s ago`;
    }
  };

  return (
    <div className="note-editor">
      <div className="editor-header">
        <input
          ref={titleRef}
          type="text"
          placeholder="Enter note title..."
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          className="title-input"
        />
        <div className="editor-actions">
          {showSaveStatus && (
            <div className="save-status">
              {saving && <span className="saving-indicator">💾 Saving...</span>}
              {!saving && hasUnsavedChanges && <span className="unsaved-indicator">● Unsaved changes</span>}
              {!saving && !hasUnsavedChanges && lastSaved && (
                <span className="saved-indicator">✓ Saved {formatLastSaved(lastSaved)}</span>
              )}
            </div>
          )}
          <button
            onClick={onSave}
            disabled={saving || !title.trim() || !content.trim()}
            className="save-button"
          >
            {saving ? 'Saving...' : 'Save Note'}
          </button>
        </div>
      </div>
      <textarea
        ref={textareaRef}
        value={content}
        onChange={(e) => onContentChange(e.target.value)}
        placeholder="Start writing your markdown note here..."
        className="content-textarea"
      />
    </div>
  );
};

export default NoteEditor;