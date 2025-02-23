export type CardType = "Espada" | "Basto" | "Oro" | "Copa";
export class Card {
  private number: number;
  private value: number;
  private type: CardType;

  constructor(n: number, value: number, type: CardType) {
    this.number = n;
    this.value = value;
    this.type = type;
  }

  toString(): string {
    return `${this.number.toString()} ${this.type}`;
  }

  getValue(): number {
    return this.value;
  }
  getNumber(): number {
    return this.number;
  }
  getType(): string {
    return this.type;
  }
}
