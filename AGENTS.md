# El Presidente - Agente Guidelines

## Project Overview

**El Presidente** is a real-time multiplayer card game implementing the classic Latin American "Presidente" (also known as "Dictator") card game. The project is a full-stack web application.

- **Frontend**: React 19 + TypeScript + Vite
- **Backend**: Node.js + TypeScript + Socket.io

## Build Commands

### Frontend
```bash
cd frontend

# Development
npm run dev              # Start Vite dev server (http://localhost:5173)

# Production
npm run build            # TypeScript check + Vite build
npm run lint             # Run ESLint

# Single file lint
npx eslint src/components/Room.tsx
```

### Backend
```bash
cd backend

# TypeScript check
npx tsc --noEmit        # Check without emitting

# Run server (requires ts-node)
npx ts-node index.ts     # Start WebSocket server (port 8081)

# Compile
npx tsc                 # Compile to JavaScript
```

## Code Style Guidelines

### TypeScript Conventions

1. **Types & Interfaces**
   - Use `export type` for unions and simple types
   - Use `export interface` for object shapes
   - Use `export class` for classes
   - Use PascalCase for types, interfaces, and classes
   ```typescript
   // Good
   export interface PlayerInfo {
     id: string;
     name: string;
     handLength: number;
   }
   
   export type PlayType = "play" | "pass";
   ```

2. **Variables & Functions**
   - Use camelCase for variables and functions
   - Use `const` by default, `let` only when reassignment is needed
   - Private class members use `private` keyword
   ```typescript
   private players: Player[];
   private currentPlayerIndex: number;
   
   public playTurn(player: Player, playType: PlayType): void { }
   ```

3. **Null Handling**
   - Use strict null checks
   - Use optional chaining: `room.game?.getCurrentPlayer()`
   - Use nullish coalescing: `value ?? default`

### React Conventions (Frontend)

1. **Components**
   - Function components with typed props
   - Props defined inline or in separate interface
   ```typescript
   interface CardProps {
     card: CardData;
     onClick?: () => void;
     selected?: boolean;
     disabled?: boolean;
   }
   
   function Card({ card, onClick, selected, disabled }: CardProps) { }
   ```

2. **Hooks**
   - Always include dependencies in useEffect arrays
   - Clean up event listeners in useEffect return
   ```typescript
   useEffect(() => {
     socket.on('event', handler);
     return () => socket.off('event', handler);
   }, [dependency]);
   ```

3. **State**
   - Use functional state updates when new state depends on previous
   ```typescript
   setHistory(prev => [...prev.slice(-50), value]);
   ```

### CSS Conventions

1. **BEM-like naming** with dashes
   ```css
   .player-chip { }
   .player-chip.active-turn { }
   .card-corner { }
   .card-corner.top-left { }
   ```

2. **Color values** - Use hex or rgb, not named colors
3. **Spacing** - Use consistent values (10px, 15px, 20px)

### File Structure

```
backend/src/
├── domain/          # Core entities (Card, Player, Game, etc.)
├── use-case/         # Business logic (CardExchange, InitGame)
├── ai/              # AI players (BaseAI, EasyAI, HardAI)
└── infrastructure/  # External interfaces (RoomController)

frontend/src/
├── components/       # Reusable UI components
├── pages/           # Route pages (Rules, Settings)
├── context/         # React contexts
├── css/             # Stylesheets
└── socket.ts       # Socket.io client
```

### Import Order

1. External libraries (React, socket.io-client)
2. Internal modules (../domain, ../components)
3. Relative imports
4. CSS/style imports

```typescript
import { useEffect, useState } from "react";
import { socket } from '../socket';
import { Link } from "react-router";
import UserContext from "../context/UserContext.tsx";
import '../css/Room.css';
```

### Naming Conventions

| Element | Convention | Example |
|---------|------------|---------|
| Files | PascalCase or kebab-case | `RoomController.ts`, `room-controller.ts` |
| Classes | PascalCase | `class Game { }` |
| Interfaces | PascalCase | `interface PlayerInfo { }` |
| Types | PascalCase | `type PlayType = "play" \| "pass"` |
| Variables | camelCase | `currentPlayer`, `handList` |
| Constants | camelCase or SCREAMING_SNAKE | `MAX_PLAYERS` or `maxPlayers` |
| CSS classes | kebab-case | `.player-chip`, `.card-corner` |

### Error Handling

- Use try-catch for async operations
- Log errors with console.error
- Return null or error types for expected failures
- Emit socket events for client notification

```typescript
try {
  const room = this.rooms.get(roomId);
  if (!room) {
    throw new Error(`Room ${roomId} does not exist`);
  }
} catch (error) {
  console.error('Error:', error);
}
```

### Git Workflow

1. Create feature branches: `feature/feature-name`
2. Commit messages follow conventional format:
   ```
   feat: Add new feature
   fix: Fix bug
   docs: Update documentation
   style: Code style changes (no logic change)
   refactor: Code refactoring
   ```
3. Keep commits atomic and focused

### Socket.io Events

**Client → Server:**
- `createRoom` - Create new room
- `joinRoom` - Join existing room
- `initGame` - Start the game
- `playTurn` - Play cards or pass

**Server → Client:**
- `sendPlayerList` - Updated player list
- `sendHand` - Player's card hand
- `sendCurrentTurn` - Boolean indicating turn
- `sendCardsOnPlay` - Cards on table
- `sendHistoryMessages` - Game messages
- `tableCleared` - When 2 clears the table
- `gameFinished` - When game ends

### Game Rules Reference

- French deck (52 cards): 3 to Ace (2 is special)
- Card hierarchy: 3 < 4 < 5 < ... < 10 < J < Q < K < A
- Special "2" card: Clears the table
- Can play: individuals, pairs, triplets, quartets (same rank)
- Must play same count and higher value
- Round ends when all active players pass consecutively

### Testing

Currently **no test framework configured**. To add tests:

```bash
# Backend - Jest
npm install --save-dev jest ts-jest @types/jest
npx jest

# Frontend - Vitest (already used by Vite)
npm install --save-dev vitest
```

### Common Issues

1. **Room ID case sensitivity**: Always normalize to uppercase
   ```typescript
   roomId.toUpperCase()
   ```

2. **Socket cleanup**: Always remove listeners in useEffect cleanup
   ```typescript
   return () => socket.off('event', handler);
   ```

3. **Type casting**: Use `as` for known types, avoid `@ts-ignore`
   ```typescript
   // Preferred
   const value = data as PlayerInfo;
   
   // Avoid
   // @ts-ignore
   const value = data;
   ```
