import type { Game } from "../game";

export class InputContext {
	private pressedKeys: Set<string>;

	constructor(public readonly game: Game) {
		this.pressedKeys = new Set<string>();
		this.addEventListeners();
	}

	private addEventListeners() {
		const canvas = this.game.canvas;

		// Make canvas focusable
		canvas.tabIndex = 0;

		// Add focus styles
		canvas.style.outline = "none";

		// Add event listeners to window instead of canvas to catch events even when canvas isn't focused
		window.addEventListener("keydown", this.handleKeyDown.bind(this));
		window.addEventListener("keyup", this.handleKeyUp.bind(this));

		// Add focus handlers
		canvas.addEventListener("focus", () => {
			// Could add a visual indicator that the game is focused
		});

		canvas.addEventListener("blur", () => {
			// Clear pressed keys when focus is lost to prevent stuck keys
			this.pressedKeys.clear();
		});
	}

	private handleKeyDown(event: KeyboardEvent) {
		// Only capture keys when the document has focus
		if (document.hasFocus()) {
			this.pressedKeys.add(event.key);
		}
	}

	private handleKeyUp(event: KeyboardEvent) {
		this.pressedKeys.delete(event.key);
	}

	public isPressed(key: string): boolean {
		return this.pressedKeys.has(key);
	}
}
