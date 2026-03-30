export enum PlayerRole {
  PRESIDENT = "PRESIDENT",
  VICE_PRESIDENT = "VICE_PRESIDENT",
  CITIZEN = "CITIZEN",
  VICE_SCUM = "VICE_SCUM",
  SCUM = "SCUM"
}

export interface RoleAssignment {
  player: string;
  role: PlayerRole;
}

export function getRoleName(role: PlayerRole): string {
  switch (role) {
    case PlayerRole.PRESIDENT:
      return "El Presidente";
    case PlayerRole.VICE_PRESIDENT:
      return "Vicepresidente";
    case PlayerRole.CITIZEN:
      return "Ciudadano";
    case PlayerRole.VICE_SCUM:
      return "Vice-Escoria";
    case PlayerRole.SCUM:
      return "La Escoria";
    default:
      return "Desconocido";
  }
}

export function assignRoles(ranking: string[], totalPlayers: number): RoleAssignment[] {
  const assignments: RoleAssignment[] = [];
  
  if (totalPlayers < 2) {
    return assignments;
  }

  const sortedRanking = [...ranking];

  if (totalPlayers === 2) {
    assignments.push({ player: sortedRanking[0], role: PlayerRole.PRESIDENT });
    assignments.push({ player: sortedRanking[1], role: PlayerRole.SCUM });
  } else if (totalPlayers === 3) {
    assignments.push({ player: sortedRanking[0], role: PlayerRole.PRESIDENT });
    assignments.push({ player: sortedRanking[1], role: PlayerRole.CITIZEN });
    assignments.push({ player: sortedRanking[2], role: PlayerRole.SCUM });
  } else if (totalPlayers === 4) {
    assignments.push({ player: sortedRanking[0], role: PlayerRole.PRESIDENT });
    assignments.push({ player: sortedRanking[1], role: PlayerRole.VICE_PRESIDENT });
    assignments.push({ player: sortedRanking[2], role: PlayerRole.VICE_SCUM });
    assignments.push({ player: sortedRanking[3], role: PlayerRole.SCUM });
  } else {
    assignments.push({ player: sortedRanking[0], role: PlayerRole.PRESIDENT });
    assignments.push({ player: sortedRanking[1], role: PlayerRole.VICE_PRESIDENT });
    
    for (let i = 2; i < totalPlayers - 2; i++) {
      assignments.push({ player: sortedRanking[i], role: PlayerRole.CITIZEN });
    }
    
    assignments.push({ player: sortedRanking[totalPlayers - 2], role: PlayerRole.VICE_SCUM });
    assignments.push({ player: sortedRanking[totalPlayers - 1], role: PlayerRole.SCUM });
  }

  return assignments;
}
