import type { Game } from "../game";

export class InputContext {
  private pressedKeys: Set<string>;

  constructor(public readonly game: Game) {
    this.pressedKeys = new Set<string>();
    this.addEventListeners();
  }

  private addEventListeners() {
    const canvas = this.game.canvas;
    canvas.addEventListener("keydown", this.handleKeyDown.bind(this));
    canvas.addEventListener("keyup", this.handleKeyUp.bind(this));
  }

  private handleKeyDown(event: KeyboardEvent) {
    this.pressedKeys.add(event.key);
  }

  private handleKeyUp(event: KeyboardEvent) {
    this.pressedKeys.delete(event.key);
  }

  public isPressed(key: string): boolean {
    return this.pressedKeys.has(key);
  }
}
