# Roadmap V2: El Presidente - Actualización

## Estado del Proyecto

**Versión actual**: 0.2.0 (Baraja española + 2-6 jugadores + UI responsive + Drag & Drop)
**Versión objetivo**: 1.0.0 (Juego completo con todas las funcionalidades)

---

## Cambios Implementados en V2

### V2-F1: Baraja Española ✅
**Estado**: Completado

**Cambios realizados**:
- Palos: Espadas, Bastos, Oros, Copas (40 cartas)
- Valores: 1, 2, 3, 4, 5, 6, 7, 10, 11, 12
- Jerarquía de juego: 1 < 2 < 3 < 4 < 5 < 6 < 7 < 10 < 11 < 12
- Carta especial "2" mantiene su función de cortar la mesa

**Archivos modificados**:
- `backend/src/domain/Card.ts`
- `backend/src/domain/Deck.ts`
- `frontend/src/components/Room.tsx`

---

### V2-F2: Soporte 2-6 Jugadores ✅
**Estado**: Completado

**Cambios realizados**:
- Mínimo de jugadores: 2
- Máximo de jugadores: 6
- Reparto equitativo de 40 cartas
- Jugadores adicionales reciben cartas extra

**Distribución de cartas**:
| Jugadores | Cartas por jugador | Notas |
|-----------|-------------------|-------|
| 2 | 20 | 40/2 = 20 exactas |
| 3 | 13, 13, 14 | 1 jugador con carta extra |
| 4 | 10 | 40/4 = 10 exactas |
| 5 | 8 | 40/5 = 8 exactas |
| 6 | 6, 7 | 2 jugadores con carta extra |

**Archivos modificados**:
- `backend/src/use-case/InitGame.ts`

---

### V2-F3: UI Responsive ✅
**Estado**: Completado

**Cambios realizados**:
- Diseño responsive para móvil (max-width: 600px)
- Diseño ultra-responsive (max-width: 400px)
- Tamaño de cartas adaptativo
- Botones siempre visibles
- Scroll horizontal para cartas

**Mejoras CSS**:
- `.room-header`: padding reducido
- `.game-table`: altura flexible
- `.player-hand`: contenedor con scroll
- `.action-bar`: posición fija visible
- `@media queries`: 3 breakpoints

**Archivos modificados**:
- `frontend/src/css/Room.css`

---

### V2-F4: Drag & Drop para Ordenar ✅
**Estado**: Completado

**Cambios realizados**:
- Botón "Ordenar" para ordenar automáticamente
- Drag & drop para reordenar manualmente
- Ordenamiento por: valor (ascendente) → palo (Oros, Copas, Espadas, Bastos)

**Orden de cartas**:
```
[1, 2, 3, 4, 5, 6, 7, 10, 11, 12]
Por palo: Oros → Copas → Espadas → Bastos
```

**Archivos modificados**:
- `frontend/src/components/Room.tsx`
- `frontend/src/css/Room.css`

**Componente nuevo**:
- `DraggableCard`: carta con soporte para drag & drop

---

## Funcionalidades Pendientes

### FASE 7: Sistema de Usuarios y Persistencia 🔴

#### 7.1 Sistema de usuarios
**Archivos a crear**:
- `backend/src/domain/User.ts`
- `backend/src/infrastructure/AuthController.ts`

**Funcionalidades**:
- [ ] Registro con username
- [ ] Perfil de usuario
- [ ] Sesiones persistentes

---

#### 7.2 Estadísticas
**Archivos a crear**:
- `backend/src/domain/PlayerStats.ts`
- `backend/src/infrastructure/StatsController.ts`

**Estadísticas**:
- [ ] Partidas jugadas/ganadas/perdidas
- [ ] Veces que fue Presidente/Escoria
- [ ] Rachas de victorias

---

#### 7.3 Base de datos
**Opciones a considerar**:
- [ ] SQLite (desarrollo simple)
- [ ] PostgreSQL (producción)
- [ ] MongoDB (flexible)

---

### FASE 8: Modo Offline vs IA 🟡

#### 8.1 Integrar IA en salas
**Cambios necesarios**:
- [ ] Slot para jugadores IA en sala
- [ ] Botón "Jugar vs IA" en menú
- [ ] Seleccionar dificultad (Fácil/Difícil)

**Archivos a modificar**:
- `frontend/src/App.tsx`
- `backend/src/infrastructure/RoomController.ts`

---

#### 8.2 IA en tiempo real
**Mejoras necesarias**:
- [ ] Timers para simular tiempo de思考
- [ ] Eventos `aiTurnStarted`, `aiPlayed`, `aiPassed`

---

### FASE 9: Mejoras de UX 🟢

#### 9.1 Pantalla de intercambio de cartas
**Cuando termina una partida**:
- [ ] Mostrar quién es Presidente/Escoria
- [ ] Animación de intercambio de cartas
- [ ] Botón "Siguiente Ronda"

---

#### 9.2 Notificaciones y sonidos
- [ ] Sonido al jugar carta
- [ ] Sonido al pasar
- [ ] Notificación cuando es tu turno

---

#### 9.3 Chat en sala
- [ ] Chat simple entre jugadores
- [ ] Emojis快捷

---

#### 9.4 Avatares
- [ ] Selección de avatar
- [ ] Colores para jugadores
- [ ] Animaciones de victoria/derrota

---

## Tareas Técnicas Pendientes

### Testing
- [ ] Unit tests para lógica de juego
- [ ] Tests para baraja española
- [ ] Integration tests para WebSocket

### Documentación
- [ ] README actualizado con instrucciones
- [ ] API documentation
- [ ] Wiki del proyecto

### DevOps
- [ ] Docker setup
- [ ] GitHub Actions CI/CD
- [ ] Deploy script

---

## Orden de Implementación Sugerido

```
1. FASE 7.1 (Sistema de usuarios)
   ↓
2. FASE 7.2 (Estadísticas)
   ↓
3. FASE 7.3 (Base de datos)
   ↓
4. FASE 8.1 (Integrar IA en salas)
   ↓
5. FASE 9.1 (Pantalla intercambio)
   ↓
6. FASE 9.2 (Sonidos)
   ↓
7. FASE 9.3 (Chat)
   ↓
8. FASE 9.4 (Avatares)
```

---

## Métricas de Éxito

- [ ] Baraja española funcionando correctamente
- [ ] Partidas de 2-6 jugadores ejecutables
- [ ] UI responsive en móvil y desktop
- [ ] Drag & drop funcional
- [ ] Sistema de usuarios implementado
- [ ] Modo offline vs IA funcional
- [ ] Tests cubriendo lógica de negocio

---

## Notas de Versión

### v0.2.0
- Cambio de baraja francesa a española
- Soporte para 2-6 jugadores
- UI responsive mejorada
- Drag & drop para ordenar cartas
- Botón de ordenar automático

### v0.1.0
- Versión inicial
- Multiplayer básico con Socket.io
- Sistema de turnos
- Roles (Presidente/Escoria)
- IA básica (Easy/Hard)
