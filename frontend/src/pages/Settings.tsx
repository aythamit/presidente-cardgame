import { useState } from "react";
import { Link } from "react-router";
import '../css/Settings.css';

interface GameSettings {
  allowEqualCards: boolean;
  enableRevolution: boolean;
  presidentSwapCount: 1 | 2 | 3;
  viceSwapCount: 1 | 2;
}

function Settings() {
  const [settings, setSettings] = useState<GameSettings>(() => {
    const saved = localStorage.getItem('gameSettings');
    return saved ? JSON.parse(saved) : {
      allowEqualCards: false,
      enableRevolution: false,
      presidentSwapCount: 2,
      viceSwapCount: 1
    };
  });

  const [saved, setSaved] = useState(false);

  const handleToggle = (key: keyof GameSettings) => {
    setSettings(prev => ({
      ...prev,
      [key]: !prev[key as keyof typeof prev]
    }));
    setSaved(false);
  };

  const handleSelect = (key: keyof GameSettings, value: number) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
    setSaved(false);
  };

  const saveSettings = () => {
    localStorage.setItem('gameSettings', JSON.stringify(settings));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="settings-container">
      <header className="settings-header">
        <Link to="/" className="back-btn">← Volver</Link>
        <h1>⚙️ Ajustes</h1>
      </header>

      <main className="settings-content">
        <section className="settings-section">
          <h2>🏆 Intercambio de Cartas</h2>
          
          <div className="setting-item">
            <label>Cartas del Presidente ↔ Escoria</label>
            <div className="select-buttons">
              {[1, 2, 3].map(num => (
                <button
                  key={num}
                  className={settings.presidentSwapCount === num ? 'active' : ''}
                  onClick={() => handleSelect('presidentSwapCount', num)}
                >
                  {num}
                </button>
              ))}
            </div>
          </div>

          <div className="setting-item">
            <label>Cartas del Vicepresidente ↔ Vice-Escoria</label>
            <div className="select-buttons">
              {[1, 2].map(num => (
                <button
                  key={num}
                  className={settings.viceSwapCount === num ? 'active' : ''}
                  onClick={() => handleSelect('viceSwapCount', num)}
                >
                  {num}
                </button>
              ))}
            </div>
          </div>
        </section>

        <section className="settings-section">
          <h2>🎯 Reglas Opcionales</h2>

          <div className="setting-item toggle">
            <div>
              <label>Igualar Cartas</label>
              <p>Permitir jugar la misma carta sin necesidad de superar</p>
            </div>
            <button
              className={`toggle-btn ${settings.allowEqualCards ? 'active' : ''}`}
              onClick={() => handleToggle('allowEqualCards')}
            >
              <span className="toggle-slider"></span>
            </button>
          </div>

          <div className="setting-item toggle">
            <div>
              <label>Revolución</label>
              <p>4 cartas iguales invierte la jerarquía de la ronda</p>
            </div>
            <button
              className={`toggle-btn ${settings.enableRevolution ? 'active' : ''}`}
              onClick={() => handleToggle('enableRevolution')}
            >
              <span className="toggle-slider"></span>
            </button>
          </div>
        </section>

        <button className="save-btn" onClick={saveSettings}>
          {saved ? '✓ Guardado' : 'Guardar Ajustes'}
        </button>
      </main>
    </div>
  );
}

export default Settings;
