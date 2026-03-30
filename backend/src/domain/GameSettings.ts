export interface GameSettings {
  allowEqualCards: boolean;
  enableRevolution: boolean;
  presidentSwapCount: 1 | 2 | 3;
  viceSwapCount: 1 | 2;
}

export const DEFAULT_GAME_SETTINGS: GameSettings = {
  allowEqualCards: false,
  enableRevolution: false,
  presidentSwapCount: 2,
  viceSwapCount: 1,
};

export class GameSettingsManager {
  private settings: GameSettings;

  constructor(settings: Partial<GameSettings> = {}) {
    this.settings = { ...DEFAULT_GAME_SETTINGS, ...settings };
  }

  getSettings(): GameSettings {
    return { ...this.settings };
  }

  setAllowEqualCards(value: boolean): void {
    this.settings.allowEqualCards = value;
  }

  setEnableRevolution(value: boolean): void {
    this.settings.enableRevolution = value;
  }

  setPresidentSwapCount(count: 1 | 2 | 3): void {
    this.settings.presidentSwapCount = count;
  }

  setViceSwapCount(count: 1 | 2): void {
    this.settings.viceSwapCount = count;
  }

  shouldAllowEqualCards(): boolean {
    return this.settings.allowEqualCards;
  }

  shouldEnableRevolution(): boolean {
    return this.settings.enableRevolution;
  }

  getPresidentSwapCount(): number {
    return this.settings.presidentSwapCount;
  }

  getViceSwapCount(): number {
    return this.settings.viceSwapCount;
  }
}
