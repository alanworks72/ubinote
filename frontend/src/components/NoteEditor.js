import React, { useState } from 'react';
import './NoteEditor.css';

const NoteEditor = ({ content, onContentChange, onSave, saving, title, onTitleChange }) => {
  return (
    <div className="note-editor">
      <div className="editor-header">
        <input
          type="text"
          placeholder="Enter note title..."
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          className="title-input"
          disabled={saving}
        />
        <button
          onClick={onSave}
          disabled={saving || !title.trim() || !content.trim()}
          className="save-button"
        >
          {saving ? 'Saving...' : 'Save Note'}
        </button>
      </div>
      <textarea
        value={content}
        onChange={(e) => onContentChange(e.target.value)}
        placeholder="Start writing your markdown note here..."
        className="content-textarea"
        disabled={saving}
      />
    </div>
  );
};

export default NoteEditor;