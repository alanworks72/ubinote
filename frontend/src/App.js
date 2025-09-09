import React, { useState, useEffect, useRef, useCallback } from 'react';
import NoteEditor from './components/NoteEditor';
import Preview from './components/Preview';
import NoteList from './components/NoteList';
import Settings from './components/Settings';
import { noteAPI } from './services/api';
import './App.css';

function App() {
  const [content, setContent] = useState('');
  const [title, setTitle] = useState('');
  const [saving, setSaving] = useState(false);
  const [notification, setNotification] = useState(null);
  const [selectedNote, setSelectedNote] = useState(null);
  const [apiStatus, setApiStatus] = useState({ connected: false, checking: true });
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  
  // Settings with default values  
  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem('ubinote-settings');
    return saved ? JSON.parse(saved) : {
      autoSaveEnabled: true,
      autoSaveInterval: 5,
      autoSaveOnChange: true,
      showSaveStatus: true
    };
  });
  const [showShortcuts, setShowShortcuts] = useState(false);

  // Refs for tracking original content and auto-save
  const autoSaveTimerRef = useRef(null);
  const originalContentRef = useRef('');
  const originalTitleRef = useRef('');

  useEffect(() => {
    checkApiHealth();
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event) => {
      // Ctrl+S: Save note
      if (event.ctrlKey && event.key === 's') {
        event.preventDefault();
        if (title.trim() && content.trim() && !saving) {
          handleSave();
          showNotification('💾 Saved with Ctrl+S', 'success');
        }
      }
      
      // Alt+N: New note
      if (event.altKey && event.key === 'n') {
        event.preventDefault();
        handleNewNote();
        showNotification('📝 New note created with Alt+N', 'success');
      }
      
      // Ctrl+K: Focus search (if implemented later)
      if (event.ctrlKey && event.key === 'k') {
        event.preventDefault();
        // Will be implemented with search feature
      }
      
      // Escape: Close modals
      if (event.key === 'Escape') {
        if (settingsOpen) {
          setSettingsOpen(false);
        } else if (showShortcuts) {
          setShowShortcuts(false);
        }
      }
      
      // Ctrl+?: Show keyboard shortcuts help
      if (event.ctrlKey && event.key === '?') {
        event.preventDefault();
        setShowShortcuts(true);
      }
      
      // F1: Show keyboard shortcuts help
      if (event.key === 'F1') {
        event.preventDefault();
        setShowShortcuts(true);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [title, content, saving, settingsOpen, showShortcuts]);

  const checkApiHealth = async () => {
    try {
      await noteAPI.healthCheck();
      setApiStatus({ connected: true, checking: false });
    } catch (error) {
      setApiStatus({ connected: false, checking: false });
    }
  };

  const showNotification = (message, type = 'success') => {
    const activeElement = document.activeElement;
    setNotification({ message, type });
    setTimeout(() => {
      setNotification(null);
      // Restore focus if it was lost
      if (activeElement && document.body.contains(activeElement)) {
        activeElement.focus();
      }
    }, 3000);
  };

  // Settings management
  const handleSettingsChange = useCallback((newSettings) => {
    setSettings(newSettings);
    localStorage.setItem('ubinote-settings', JSON.stringify(newSettings));
  }, []);

  // Check if content has actually changed from original
  const hasContentChanged = useCallback(() => {
    return title !== originalTitleRef.current || content !== originalContentRef.current;
  }, [title, content]);

  // Auto-save function - only saves if content changed
  const performAutoSave = useCallback(async () => {
    // Only auto-save if there are actual changes AND both title and content exist
    if (!hasContentChanged() || saving || !title.trim() || !content.trim()) {
      return;
    }

    try {
      setSaving(true);
      const response = await noteAPI.uploadNote(title.trim(), content, selectedNote);
      
      // Update selectedNote for new notes
      if (!selectedNote && response.filename) {
        setSelectedNote(response.filename);
      }
      
      // Update original content refs after successful save
      originalTitleRef.current = title;
      originalContentRef.current = content;
      
      setLastSaved(new Date());
      setHasUnsavedChanges(false);
      if (settings.showSaveStatus) {
        showNotification('Auto-saved', 'success');
      }
    } catch (error) {
      console.error('Auto-save failed:', error);
      if (settings.showSaveStatus) {
        showNotification('Auto-save failed', 'error');
      }
    } finally {
      setSaving(false);
    }
  }, [title, content, selectedNote, saving, hasContentChanged, settings.showSaveStatus]);

  // Track changes and update hasUnsavedChanges state
  useEffect(() => {
    const changed = hasContentChanged();
    setHasUnsavedChanges(changed);
    
    // Set up auto-save timer only if there are changes
    if (settings.autoSaveEnabled && changed) {
      // Clear existing timer
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
      
      // Set timer based on settings
      if (settings.autoSaveOnChange) {
        // Auto-save 2 seconds after last change
        autoSaveTimerRef.current = setTimeout(() => {
          performAutoSave();
        }, settings.autoSaveInterval * 1000);
      } else {
        // Auto-save based on interval
        autoSaveTimerRef.current = setTimeout(() => {
          performAutoSave();
        }, settings.autoSaveInterval * 1000);
      }
    }
    
    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
    };
  }, [title, content, settings.autoSaveEnabled, settings.autoSaveOnChange, settings.autoSaveInterval, hasContentChanged, performAutoSave]);

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
    };
  }, []);

  const handleSave = async () => {
    if (!title.trim() || !content.trim()) {
      showNotification('Please provide both title and content', 'error');
      return;
    }

    setSaving(true);
    try {
      const response = await noteAPI.uploadNote(title.trim(), content, selectedNote);
      showNotification(`Note saved successfully`);
      
      // Update selectedNote for new notes
      if (!selectedNote) {
        setSelectedNote(response.filename);
      }
      
      // Update original content refs after successful save
      originalTitleRef.current = title;
      originalContentRef.current = content;
      
      setLastSaved(new Date());
      setHasUnsavedChanges(false);
    } catch (error) {
      showNotification(`Save failed: ${error.message}`, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleNoteSelect = (noteData) => {
    if (!noteData) {
      // Handle case where noteData is null (e.g., after deletion)
      setTitle('');
      setContent('');
      setSelectedNote(null);
      setHasUnsavedChanges(false);
      setLastSaved(null);
      // Reset original content tracking
      originalTitleRef.current = '';
      originalContentRef.current = '';
      return;
    }
    
    setTitle(noteData.title);
    setContent(noteData.content);
    setSelectedNote(noteData.filename);
    setHasUnsavedChanges(false);
    setLastSaved(new Date(noteData.last_modified));
    
    // Set original content for change tracking
    originalTitleRef.current = noteData.title;
    originalContentRef.current = noteData.content;
  };

  const handleNewNote = () => {
    setTitle('');
    setContent('');
    setSelectedNote(null);
    setHasUnsavedChanges(false);
    setLastSaved(null);
    
    // Reset original content tracking for new note
    originalTitleRef.current = '';
    originalContentRef.current = '';
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
        <div className="header-buttons">
          <button onClick={handleNewNote} className="new-note-button">
            New Note
          </button>
          <button onClick={() => setShowShortcuts(true)} className="shortcuts-button">
            ⌨️ Shortcuts
          </button>
          <button onClick={() => setSettingsOpen(true)} className="settings-button">
            ⚙️ Settings
          </button>
        </div>
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
              hasUnsavedChanges={hasUnsavedChanges}
              lastSaved={lastSaved}
              showSaveStatus={settings.showSaveStatus}
            />
          </div>

          <div className="preview-section">
            <Preview content={content} />
          </div>
        </div>
      </div>

      <Settings
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        settings={settings}
        onSettingsChange={handleSettingsChange}
      />

      {/* Keyboard Shortcuts Modal */}
      {showShortcuts && (
        <div className="shortcuts-overlay" onClick={() => setShowShortcuts(false)}>
          <div className="shortcuts-modal" onClick={(e) => e.stopPropagation()}>
            <div className="shortcuts-header">
              <h2>⌨️ Keyboard Shortcuts</h2>
              <button onClick={() => setShowShortcuts(false)} className="close-button">×</button>
            </div>
            <div className="shortcuts-content">
              <div className="shortcuts-grid">
                <div className="shortcut-item">
                  <kbd>Ctrl</kbd> + <kbd>S</kbd>
                  <span>Save current note</span>
                </div>
                <div className="shortcut-item">
                  <kbd>Alt</kbd> + <kbd>N</kbd>
                  <span>Create new note</span>
                </div>
                <div className="shortcut-item">
                  <kbd>Ctrl</kbd> + <kbd>?</kbd>
                  <span>Show this help</span>
                </div>
                <div className="shortcut-item">
                  <kbd>F1</kbd>
                  <span>Show this help</span>
                </div>
                <div className="shortcut-item">
                  <kbd>Escape</kbd>
                  <span>Close modals</span>
                </div>
                <div className="shortcut-item shortcut-coming-soon">
                  <kbd>Ctrl</kbd> + <kbd>K</kbd>
                  <span>Search notes (coming soon)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;