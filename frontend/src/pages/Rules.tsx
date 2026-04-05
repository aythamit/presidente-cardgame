import { Link } from "react-router";
import '../css/Rules.css';

function Rules() {
  return (
    <div className="rules-container">
      <header className="rules-header">
        <Link to="/" className="back-btn">← Volver</Link>
        <h1>📖 Reglas del Presidente</h1>
      </header>

      <main className="rules-content">
        <section className="rule-section">
          <h2>🎯 Objetivo del Juego</h2>
          <p>
            Ser el primer jugador en quedarse sin cartas en la mano. 
            El último jugador que se quede con cartas recibe el título de "Escoria" o "Culo".
          </p>
        </section>

        <section className="rule-section">
          <h2>🃏 La Baraja</h2>
          <p>Baraja francesa de 52 cartas (sin comodines).</p>
          
          <h3>Jerarquía de Cartas (de menor a mayor)</h3>
          <div className="card-hierarchy">
            <span>3 &lt; 4 &lt; 5 &lt; 6 &lt; 7 &lt; 8 &lt; 9 &lt; 10 &lt; J &lt; Q &lt; K &lt; A</span>
          </div>

          <div className="special-card">
            <h3>🃏 Carta Especial: El 2</h3>
            <p>
              El 2 actúa como carta de "corte" o "limpieza". Si alguien tira un 2, 
              la mesa se limpia automáticamente y ese jugador vuelve a tirar cualquier carta.
            </p>
          </div>
        </section>

        <section className="rule-section">
          <h2>🎮 Tipos de Jugadas</h2>
          <ul>
            <li><strong>Individual:</strong> 1 carta</li>
            <li><strong>Pareja:</strong> 2 cartas del mismo valor</li>
            <li><strong>Trío:</strong> 3 cartas del mismo valor</li>
            <li><strong>Cuarteto:</strong> 4 cartas del mismo valor</li>
          </ul>
          
          <div className="rule-note">
            <strong>Regla:</strong> Solo se pueden jugar cartas del mismo tipo 
            y deben ser de valor <strong>estrictamente superior</strong>.
          </div>
        </section>

        <section className="rule-section">
          <h2>👥 Sistema de Roles</h2>
          <p>Al final de cada partida, se asignan roles según el orden de eliminación:</p>
          
          <div className="roles-list">
            <div className="role-item president">
              <span className="role-name">🥇 El Presidente</span>
              <span className="role-desc">1º lugar - Recibe cartas de la Escoria</span>
            </div>
            <div className="role-item vice-president">
              <span className="role-name">🥈 Vicepresidente</span>
              <span className="role-desc">2º lugar - Recibe carta de Vice-Escoria</span>
            </div>
            <div className="role-item citizen">
              <span className="role-name">👤 Ciudadano</span>
              <span className="role-desc">3º lugar - Sin intercambio</span>
            </div>
            <div className="role-item vice-scum">
              <span className="role-name">🥉 Vice-Escoria</span>
              <span className="role-desc">Penúltimo - Da carta al VP</span>
            </div>
            <div className="role-item scum">
              <span className="role-name">💩 La Escoria</span>
              <span className="role-desc">Último - Da sus mejores cartas al Presidente</span>
            </div>
          </div>
        </section>

        <section className="rule-section">
          <h2>⚙️ Opciones de Configuración</h2>
          
          <div className="option-item">
            <h3>Igualar Cartas</h3>
            <p>Permite jugar la misma carta sin necesidad de superar.</p>
          </div>
          
          <div className="option-item">
            <h3>Revolución</h3>
            <p>Si alguien tira 4 cartas iguales, la jerarquía se invierte hasta el final de la ronda.</p>
          </div>
        </section>
      </main>
    </div>
  );
}

export default Rules;
