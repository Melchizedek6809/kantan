import { Game, Sprite, Texture } from "./lib";
import fairyAsset from "../gfx/fairy.png";
import pickupCoinAsset from "../sfx/pickupCoin.mp3";

export class Fairy extends Sprite {
	i = 0;

	constructor(game: Game, tex: Texture) {
		super(game);
		this.w = 128;
		this.h = 128;
		this.texture = tex;
		this.r = Math.random() * Math.PI * 2;
		this.tile = (Math.random() * 4) | 0;
		this.x = Math.random() * 1600 + 100;
		this.y = Math.random() * 900 + 100;
		this.vx = (Math.random() - 0.5) * 5;
		this.vy = (Math.random() - 0.5) * 5;

		this.i = (Math.random() * 4) | 0;
	}

	update() {
		super.update();

		const game = this.texture?.renderer.game;
		if (!game) {
			return;
		}

		// Animation update
		if (--this.i < 0) {
			this.i = 4;
			this.tile = ++this.tile % 4;
		}

		// Rotation and gravity
		this.r += 0.05;
		this.vy += 0.1;

		// Handle boundary collisions
		this.handleBoundaryCollisions(game);
	}

	/**
	 * Handles collisions with screen boundaries
	 */
	private handleBoundaryCollisions(game: Game) {
		const MARGIN = 32;
		const BOUNCE_FACTOR = -0.9;

		// Check horizontal boundaries
		if (this.x < MARGIN) {
			this.x = MARGIN;
			this.bounceX(BOUNCE_FACTOR);
		} else if (this.x > game.width - MARGIN) {
			this.x = game.width - MARGIN;
			this.bounceX(BOUNCE_FACTOR);
		}

		// Check vertical boundaries
		if (this.y < MARGIN) {
			this.y = MARGIN;
			this.bounceY(BOUNCE_FACTOR);
		} else if (this.y > game.height - MARGIN) {
			this.y = game.height - MARGIN;
			this.bounceY(BOUNCE_FACTOR);
		}
	}

	/**
	 * Bounce on the X axis with the given factor
	 */
	private bounceX(factor: number) {
		this.vx *= factor;
		this.collide();
	}

	/**
	 * Bounce on the Y axis with the given factor
	 */
	private bounceY(factor: number) {
		this.vy *= factor;
		this.collide();
	}

	collide() {
		this.game.audio.play(pickupCoinAsset);
	}
}

export class Example extends Game {
	public readonly testSprite: Texture;

	constructor(public readonly wrap: HTMLElement) {
		super(wrap);

		this.testSprite = new Texture(this.render, "fairy", fairyAsset, "2D", 2, 2);

		// Create fewer fairies for better performance
		const FAIRY_COUNT = 100;
		for (let i = 0; i < FAIRY_COUNT; i++) {
			new Fairy(this, this.testSprite);
		}

		console.log(`Created ${FAIRY_COUNT} fairies`);
	}

	// Override the variableUpdate method to add custom behavior if needed
	protected override variableUpdate(_deltaTime: number): void {
		// Add any frame-rate independent updates here
	}
}

const wrap = document.querySelector<HTMLElement>("#app");
if (!wrap) {
	throw new Error("Can't query #app wrapper");
} else {
	new Example(wrap);
}
