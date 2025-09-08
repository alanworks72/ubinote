import React, { useState, useEffect } from 'react';
import { noteAPI } from '../services/api';
import './NoteList.css';

const NoteList = ({ onNoteSelect, selectedNote }) => {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadNotes = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await noteAPI.listNotes();
      setNotes(response.notes || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotes();
  }, []);

  const handleNoteClick = async (note) => {
    if (selectedNote === note.filename) {
      return;
    }
    
    try {
      setError(null);
      const response = await noteAPI.downloadNote(note.filename);
      onNoteSelect(response.data);
    } catch (err) {
      setError(`Failed to load note: ${err.message}`);
    }
  };

  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return dateString;
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
    return `${Math.round(bytes / (1024 * 1024))} MB`;
  };

  return (
    <div className="note-list">
      <div className="note-list-header">
        <h3>Saved Notes</h3>
        <button 
          onClick={loadNotes} 
          disabled={loading}
          className="refresh-button"
        >
          {loading ? 'Loading...' : 'Refresh'}
        </button>
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      <div className="notes-container">
        {loading ? (
          <div className="loading-message">Loading notes...</div>
        ) : notes.length === 0 ? (
          <div className="empty-message">
            No notes found. Create your first note!
          </div>
        ) : (
          <ul className="notes-list">
            {notes.map((note) => (
              <li 
                key={note.filename}
                className={`note-item ${selectedNote === note.filename ? 'selected' : ''}`}
                onClick={() => handleNoteClick(note)}
              >
                <div className="note-title">{note.title}</div>
                <div className="note-meta">
                  <span className="note-date">{formatDate(note.last_modified)}</span>
                  <span className="note-size">{formatFileSize(note.size)}</span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default NoteList;