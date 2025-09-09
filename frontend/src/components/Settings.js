import React, { useState } from 'react';
import './Settings.css';

const Settings = ({ isOpen, onClose, settings, onSettingsChange }) => {
  const [localSettings, setLocalSettings] = useState(settings);

  const handleSettingChange = (key, value) => {
    const updatedSettings = { ...localSettings, [key]: value };
    setLocalSettings(updatedSettings);
    onSettingsChange(updatedSettings);
  };

  if (!isOpen) return null;

  return (
    <div className="settings-overlay">
      <div className="settings-modal">
        <div className="settings-header">
          <h2>Settings</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>
        
        <div className="settings-content">
          <div className="setting-group">
            <h3>Auto-save</h3>
            
            <div className="setting-item">
              <label>
                <input
                  type="checkbox"
                  checked={localSettings.autoSaveEnabled}
                  onChange={(e) => handleSettingChange('autoSaveEnabled', e.target.checked)}
                />
                Enable auto-save
              </label>
            </div>

            <div className="setting-item">
              <label>
                Auto-save interval (seconds):
                <select
                  value={localSettings.autoSaveInterval}
                  onChange={(e) => handleSettingChange('autoSaveInterval', parseInt(e.target.value))}
                  disabled={!localSettings.autoSaveEnabled}
                >
                  <option value={3}>3 seconds</option>
                  <option value={5}>5 seconds</option>
                  <option value={10}>10 seconds</option>
                  <option value={15}>15 seconds</option>
                  <option value={30}>30 seconds</option>
                  <option value={60}>1 minute</option>
                </select>
              </label>
            </div>

            <div className="setting-item">
              <label>
                <input
                  type="checkbox"
                  checked={localSettings.autoSaveOnChange}
                  onChange={(e) => handleSettingChange('autoSaveOnChange', e.target.checked)}
                  disabled={!localSettings.autoSaveEnabled}
                />
                Auto-save on content change
              </label>
            </div>
          </div>

          <div className="setting-group">
            <h3>Editor</h3>
            
            <div className="setting-item">
              <label>
                <input
                  type="checkbox"
                  checked={localSettings.showSaveStatus}
                  onChange={(e) => handleSettingChange('showSaveStatus', e.target.checked)}
                />
                Show save status indicator
              </label>
            </div>
          </div>
        </div>

        <div className="settings-footer">
          <button className="settings-close-btn" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default Settings;