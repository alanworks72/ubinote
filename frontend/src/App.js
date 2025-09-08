import React, { useState, useEffect } from 'react';
import NoteEditor from './components/NoteEditor';
import Preview from './components/Preview';
import NoteList from './components/NoteList';
import { noteAPI } from './services/api';
import './App.css';

function App() {
  const [content, setContent] = useState('');
  const [title, setTitle] = useState('');
  const [saving, setSaving] = useState(false);
  const [notification, setNotification] = useState(null);
  const [selectedNote, setSelectedNote] = useState(null);
  const [apiStatus, setApiStatus] = useState({ connected: false, checking: true });

  useEffect(() => {
    checkApiHealth();
  }, []);

  const checkApiHealth = async () => {
    try {
      await noteAPI.healthCheck();
      setApiStatus({ connected: true, checking: false });
    } catch (error) {
      setApiStatus({ connected: false, checking: false });
    }
  };

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleSave = async () => {
    if (!title.trim() || !content.trim()) {
      showNotification('Please provide both title and content', 'error');
      return;
    }

    setSaving(true);
    try {
      const response = await noteAPI.uploadNote(title.trim(), content);
      showNotification(`Note saved successfully: ${response.filename}`);
      
      setSelectedNote(response.filename);
    } catch (error) {
      showNotification(`Save failed: ${error.message}`, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleNoteSelect = (noteData) => {
    setTitle(noteData.title);
    setContent(noteData.content);
    setSelectedNote(noteData.filename);
  };

  const handleNewNote = () => {
    setTitle('');
    setContent('');
    setSelectedNote(null);
  };

  if (apiStatus.checking) {
    return (
      <div className="app loading-screen">
        <div className="loading-message">
          <h2>Connecting to UbiNote API...</h2>
          <p>Please wait while we establish connection to the server.</p>
        </div>
      </div>
    );
  }

  if (!apiStatus.connected) {
    return (
      <div className="app error-screen">
        <div className="error-message">
          <h2>Cannot Connect to UbiNote API</h2>
          <p>Please make sure the backend server is running and try again.</p>
          <button onClick={checkApiHealth} className="retry-button">
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>UbiNote</h1>
        <p>Cloud-based Markdown Note App</p>
        <button onClick={handleNewNote} className="new-note-button">
          New Note
        </button>
      </header>

      {notification && (
        <div className={`notification ${notification.type}`}>
          {notification.message}
        </div>
      )}

      <div className="app-layout">
        <div className="sidebar">
          <NoteList 
            onNoteSelect={handleNoteSelect}
            selectedNote={selectedNote}
          />
        </div>

        <div className="main-content">
          <div className="editor-section">
            <NoteEditor
              content={content}
              onContentChange={setContent}
              title={title}
              onTitleChange={setTitle}
              onSave={handleSave}
              saving={saving}
            />
          </div>

          <div className="preview-section">
            <Preview content={content} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;