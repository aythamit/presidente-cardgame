# Roadmap: El Presidente - Implementación Completa

## Estado del Proyecto

**Versión actual**: 0.1.0 (Básico multiplayer funcional)
**Versión objetivo**: 1.0.0 (Juego completo con todas las funcionalidades)

---

## FASE 1: Corrección de Baraja 🔴 PRIORIDAD ALTA

### 1.1 Expandir sistema de cartas a baraja francesa

**Archivos a modificar**:
- `backend/src/domain/Card.ts`
- `backend/src/domain/Deck.ts`

**Cambios necesarios**:
- [ ] Cambiar `CardType` de `["Espada", "Basto", "Oro", "Copa"]` a `["Treboles", "Diamantes", "Corazones", "Picas"]`
- [ ] Implementar valores 3-14 (3 al As)
- [ ] Crear las 52 cartas en `Deck.ts`
- [ ] Actualizar métodos de comparación

**Criterio de aceptación**:
- Deck genera 52 cartas únicas
- Valores jerárquicos correctos (3 < 4 < ... < K < As)

---

## FASE 2: Lógica de Juego Completa 🔴 PRIORIDAD ALTA

### 2.1 Implementar carta especial "2" (corta la mesa)

**Archivos a modificar**:
- `backend/src/domain/Game.ts`
- `backend/src/domain/Player.ts`

**Cambios necesarios**:
- [ ] Detectar cuando se juega un 2
- [ ] Limpiar mesa automáticamente
- [ ] Permitir al jugador tirar otra carta
- [ ] Enviar evento `tableCleared` al frontend

**Criterio de aceptación**:
- Al jugar un 2, la mesa se limpia
- El mismo jugador puede jugar otra carta
- Se notifica a todos los jugadores

---

### 2.2 Soportar todos los tipos de jugada

**Archivos a modificar**:
- `backend/src/domain/Player.ts`
- `backend/src/domain/Game.ts`

**Cambios necesarios**:
- [ ] Validar número de cartas (1, 2, 3 o 4)
- [ ] Validar que todas las cartas tengan el mismo valor
- [ ] Implementar `getPlayType()`: individual, pareja, trio, cuarteto
- [ ] Crear clase `PlayCombination` para representar jugadas

**Criterio de aceptación**:
- Se pueden jugar individuales, parejas, tríos y cuartetos
- Error si se mezclan valores diferentes
- Error si se juega más de 4 cartas

---

### 2.3 Implementar validación de jugadas

**Archivos a modificar**:
- `backend/src/domain/Game.ts`
- `backend/src/use-case/PlayHand.ts`

**Cambios necesarios**:
- [ ] Validar superioridad de valor (stricta, sin "igualar")
- [ ] Comparar solo el valor de las cartas, no el palo
- [ ] Manejar el caso cuando la mesa está vacía (cualquier carta es válida)

**Criterio de aceptación**:
- Pareja de 5 solo puede ser superada por pareja de 6+
- individual de K solo puede ser superada por As
- Primera carta de ronda: cualquier carta válida

---

### 2.4 Implementar reglas opcionales

**Archivos a modificar**:
- `backend/src/domain/Game.ts`
- `frontend/src/context/GameSettingsContext.tsx` (nuevo)

**2.4.1 Igualar Cartas**:
- [ ] Agregar setting `allowEqualCards: boolean`
- [ ] Permitir jugar misma carta sin superar

**2.4.2 Revolución**:
- [ ] Detectar 4 cartas iguales
- [ ] Invertir jerarquía hasta fin de ronda
- [ ] Emitir evento `revolutionStarted`

**2.4.3 Configuración de intercambio**:
- [ ] Agregar setting `presidentSwapCount: 1|2|3`
- [ ] Agregar setting `viceSwapCount: 1|2`

---

## FASE 3: Sistema de Roles 🔴 PRIORIDAD ALTA

### 3.1 Definir tipos de roles

**Archivos a crear/modificar**:
- `backend/src/domain/PlayerRole.ts` (nuevo)
- `backend/src/domain/Player.ts`

**Cambios necesarios**:
- [ ] Crear enum `PlayerRole`: PRESIDENT, VICE_PRESIDENT, CITIZEN, VICE_SCUM, SCUM
- [ ] Agregar `role: PlayerRole` a Player
- [ ] Agregar método `assignRole(position: number, totalPlayers: number)`

**Criterio de aceptación**:
- 4 jugadores → 1º=PRESIDENT, 2º=VP, 3º=SCUM, 4º=VICE_SCUM
- 5+ jugadores → Roles intermedios como CITIZEN

---

### 3.2 Implementar lógica de intercambio

**Archivos a crear/modificar**:
- `backend/src/use-case/CardExchange.ts` (nuevo)
- `backend/src/domain/Game.ts`

**Cambios necesarios**:
- [ ] Extraer mejores/peores cartas por jugador
- [ ] Ejecutar intercambio según roles
- [ ] Validar que todos los intercambios se completen
- [ ] Enviar nuevas manos a jugadores

**Criterio de aceptación**:
- Presidente recibe 2 cartas de Escoria, da 2 peores
- Vicepresidente recibe 1 carta de Vice-Escoria, da 1 peor
- Se notifica a cada jugador de su nueva mano

---

### 3.3 Integrar roles en flujo de juego

**Archivos a modificar**:
- `backend/src/infrastructure/RoomController.ts`
- `backend/src/domain/Game.ts`

**Cambios necesarios**:
- [ ] Después de terminar partida → mostrar pantalla de roles
- [ ] Ejecutar intercambio de cartas
- [ ] Iniciar nueva ronda automáticamente

---

## FASE 4: Inteligencia Artificial 🟡 PRIORIDAD MEDIA

### 4.1 Crear estructura de IA

**Archivos a crear**:
- `backend/src/ai/BaseAI.ts` (nuevo)
- `backend/src/ai/EasyAI.ts` (nuevo)
- `backend/src/ai/HardAI.ts` (nuevo)

**Cambios necesarios**:
- [ ] Interfaz común `AIPlayer extends Player`
- [ ] Método `getMove(cardsOnTable: PlayerPlay[]): PlayDecision`
- [ ] Timers para simular思考 tiempo

---

### 4.2 IA Fácil

**Reglas**:
- Juega siempre la carta válida más baja
- Pasa si no tiene cartas para superar
- No usa el 2 para cortar (lo guarda)

**Criterio de aceptación**:
- Bot siempre hace jugada válida
- Comportamiento predecible

---

### 4.3 IA Difícil

**Reglas**:
- Guarda los 2 para cortar la mesa estratégicamente
- Guarda los Ases para el final
- Detecta y "rompe" parejas de otros jugadores
- Pasa estratégicamente para forzar a otros

**Criterio de aceptación**:
- Bot muestra comportamiento inteligente
- Toma decisiones no triviales

---

### 4.4 Integrar IA en juego

**Archivos a modificar**:
- `backend/src/infrastructure/RoomController.ts`
- `frontend/src/components/Room.tsx`

**Cambios necesarios**:
- [ ] Opción "Jugar vs IA" en menú
- [ ] Slot para jugador IA en sala
- [ ] Eventos `aiTurnStarted`, `aiPlayed`, `aiPassed`

---

## FASE 5: UI/UX Completa 🟡 PRIORIDAD MEDIA

### 5.1 Menú Principal

**Archivos a crear/modificar**:
- `frontend/src/pages/Home.tsx` (nuevo)
- `frontend/src/App.tsx`

**Elementos**:
- [ ] Botón "Jugar Offline (vs IA)"
- [ ] Botón "Jugar Online"
- [ ] Botón "Crear Sala Privada"
- [ ] Botón "Reglas"
- [ ] Botón "Ajustes"

---

### 5.2 Pantalla de Configuración/Ajustes

**Archivos a crear**:
- `frontend/src/pages/Settings.tsx` (nuevo)

**Opciones**:
- [ ] Dificultad IA (Fácil/Difícil)
- [ ] Permitir igualar cartas (toggle)
- [ ] Habilitar revolución (toggle)
- [ ] Cantidad de intercambio (1-3)
- [ ] Con baraja francesa/española

---

### 5.3 Pantalla de Roles (Fin de partida)

**Archivos a crear**:
- `frontend/src/components/RolesScreen.tsx` (nuevo)

**Elementos**:
- [ ] Animación de asignación de roles
- [ ] Mostrar ranking: 1º=Presidente, 2º=VP, ..., último=Escoria
- [ ] Mostrar cartas a intercambiar
- [ ] Botón "Siguiente Ronda"

---

### 5.4 Mejoras visuales en sala

**Archivos a modificar**:
- `frontend/src/components/Room.tsx`
- `frontend/src/css/Room.css`

**Elementos**:
- [ ] Avatares de jugadores con nombre
- [ ] Contador de cartas por jugador
- [ ] Indicador de turno actual (borde brillante)
- [ ] Indicador de rol (si ya terminó)
- [ ] Animaciones de cartas jugadas

---

### 5.5 Página de Reglas

**Archivos a crear**:
- `frontend/src/pages/Rules.tsx` (nuevo)

**Elementos**:
- [ ] Mostrar contenido de REGLAS.md
- [ ] Navegación por secciones

---

## FASE 6: Backend y Persistencia 🟢 PRIORIDAD BAJA

### 6.1 Sistema de usuarios

**Archivos a crear**:
- `backend/src/domain/User.ts` (nuevo)
- `backend/src/infrastructure/AuthController.ts` (nuevo)

**Funcionalidades**:
- [ ] Registro con username/email/password
- [ ] Login con JWT
- [ ] Perfil de usuario

---

### 6.2 Estadísticas

**Archivos a crear**:
- `backend/src/domain/PlayerStats.ts` (nuevo)
- `backend/src/infrastructure/StatsController.ts` (nuevo)

**Estadísticas**:
- [ ] Partidas jugadas/ganadas/perdidas
- [ ] Veces que fue Presidente/Escoria
- [ ] Rachas de victorias
- [ ] Tiempo de juego total

---

### 6.3 Lista de amigos

**Archivos a crear**:
- `backend/src/domain/Friendship.ts` (nuevo)
- `backend/src/infrastructure/FriendsController.ts` (nuevo)

**Funcionalidades**:
- [ ] Enviar solicitud de amistad
- [ ] Aceptar/rechazar solicitudes
- [ ] Ver lista de amigos online
- [ ] Invitar amigo a sala

---

### 6.4 Base de datos

**Opciones**:
- [ ] MongoDB (NoSQL, flexible)
- [ ] PostgreSQL (SQL, relations)
- [ ] SQLite (para desarrollo)

---

## Tareas Técnicas

### Testing
- [ ] Unit tests para lógica de juego
- [ ] Integration tests para WebSocket
- [ ] E2E tests para flujo completo

### Documentación
- [ ] README actualizado
- [ ] API documentation (OpenAPI/Swagger)
- [ ] Documentar eventos Socket.io

### DevOps
- [ ] Docker setup
- [ ] GitHub Actions CI/CD
- [ ] Deploy script (Vercel/Heroku/Railway)

---

## Orden de Implementación Sugerido

```
1. FASE 1 (Baraja francesa)
   ↓
2. FASE 2.1 (Carta 2 - cortar)
   ↓
3. FASE 2.2 (Tipos de jugada)
   ↓
4. FASE 2.3 (Validación)
   ↓
5. FASE 5.1 (Menú principal)
   ↓
6. FASE 5.4 (Mejoras sala)
   ↓
7. FASE 3 (Roles)
   ↓
8. FASE 5.3 (Pantalla roles)
   ↓
9. FASE 4 (IA)
   ↓
10. FASE 2.4 (Opciones)
    ↓
11. FASE 5.2, 5.5 (Settings, Rules)
    ↓
12. FASE 6 (Backend completo)
```

---

## Métricas de Éxito

- [ ] 100% de reglas implementadas
- [ ] Tests cubriendo lógica de negocio
- [ ] UI funcional en móvil y desktop
- [ ] Partida completa de 4 jugadores ejecutable
- [ ] IA vencible en modo difícil
